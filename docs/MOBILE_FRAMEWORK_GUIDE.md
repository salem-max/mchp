# Mobile-First Framework - Developer Guide

A production-ready, mobile-first web application framework built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Zustand.

## 📁 Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes
│   └── api/                 # API routes
├── components/
│   ├── mobile/              # Mobile-optimized components
│   ├── 3d/                  # 3D/WebGL components
│   ├── layouts/             # Layout components
│   ├── ui/                  # Reusable UI components
│   └── ...                  # Feature-specific components
├── features/                # Feature modules (scalable structure)
│   ├── auth/
│   ├── jobs/
│   ├── customers/
│   └── ...
├── store/                   # Zustand stores (state management)
├── services/                # API client & service layer
├── hooks/                   # Custom React hooks
│   ├── mobile/              # Mobile-specific hooks
│   └── ...
├── utils/                   # Utility functions
│   ├── mobile/              # Mobile utilities
│   └── ...
├── lib/                     # Library utilities
├── public/                  # Static assets & PWA files
├── prisma/                  # Database schema
└── types/                   # TypeScript type definitions
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# For sandbox mode (no auth required)
pnpm run dev:sandbox

# For auth-enabled mode
pnpm run dev:auth
```

### Build & Deploy

```bash
# Build for production
pnpm run build

# Start production server
pnpm start
```

## 📱 Mobile Components

### Available Mobile Components

- **`MobileBottomTabs`** - Bottom navigation (tab bar)
- **`MobileHeader`** - Mobile-optimized header
- **`MobileCard`** - Flexible card component
- **`MobileButton`** - Touch-optimized button (44x44px minimum)
- **`MobileInput`** - Number and text inputs
- **`MobileDrawer`** - Bottom sheet modal
- **`MobileModal`** - Centered dialog
- **`MobileSafeArea`** - Notch/safe area handling

### Usage Example

```tsx
import {
  MobileLayout,
  MobileHeader,
  MobileCard,
  MobileButton,
  MobileBottomTabs,
} from '@/components/mobile';
import { Home, Briefcase } from 'lucide-react';

export default function HomePage() {
  const tabs = [
    { icon: <Home size={24} />, label: 'Home', href: '/' },
    { icon: <Briefcase size={24} />, label: 'Jobs', href: '/jobs' },
  ];

  return (
    <MobileLayout tabs={tabs}>
      <MobileHeader title="Dashboard" variant="primary" />
      
      <div className="px-4 space-y-4">
        <MobileCard>
          <h2>Welcome</h2>
          <p>Ready to get started?</p>
        </MobileCard>

        <MobileButton fullWidth onClick={() => {}}>
          Get Started
        </MobileButton>
      </div>
    </MobileLayout>
  );
}
```

## 🏪 State Management (Zustand)

### Available Stores

#### User Store

```tsx
import { useUserStore } from '@/store';

function Component() {
  const { user, isAuthenticated, setUser, logout } = useUserStore();
  
  return <div>{user?.name}</div>;
}
```

#### App Store

```tsx
import { useAppStore } from '@/store';

function Component() {
  const { isDarkMode, toggleDarkMode, addNotification } = useAppStore();
  
  return (
    <button onClick={() => addNotification('Success!', 'success')}>
      Toggle Theme
    </button>
  );
}
```

#### Jobs Store

```tsx
import { useJobsStore } from '@/store';

function Component() {
  const { jobs, addJob, updateJob, getFilteredJobs } = useJobsStore();
  
  const filteredJobs = getFilteredJobs();
  return <div>{filteredJobs.length} jobs</div>;
}
```

## 🔗 API Services

### Using the API Client

```tsx
import { apiClient, jobsService, authService } from '@/services';

// Direct API calls
const response = await apiClient.get('/jobs');
const created = await apiClient.post('/jobs', jobData);

// Using service layer
const jobs = await jobsService.getJobs();
const job = await jobsService.getJobById('123');
await jobsService.updateJob('123', updates);

// Auth service
await authService.login({ email, password });
await authService.logout();
```

## 📱 Mobile Hooks

### Responsive Design

```tsx
import { useIsMobile, useIsTablet, useMobileBreakpoint } from '@/hooks/mobile';

function Component() {
  const isMobile = useIsMobile();
  const { currentBreakpoint } = useMobileBreakpoint();
  
  if (isMobile) return <MobileLayout>{...}</MobileLayout>;
  return <DesktopLayout>{...}</DesktopLayout>;
}
```

### Mobile Utilities

```tsx
import { useMobileSafe, useOrientation, useNetworkStatus } from '@/hooks/mobile';
import { isTouchDevice, hapticFeedback, sendNotification } from '@/utils/mobile';

function Component() {
  const { isTouchDevice: isTouch } = useMobileSafe();
  const orientation = useOrientation();
  const isOnline = useNetworkStatus();
  
  const handleInteraction = () => {
    hapticFeedback('medium');
    sendNotification('Action completed!');
  };
}
```

## 🎨 3D/WebGL Components

### Using Rive Animations

```tsx
import { RiveAnimation } from '@/components/3d';

export default function Home() {
  return (
    <RiveAnimation
      src="/animations/hero.riv"
      stateMachines="heroAnimation"
      height="400px"
    />
  );
}
```

### Data Visualization

```tsx
import { DataVisualization3D } from '@/components/3d';

export default function Dashboard() {
  return (
    <DataVisualization3D title="Analytics" height="500px">
      {/* Your Three.js/Babylon.js content here */}
    </DataVisualization3D>
  );
}
```

## 🔐 PWA & Offline Support

### Enable PWA Features

```tsx
import { usePWA } from '@/hooks/usePWA';

export default function App() {
  const { isOnline, canInstall, installApp, isUpdating } = usePWA();
  
  return (
    <>
      {!isOnline && <OfflineNotice />}
      {canInstall && (
        <button onClick={installApp}>
          Install App
        </button>
      )}
      {isUpdating && <UpdateNotice />}
    </>
  );
}
```

### Service Worker

The service worker is automatically registered and handles:

- **Offline caching** - Essential files are cached
- **Background sync** - Queued API calls sync when online
- **Periodic updates** - Keep data fresh
- **State restoration** - Return from service worker updates

Service worker file: `/public/sw.js`

## ⚡ Performance Optimizations

### Image Optimization

```tsx
import Image from 'next/image';

export default function Avatar({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      sizes="(max-width: 768px) 40px, 48px"
      priority={false}
    />
  );
}
```

### Code Splitting & Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Canvas3DLoading />,
});

export default function Page() {
  return <HeavyComponent />;
}
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';

export const JobCard = memo(({ job, onUpdate }: Props) => {
  const formattedDate = useMemo(() => formatDate(job.date), [job.date]);
  const handleClick = useCallback(() => onUpdate(job.id), [job.id]);
  
  return <MobileCard onClick={handleClick}>{formattedDate}</MobileCard>;
});
```

### Bundle Analysis

```bash
pnpm run build --profile
# Analyze using Next.js built-in analyzer
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📖 Styling Guide

### Tailwind Classes

- **Mobile-first**: Start with base styles, add responsive modifiers
- **Dark mode**: All components support `dark:` prefix
- **Safe areas**: Use `safe-area-*` utilities for notch support

```tsx
// Good - Mobile first
<div className="px-4 py-3 md:px-6 dark:bg-slate-900">
  Content
</div>

// Button - Touch optimized
<button className="min-h-12 px-4 rounded-lg">
  Click me (44px minimum height)
</button>
```

## 🔧 Configuration

### ESLint & Prettier

Configured in `.eslintrc.json` and `.prettierrc`:

```bash
# Format code
pnpm format

# Lint
pnpm lint
```

### TypeScript

Configuration in `tsconfig.json`:

- Strict mode enabled
- Path aliases: `@/*`
- Modern ES2024 target

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://...
ENABLE_AUTH=true
SKIP_LOGIN=false
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Prisma](https://www.prisma.io)
- [Web APIs](https://developer.mozilla.org)

## 🤝 Contributing

1. Create a feature branch
2. Follow the existing code style
3. Add tests for new features
4. Submit a pull request

## 📝 License

MIT
