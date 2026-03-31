/**
 * AthlonX Icons - Central Export Point
 * 
 * Usage:
 *   // 1. Named imports (individual icons)
 *   import { BellIcon, MembersIcon, GearIcon } from '@/components/icons'
 *   <MembersIcon size={20} className="text-blue-500" />
 *
 *   // 2. Role-based icon maps (for dynamic sidebars)
 *   import { ADMIN_ICONS, TRAINER_ICONS, MEMBER_ICONS } from '@/components/icons'
 *   const Icon = ADMIN_ICONS['members']
 *   <Icon size={20} />
 *
 *   // 3. With Tailwind classes
 *   import { BellIcon } from '@/components/icons'
 *   <div className="group hover:text-amber-400">
 *     <BellIcon size={24} className="group-hover:text-amber-400 transition-colors" />
 *   </div>
 */

// Export all icons and role maps from AthlonXIcons
export {
  // Admin Icons
  AdminDashIcon,
  MembersIcon,
  TrainersIcon,
  StaffIcon,
  ClassesIcon,
  EquipmentIcon,
  CheckInIcon,
  AttendanceIcon,
  FinancialsIcon,
  TasksIcon,

  // Trainer Icons
  TrainerDashIcon,
  MyMembersIcon,
  MyScheduleIcon,
  MyClassesIcon,
  TrainerProgressIcon,
  ProgressNotesIcon,
  ReportsIcon,
  TrainerProfileIcon,

  // Member Icons
  MemberDashIcon,
  MyMembershipIcon,
  MemberProgressIcon,
  MyTrainerIcon,
  AvailableClassesIcon,
  MyBookingsIcon,
  MemberProfileIcon,

  // Shared Icons (all roles)
  BellIcon,
  GearIcon,

  // Role-based icon maps
  ADMIN_ICONS,
  TRAINER_ICONS,
  MEMBER_ICONS,

  // Types
  type IconProps,
} from './AthlonXIcons';
