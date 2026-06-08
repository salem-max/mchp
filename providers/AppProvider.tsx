import { ReactNode } from 'react';
import { Provider } from 'react-redux'; // No, Zustand is hook-based, no Provider needed
// Zustand doesn't require providers, but for organization, create context if needed.
// Actually, for multiple stores, optional Provider for hydration, but since persist middleware, no need.
// Create dummy for now to wrap layout.

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  return <>{children}</>;
}

// Later wrap with QueryProvider if TanStack needed.

