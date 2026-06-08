'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit2,
  Save,
  X,
  Eye,
  Eye as EyeOffIcon,
  Star,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  Check,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const AVAILABLE_SKILLS = [
  'Plumbing',
  'HVAC & Cooling',
  'Electrical',
  'Carpentry',
  'Painting',
  'Locksmith',
  'Appliance Repair',
  'Flooring',
  'Landscaping',
  'Cleaning',
];

interface TechnicianProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  available: boolean;
  avatar: string;
  rating: number;
  totalJobs: number;
  totalClients: number;
  completionRate: number;
  joinedDate: string;
}

const mockProfile: TechnicianProfile = {
  id: '1',
  name: 'Ahmad Hassan',
  phone: '+60123456789',
  email: 'ahmad@example.com',
  bio: 'Experienced plumber with 5+ years of expertise in residential and commercial plumbing solutions.',
  skills: ['Plumbing', 'Pipe Repair', 'Fixture Installation'],
  hourlyRate: 85,
  available: true,
  avatar: '/api/placeholder/128/128',
  rating: 4.8,
  totalJobs: 127,
  totalClients: 95,
  completionRate: 98,
  joinedDate: new Date('2022-01-15').toISOString(),
};

export default function TechnicianProfilePage() {
  const [profile, setProfile] = useState<TechnicianProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/technician/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    skills: profile.skills,
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/technician/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      });
      setNewSkill('');
      toast.success('Skill added');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleToggleAvailability = async () => {
    setIsSaving(true);
    try {
      const newAvailableStatus = !profile.available;
      const response = await fetch('/api/technician/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailableStatus }),
      });
      
      if (response.ok) {
        setProfile({ ...profile, available: newAvailableStatus });
        toast.success(`You are now ${newAvailableStatus ? 'available' : 'unavailable'}`);
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Update your information and manage your professional profile
          </p>
        </div>
        <div className="flex gap-2">
          {!showPublicProfile && (
            <Button
              variant="outline"
              onClick={() => setShowPublicProfile(true)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Button>
          )}
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {showPublicProfile ? (
        // Public Profile View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Button
            variant="outline"
            onClick={() => setShowPublicProfile(false)}
            className="mb-4"
          >
            ← Back to Edit
          </Button>

          {/* Public Profile Card */}
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {profile.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ({profile.totalJobs} jobs)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.totalJobs}
                    </p>
                    <p className="text-xs text-gray-600">Jobs Completed</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.totalClients}
                    </p>
                    <p className="text-xs text-gray-600">Happy Customers</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Check className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.completionRate}%
                    </p>
                    <p className="text-xs text-gray-600">Completion Rate</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">Hourly Rate</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    RM {profile.hourlyRate}/hour
                  </span>
                </div>

                {/* Member Since */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Member since:</span>{' '}
                  {new Date(profile.joinedDate).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : isEditing ? (
        // Edit View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold">
                    Email (Cannot be changed)
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Bio</CardTitle>
                <CardDescription>
                  Tell customers about your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Describe your experience, qualifications, and what makes you great at what you do..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Services</CardTitle>
                <CardDescription>
                  Add or remove skills you can perform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Skills */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Your Skills
                  </Label>
                  <div className="space-y-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                      >
                        <span className="text-gray-900">{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Skill */}
                <div>
                  <Label className="font-semibold mb-2 block">
                    Add New Skill
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select a skill...</option>
                      {AVAILABLE_SKILLS.map((skill) => (
                        <option
                          key={skill}
                          value={skill}
                          disabled={formData.skills.includes(skill)}
                        >
                          {skill}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAddSkill}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set your hourly rate for available jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">RM</span>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyRate: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="5"
                  />
                  <span className="text-gray-600">/hour</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Profile Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <Image
                    src={profile.avatar}
                    alt={formData.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                  />
                  <h3 className="font-bold text-gray-900">{formData.name}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                    {formData.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ) : (
        // View Mode
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profile.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {profile.rating}
                      </span>
                      <span className="text-sm text-gray-600">
                        • {profile.totalJobs} jobs
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                    Phone
                  </Label>
                  <p className="font-medium text-gray-900">{profile.phone}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                    Hourly Rate
                  </Label>
                  <p className="font-medium text-gray-900">
                    RM {profile.hourlyRate}/hour
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Skills & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} className="bg-blue-100 text-blue-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.totalJobs}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Jobs Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.totalClients}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Happy Customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.completionRate}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">On Time</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Availability Toggle */}
            <Card className={profile.available ? 'border-green-200' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`text-center py-3 rounded-lg ${
                    profile.available
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="font-semibold">
                    {profile.available ? '🟢 Available' : '⚫ Unavailable'}
                  </p>
                </div>
                <Button
                  onClick={handleToggleAvailability}
                  disabled={isSaving}
                  variant={profile.available ? 'outline' : 'default'}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : profile.available ? (
                    'Mark as Unavailable'
                  ) : (
                    'Mark as Available'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Member Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Member Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Joined</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.joinedDate).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Member ID</p>
                  <p className="font-medium text-gray-900">{profile.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
