import type { ComponentType } from 'react';

export type UserRole = 'super-admin' | 'restaurant-admin' | 'customer';

export interface SidebarItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  roles?: UserRole[];
}
