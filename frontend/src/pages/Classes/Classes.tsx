"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import { ptSessionApi } from "../../services/api"
import { ScheduleHeader, ScheduleFilters, DaySection, ClassFormDrawer, type ClassData } from "./components"
import "./Classes.css"

// Class types for filtering
const CLASS_TYPES = ["Yoga", "HIIT", "Cardio", "Strength", "Pilates", "CrossFit"]

// Mock data generator for demo
const generateMockClasses = (): ClassData[] => {
  const trainers = ["Sarah Miller", "John Davis", "Emma Wilson", "Mike Chen", "Lisa Park"]
  const rooms = ["Studio A", "Studio B", "Main Hall", "Gym Floor"]
  const statuses: ("Available" | "Full" | "Cancelled")[] = ["Available", "Available", "Available", "Full", "Cancelled"]

  const classes: ClassData[] = []
  const today = new Date()

  // Generate classes for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(today.getDate() + dayOffset)
    const dateStr = date.toISOString().split('T')[0]

    // Generate 3-6 classes per day
    const numClasses = Math.floor(Math.random() * 4) + 3
    const usedTimes = new Set<string>()

    for (let i = 0; i < numClasses; i++) {
      let startHour = Math.floor(Math.random() * 12) + 6 // 6am to 6pm
      while (usedTimes.has(String(startHour))) {
        startHour = Math.floor(Math.random() * 12) + 6
      }
      usedTimes.add(String(startHour))

      const startTime = `${String(startHour).padStart(2, '0')}:00`
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`
      const type = CLASS_TYPES[Math.floor(Math.random() * CLASS_TYPES.length)]
      const capacity = Math.floor(Math.random() * 15) + 8
      const enrolled = Math.floor(Math.random() * capacity)
      const status = enrolled >= capacity ? "Full" : statuses[Math.floor(Math.random() * statuses.length)]

      classes.push({
        id: dayOffset * 10 + i + 1,
        name: `${type} Class`,
        trainer: trainers[Math.floor(Math.random() * trainers.length)],
        startTime,
        endTime,
        date: dateStr,
        capacity,
        enrolled: status === "Full" ? capacity : enrolled,
        status: status === "Cancelled" ? "Cancelled" : (enrolled >= capacity ? "Full" : "Available"),
        room: rooms[Math.floor(Math.random() * rooms.length)],
        type,
      })
    }
  }

  return classes.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<'today' | 'week' | 'custom'>('week')
  const [filter, setFilter] = useState({
    type: "All",
    trainer: "All",
    status: "All",
  })

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)

  // Use ref to store mock data so it doesn't regenerate on re-renders
  const mockDataRef = useRef<ClassData[] | null>(null)

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        // Try to fetch from API
        const data = await ptSessionApi.getAllSessions()
        if (data && data.length > 0) {
          // Transform API data to ClassData format
          const transformed: ClassData[] = data.map((session: any) => ({
            id: session.sessionId || session.id,
            name: session.sessionType || session.name || "Class",
            trainer: session.trainerName || session.trainer || "Unknown",
            startTime: session.startTime || "09:00",
            endTime: session.endTime || "10:00",
            date: session.sessionDate || new Date().toISOString().split('T')[0],
            capacity: session.capacity || 15,
            enrolled: session.enrolled || 0,
            status: session.status || "Available",
            room: session.location || session.room || "Studio A",
            type: session.sessionType || session.type || "General",
          }))
          setClasses(transformed)
        } else {
          // Use mock data if no API data
          setClasses(generateMockClasses())
        }
      } catch (error) {
        console.log("Using mock class data")
        setClasses(generateMockClasses())
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  // Get unique trainers from classes
  const trainers = useMemo(() => {
    return Array.from(new Set(classes.map(c => c.trainer)))
  }, [classes])

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (filter.type !== "All" && cls.type !== filter.type) return false
      if (filter.trainer !== "All" && cls.trainer !== filter.trainer) return false
      if (filter.status !== "All" && cls.status !== filter.status) return false
      return true
    })
  }, [classes, filter])

  // Group classes by date
  const groupedByDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const groups: Map<string, ClassData[]> = new Map()

    filteredClasses.forEach(cls => {
      const dateKey = cls.date
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(cls)
    })

    // Filter based on selected day
    if (selectedDay === 'today') {
      const todayStr = today.toISOString().split('T')[0]
      const todayClasses = groups.get(todayStr) || []
      return new Map([[todayStr, todayClasses]])
    }

    return groups
  }, [filteredClasses, selectedDay])

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredClasses.length
    const totalCapacity = filteredClasses.reduce((sum, c) => sum + c.capacity, 0)
    const totalEnrolled = filteredClasses.reduce((sum, c) => sum + c.enrolled, 0)
    const capacityPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
    return { total, capacityPercent }
  }, [filteredClasses])

  // Get date range string
  const getDateRange = () => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 6)

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${formatDate(today)} – ${formatDate(endDate)}`
  }

  const handleClassClick = (classData: ClassData) => {
    // Open edit drawer
    setEditingClass(classData)
    setIsDrawerOpen(true)
  }

  const handleAddClass = () => {
    setEditingClass(null)
    setIsDrawerOpen(true)
  }

  const handleEditClass = (classData: ClassData) => {
    setEditingClass(classData)
    setIsDrawerOpen(true)
  }

  const handleCancelClass = (classData: ClassData) => {
    // Mark class as cancelled
    setClasses(prev => prev.map(cls =>
      cls.id === classData.id
        ? { ...cls, status: 'Cancelled' as const }
        : cls
    ))
    toast.success(`${classData.name} has been cancelled`)
  }

  const handleSaveClass = (classData: Partial<ClassData>) => {
    if (editingClass) {
      // Update existing class
      setClasses(prev => prev.map(cls =>
        cls.id === editingClass.id
          ? { ...cls, ...classData } as ClassData
          : cls
      ))
      toast.success('Class updated successfully')
    } else {
      // Add new class
      const newClass: ClassData = {
        id: Date.now(),
        name: classData.name || 'New Class',
        trainer: classData.trainer || 'Unknown',
        startTime: classData.startTime || '09:00',
        endTime: classData.endTime || '10:00',
        date: classData.date || new Date().toISOString().split('T')[0],
        capacity: classData.capacity || 15,
        enrolled: 0,
        status: 'Available',
        room: classData.room || 'Studio A',
        type: classData.type || 'General',
      }
      setClasses(prev => [...prev, newClass])
      toast.success('Class created successfully')
    }
    setIsDrawerOpen(false)
    setEditingClass(null)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingClass(null)
  }

  if (loading) {
    return (
      <div className="classes-page">
        <div className="classes-page__loading">
          <div className="loading-spinner" />
          <span>Loading schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="classes-page">
      {/* Header */}
      <ScheduleHeader
        totalClasses={stats.total}
        capacityPercent={stats.capacityPercent}
        dateRange={getDateRange()}
      />

      {/* Filters */}
      <ScheduleFilters
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        classType={filter.type}
        onClassTypeChange={(type) => setFilter(prev => ({ ...prev, type }))}
        trainer={filter.trainer}
        onTrainerChange={(trainer) => setFilter(prev => ({ ...prev, trainer }))}
        status={filter.status}
        onStatusChange={(status) => setFilter(prev => ({ ...prev, status }))}
        classTypes={CLASS_TYPES}
        trainers={trainers}
        onAddClass={handleAddClass}
      />

      {/* Agenda View - Classes grouped by day */}
      <div className="classes-page__content">
        {groupedByDate.size > 0 ? (
          Array.from(groupedByDate.entries()).map(([dateStr, dayClasses]) => {
            const date = new Date(dateStr)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isToday = date.toDateString() === today.toDateString()

            return (
              <DaySection
                key={dateStr}
                date={date}
                classes={dayClasses}
                isToday={isToday}
                onClassClick={handleClassClick}
                onEdit={handleEditClass}
                onCancel={handleCancelClass}
              />
            )
          })
        ) : (
          <div className="classes-page__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>No classes found</h3>
            <p>Try adjusting your filters or add a new class.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Class Drawer */}
      <ClassFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveClass}
        classData={editingClass}
        trainers={trainers}
        classTypes={CLASS_TYPES}
      />
    </div>
  )
}

export default Classes
