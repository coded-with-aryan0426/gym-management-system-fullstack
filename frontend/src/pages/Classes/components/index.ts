export { default as ScheduleHeader } from './ScheduleHeader'
export { default as ScheduleFilters } from './ScheduleFilters'
export { default as DaySection } from './DaySection'
export { default as ClassCard } from './ClassCard'
export { default as ClassFormDrawer } from './ClassFormDrawer'
export { default as StatsDashboard } from './StatsDashboard'
export * from './WeeklyCalendar'
export * from './AddClassModal'

export type ClassData = {
    id: number | string
    name: string
    trainer: string
    startTime: string
    endTime: string
    date: string
    capacity: number
    enrolled: number
    status: 'Available' | 'Full' | 'Cancelled'
    room: string
    type: string
}
