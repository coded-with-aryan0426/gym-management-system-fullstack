# 🎨 AthlonX Icons Library

Self-contained animated SVG icon library for AthlonX V2 gym management system.

## 📍 Location
```
frontend/src/components/icons/
├── AthlonXIcons.tsx    (main icon file with animations)
├── index.ts            (central export point)
└── README.md           (this file)
```

## 🚀 Usage

### 1️⃣ Named Imports (Individual Icons)
```typescript
import { MembersIcon, BellIcon, GearIcon } from '@/components/icons'

<MembersIcon size={20} className="text-blue-500" />
<BellIcon size={24} className="text-amber-400" />
```

### 2️⃣ Role-Based Icon Maps (Dynamic Sidebars)
```typescript
import { ADMIN_ICONS, TRAINER_ICONS, MEMBER_ICONS } from '@/components/icons'

// For Owner/Admin sidebar
const AdminIcon = ADMIN_ICONS['members']     // MembersIcon
const DashIcon = ADMIN_ICONS['dashboard']    // AdminDashIcon

// For Trainer sidebar
const TrainerIcon = TRAINER_ICONS['schedule'] // MyScheduleIcon

// For Member sidebar
const MemberIcon = MEMBER_ICONS['progress']  // MemberProgressIcon
```

### 3️⃣ With Tailwind & Animations
```typescript
import { BellIcon } from '@/components/icons'

<li className="group flex items-center gap-2 cursor-pointer">
  <BellIcon 
    size={20} 
    className="group-hover:text-amber-400 transition-colors" 
  />
  <span>Notifications</span>
</li>
```

## 📦 Icon Props

All icons accept the same props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `24` | Width & height in pixels |
| `className` | `string` | `''` | Tailwind or CSS classes (controls color via `currentColor`) |
| `style` | `CSSProperties` | — | Inline style overrides |
| `label` | `string` | icon name | ARIA label for accessibility |

**Example:**
```typescript
<MembersIcon 
  size={22} 
  className="text-blue-500 hover:text-blue-700"
  label="Gym Members"
/>
```

## 🎬 Animations

All icons include built-in animations that trigger on hover:

- **BellIcon** - Swing animation (notification bell)
- **GearIcon** - Spin animation (settings)
- **TasksIcon** - Check draw animation
- **FinancialsIcon** - Bar chart animation
- **TrainerDashIcon** - Pulse animation
- **MemberProgressIcon** - Trend line animation
- **AttendanceIcon** - Pulsate animation
- **And more...** (see AthlonXIcons.tsx for full list)

Animations are CSS-injected once on app startup. No extra setup needed—just use the icons!

## 📋 Available Icons

### Admin/Owner (12 icons)
- `AdminDashIcon` - Dashboard overview
- `MembersIcon` - Member management
- `TrainersIcon` - Trainer management
- `StaffIcon` - Staff management
- `ClassesIcon` - Class scheduling
- `EquipmentIcon` - Equipment inventory
- `CheckInIcon` - Member check-in
- `AttendanceIcon` - Attendance tracking
- `FinancialsIcon` - Financial dashboard
- `TasksIcon` - Task management
- `BellIcon` - Notifications (shared)
- `GearIcon` - Settings (shared)

### Trainer (8 icons)
- `TrainerDashIcon` - Dashboard
- `MyMembersIcon` - Assigned clients
- `MyScheduleIcon` - Session schedule
- `MyClassesIcon` - Classes teaching
- `TrainerProgressIcon` - Client progress
- `ProgressNotesIcon` - Progress notes
- `ReportsIcon` - Reports & analytics
- `TrainerProfileIcon` - Profile

### Member (7 icons)
- `MemberDashIcon` - Dashboard
- `MyMembershipIcon` - Membership details
- `MemberProgressIcon` - Progress tracking
- `MyTrainerIcon` - Trainer profile
- `AvailableClassesIcon` - Browse classes
- `MyBookingsIcon` - Class bookings
- `MemberProfileIcon` - Profile

### Shared (2 icons)
- `BellIcon` - Notifications
- `GearIcon` - Settings

## 🎯 Role Icon Maps

```typescript
// Admin/Owner sidebar
export const ADMIN_ICONS = {
  dashboard: AdminDashIcon,
  members: MembersIcon,
  trainers: TrainersIcon,
  staff: StaffIcon,
  classes: ClassesIcon,
  equipment: EquipmentIcon,
  check_in: CheckInIcon,
  attendance: AttendanceIcon,
  financials: FinancialsIcon,
  tasks: TasksIcon,
  notifications: BellIcon,
  settings: GearIcon,
}

// Trainer sidebar
export const TRAINER_ICONS = {
  dashboard: TrainerDashIcon,
  members: MyMembersIcon,
  schedule: MyScheduleIcon,
  classes: MyClassesIcon,
  progress: TrainerProgressIcon,
  notes: ProgressNotesIcon,
  reports: ReportsIcon,
  profile: TrainerProfileIcon,
  notifications: BellIcon,
  settings: GearIcon,
}

// Member sidebar
export const MEMBER_ICONS = {
  dashboard: MemberDashIcon,
  membership: MyMembershipIcon,
  progress: MemberProgressIcon,
  trainer: MyTrainerIcon,
  classes: AvailableClassesIcon,
  bookings: MyBookingsIcon,
  profile: MemberProfileIcon,
  notifications: BellIcon,
  settings: GearIcon,
}
```

## 💡 Best Practices

1. **Always use named imports** for single icons:
   ```typescript
   import { BellIcon } from '@/components/icons'
   ```

2. **Use role maps** for dynamic sidebars with loops:
   ```typescript
   import { ADMIN_ICONS } from '@/components/icons'
   
   navItems.map(item => {
     const Icon = ADMIN_ICONS[item.key]
     return <Icon size={20} />
   })
   ```

3. **Combine with Tailwind** for responsive styling:
   ```typescript
   <BellIcon size={20} className="text-gray-500 hover:text-amber-400 transition-colors" />
   ```

4. **Add accessibility labels** for important icons:
   ```typescript
   <MembersIcon size={20} label="Manage Gym Members" />
   ```

## 🔧 Customization

To modify animations or add new icons, edit `AthlonXIcons.tsx`:

1. Add your animation to the `CSS` constant at the top
2. Create a new export function with `IconProps`
3. Export it from index.ts
4. Add to appropriate role map (ADMIN_ICONS, TRAINER_ICONS, or MEMBER_ICONS)

## 📞 Support

For issues or questions about the icons library, refer to `AthlonXIcons.tsx` header documentation.
