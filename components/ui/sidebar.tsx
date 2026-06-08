'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Lightweight sidebar primitives used by dashboard layouts.
// If you already have a sidebar implementation, you can replace these.

export function Sidebar({
  className,
  ...props
}: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'hidden lg:flex h-screen w-72 flex-col',
        className
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('px-4 py-3', className)} {...props} />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex-1 overflow-auto', className)} {...props} />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  return (
    <nav className={cn('space-y-1', className)} {...props} />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn(className)} {...props} />;
}

type SidebarMenuButtonProps = {
  asChild?: boolean;
  isActive?: boolean;
} & React.ComponentProps<'button'>;

// Simple replacement for shadcn/ui sidebar button.
// We keep `asChild` for compatibility, but only support it when given a valid child element.
export function SidebarMenuButton({
  className,
  asChild,
  isActive,
  ...props
}: SidebarMenuButtonProps) {
  const classes = cn(
    'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    'hover:bg-primary/10',
    isActive && 'bg-primary/10 text-primary hover:bg-primary/20',
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return <button className={classes} {...props} />;
}

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Placeholder for compatibility. Current Sidebar is always visible on lg+.
  return <>{children}</>;
}

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  // Placeholder: dashboard header uses this for mobile, but we hide sidebar on mobile.
  return (
    <button
      type="button"
      className={cn('lg:hidden', className)}
      {...props}
    />
  );
}

