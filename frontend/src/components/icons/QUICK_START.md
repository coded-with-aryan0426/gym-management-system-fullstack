# 🚀 AthlonX Icons - Quick Start

## 📍 Location
```
frontend/src/components/icons/
```

## 3️⃣ Ways to Use

### 1️⃣ Single Icon Import
```typescript
import { BellIcon, MembersIcon } from '@/components/icons'

<BellIcon size={20} className="text-gray-400 group-hover:text-amber-400" />
<MembersIcon size={24} />
```

### 2️⃣ Role Icon Maps (Best for Sidebars)
```typescript
import { ADMIN_ICONS, TRAINER_ICONS, MEMBER_ICONS } from '@/components/icons'

// Use with dynamic sidebar
const Icon = ADMIN_ICONS['members']
<Icon size={20} className="text-blue-500" />
```

### 3️⃣ With Tailwind (Parent Hover)
```typescript
import { MembersIcon } from '@/components/icons'

<li className="group flex items-center gap-2 cursor-pointer">
  <MembersIcon size={20} className="group-hover:text-amber-400 transition-colors" />
  <span>Members</span>
</li>
```

## 📦 Props (All Icons)
| Prop | Type | Default |
|------|------|---------|
| `size` | number | 24 |
| `className` | string | '' |
| `style` | CSSProperties | — |
| `label` | string | icon name |

## 📋 Icon Names & Keys

### Admin/Owner
```
'dashboard'   → AdminDashIcon
'members'     → MembersIcon
'trainers'    → TrainersIcon
'staff'       → StaffIcon
'classes'     → ClassesIcon
'equipment'   → EquipmentIcon
'check_in'    → CheckInIcon
'attendance'  → AttendanceIcon
'financials'  → FinancialsIcon
'tasks'       → TasksIcon
'notifications' → BellIcon
'settings'    → GearIcon
```

### Trainer
```
'dashboard'   → TrainerDashIcon
'members'     → MyMembersIcon
'schedule'    → MyScheduleIcon
'classes'     → MyClassesIcon
'progress'    → TrainerProgressIcon
'notes'       → ProgressNotesIcon
'reports'     → ReportsIcon
'profile'     → TrainerProfileIcon
'notifications' → BellIcon
'settings'    → GearIcon
```

### Member
```
'dashboard'   → MemberDashIcon
'membership'  → MyMembershipIcon
'progress'    → MemberProgressIcon
'trainer'     → MyTrainerIcon
'classes'     → AvailableClassesIcon
'bookings'    → MyBookingsIcon
'profile'     → MemberProfileIcon
'notifications' → BellIcon
'settings'    → GearIcon
```

## ✨ Built-in Animations
All icons have automatic hover animations:
- Bell → Swing
- Gear → Spin
- Chart/Progress → Draw/Trend
- No setup needed!

## 📖 Full Documentation
See `README.md` in this directory for complete details.
