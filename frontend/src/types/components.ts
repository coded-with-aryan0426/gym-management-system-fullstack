// Component prop type definitions
import type { UserSummary } from './user';

export interface UserCardProps {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  plan?: string;
  status: 'active' | 'expired';
  onClick?: () => void;
}

export interface CategoryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  users: UserSummary[];
  onViewAll: () => void;
  onAddNew: () => void;
}

export interface StatusBadgeProps {
  status: 'active' | 'expired';
}

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface NavbarProps {
  onLogout: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface QuickActionsProps {
  onAddMember: () => void;
  onScheduleClass: () => void;
  onManageBilling: () => void;
  onManageStaff: () => void;
  onManagePayment: () => void;
}
