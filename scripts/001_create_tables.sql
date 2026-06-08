-- FixSwift Database Schema
-- Run this script to create all necessary tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technician profiles (additional info for technicians)
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  hourly_rate DECIMAL(10, 2),
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  service_radius_km INTEGER DEFAULT 25,
  is_available BOOLEAN DEFAULT true,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job bids (technicians bidding on jobs)
CREATE TABLE IF NOT EXISTS public.job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, technician_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Technician profiles policies
CREATE POLICY "Anyone can view technician profiles" ON public.technician_profiles FOR SELECT USING (true);
CREATE POLICY "Technicians can update own profile" ON public.technician_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Technicians can insert own profile" ON public.technician_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Customers can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Job owners and assigned technicians can update" ON public.jobs FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = technician_id);
CREATE POLICY "Job owners can delete" ON public.jobs FOR DELETE USING (auth.uid() = customer_id);

-- Job bids policies
CREATE POLICY "Job owners and bidders can view bids" ON public.job_bids FOR SELECT USING (
  auth.uid() IN (SELECT customer_id FROM public.jobs WHERE id = job_id) OR auth.uid() = technician_id
);
CREATE POLICY "Technicians can create bids" ON public.job_bids FOR INSERT WITH CHECK (auth.uid() = technician_id);
CREATE POLICY "Technicians can update own bids" ON public.job_bids FOR UPDATE USING (auth.uid() = technician_id);
CREATE POLICY "Technicians can delete own bids" ON public.job_bids FOR DELETE USING (auth.uid() = technician_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for jobs they participated in" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages policies
CREATE POLICY "Job participants can view messages" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT customer_id FROM public.jobs WHERE id = job_id) OR
  auth.uid() IN (SELECT technician_id FROM public.jobs WHERE id = job_id)
);
CREATE POLICY "Job participants can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() IN (SELECT customer_id FROM public.jobs WHERE id = job_id) OR
    auth.uid() IN (SELECT technician_id FROM public.jobs WHERE id = job_id)
  )
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user is a technician, create technician profile
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'customer') = 'technician' THEN
    INSERT INTO public.technician_profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_technician_profiles_updated_at BEFORE UPDATE ON public.technician_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
