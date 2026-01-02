"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import api, { ptSessionApi } from "../../services/api"
import { ScheduleHeader, ScheduleFilters, WeeklyCalendar, AddClassModal, type ClassData } from "./components"
import "./Classes.css"
import type { User } from "../../types/user"
import { format, isToday, isTomorrow, startOfWeek, addDays, isSameDay } from 'date-fns'

const CLASS_TYPES = ["Yoga", "HIIT", "Cardio", "Strength", "Pilates", "CrossFit"]

const CLASS_TYPE_ICONS: Record<string, React.ReactNode> = {
  Yoga: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"/></svg>,
  HIIT: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Cardio: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Strength: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M2 12h4M18 12h4M12 2v4M12 18v4"/></svg>,
  Pilates: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  CrossFit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M6 8H5a4 4 0 0 0 0 8h1M6 12h12"/></svg>,
  General: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<'today' | 'week' | 'custom'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState({
    type: "All",
    trainer: "All",
    status: "All",
  })
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([])

  // Drawer/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)

  // Fetch Trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const users = await api.getUsers('TRAINER')
        setAvailableTrainers(users)
      } catch (error) {
        console.error("Failed to fetch trainers", error)
      }
    }
    fetchTrainers()
  }, [])

  // Fetch classes
  const fetchClasses = async () => {
    setLoading(true)
    try {
      const data = await ptSessionApi.getAllSessions()

      if (data && data.length > 0) {
        const transformed: ClassData[] = data.map((session: any) => {
          // Try to parse metadata from notes if it exists
          let meta: any = {}
          try {
            if (session.progressNotes && session.progressNotes.startsWith('{')) {
              meta = JSON.parse(session.progressNotes)
            }
          } catch (e) {
            // Ignore parse errors
          }

          const dateObj = new Date(session.sessionDate);
          const localsDateStr = dateObj.toLocaleDateString('en-CA');

          const startH = String(dateObj.getHours()).padStart(2, '0');
          const startM = String(dateObj.getMinutes()).padStart(2, '0');

          // Calculate end time
          const endObj = new Date(dateObj.getTime() + (session.durationMinutes * 60000));
          const endH = String(endObj.getHours()).padStart(2, '0');
          const endM = String(endObj.getMinutes()).padStart(2, '0');

          return {
            id: session.sessionId || session.id,
            name: meta.name || session.sessionType || "PT Session",
            trainer: session.trainerName || "Unknown",
            startTime: `${startH}:${startM}`,
            endTime: `${endH}:${endM}`,
            date: localsDateStr,
            capacity: meta.capacity || 1,
            enrolled: meta.enrolled || (session.memberId ? 1 : 0),
            status: session.status === 'SCHEDULED' ? 'Available' : session.status,
            room: meta.room || "Gym Floor",
            type: meta.type || "General",
          }
        })
        setClasses(transformed)
      } else {
        setClasses([])
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error)
      toast.error("Failed to sync with database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (filter.type !== "All" && cls.type !== filter.type) return false
      if (filter.trainer !== "All" && cls.trainer !== filter.trainer) return false
      if (filter.status !== "All" && cls.status !== filter.status) return false
      return true
    })
  }, [classes, filter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredClasses.length
    const totalCapacity = filteredClasses.reduce((sum, c) => sum + c.capacity, 0)
    const totalEnrolled = filteredClasses.reduce((sum, c) => sum + c.enrolled, 0)
    const capacityPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
    return { total, capacityPercent }
  }, [filteredClasses])

  // Enhanced stats for premium dashboard
  const enhancedStats = useMemo(() => {
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))
    
    const todayClasses = classes.filter(c => c.date === todayStr)
    const weekClasses = classes.filter(c => weekDays.includes(c.date))
    
    const totalCapacity = weekClasses.reduce((sum, c) => sum + c.capacity, 0)
    const totalEnrolled = weekClasses.reduce((sum, c) => sum + c.enrolled, 0)
    const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
    
    const todayCapacity = todayClasses.reduce((sum, c) => sum + c.capacity, 0)
    const todayEnrolled = todayClasses.reduce((sum, c) => sum + c.enrolled, 0)
    const todayOccupancy = todayCapacity > 0 ? Math.round((todayEnrolled / todayCapacity) * 100) : 0
    
    const upcomingToday = todayClasses.filter(c => {
      const [h, m] = c.startTime.split(':').map(Number)
      const classTime = new Date()
      classTime.setHours(h, m, 0, 0)
      return classTime > now
    }).length
    
    const inProgressNow = todayClasses.filter(c => {
      const [startH, startM] = c.startTime.split(':').map(Number)
      const [endH, endM] = c.endTime.split(':').map(Number)
      const startTime = new Date()
      startTime.setHours(startH, startM, 0, 0)
      const endTime = new Date()
      endTime.setHours(endH, endM, 0, 0)
      return now >= startTime && now <= endTime
    }).length
    
    const typeBreakdown = CLASS_TYPES.reduce((acc, type) => {
      acc[type] = weekClasses.filter(c => c.type === type).length
      return acc
    }, {} as Record<string, number>)
    
    const mostPopularType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    
    const availableSpots = totalCapacity - totalEnrolled
    
    const fullClasses = weekClasses.filter(c => c.enrolled >= c.capacity).length
    
    return {
      todayTotal: todayClasses.length,
      todayEnrolled,
      todayCapacity,
      todayOccupancy,
      weekTotal: weekClasses.length,
      weekEnrolled: totalEnrolled,
      weekCapacity: totalCapacity,
      occupancyRate,
      upcomingToday,
      inProgressNow,
      typeBreakdown,
      mostPopularType,
      availableSpots,
      fullClasses,
      uniqueTrainers: [...new Set(weekClasses.map(c => c.trainer))].length,
    }
  }, [classes, currentDate])

  // Get date range string
  const getDateRange = () => {
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(start.setDate(diff))

    const end = new Date(monday)
    end.setDate(monday.getDate() + 6)

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${formatDate(monday)} – ${formatDate(end)}`
  }

  const handleClassClick = (classData: ClassData) => {
    setEditingClass(classData)
    setIsModalOpen(true)
  }

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const newClassDate = date.toLocaleDateString('en-CA');

    // Safety check for past dates on click
    const now = new Date();
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);

    if (clickedDate < now) {
      toast.error("Cannot schedule in the past");
      return;
    }

    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

    setEditingClass({
      id: 0,
      name: '',
      trainer: '',
      startTime,
      endTime,
      date: newClassDate,
      capacity: 15,
      enrolled: 0,
      status: 'Available',
      room: 'Studio A',
      type: 'General'
    } as ClassData);
    setIsModalOpen(true);
  }

  const handleSaveClass = async (classData: Partial<ClassData>) => {
    try {
      const targetDate = classData.date || new Date().toLocaleDateString('en-CA');
      const startParts = (classData.startTime || "09:00").split(':').map(Number);

      // 1. Validate Future Date (Backend Constraint)
      const sessionDateTime = new Date(`${targetDate}T${classData.startTime || "09:00"}:00`);
      if (sessionDateTime < new Date()) {
        toast.error("Cannot schedule classes in the past. Please select a future time.");
        return;
      }

      // 2. Conflict Detection
      const endParts = (classData.endTime || "10:00").split(':').map(Number);
      const newStartMinutes = startParts[0] * 60 + startParts[1];
      const newEndMinutes = endParts[0] * 60 + endParts[1];

      const hasConflict = classes.some(cls => {
        // Skip self when editing
        if (editingClass && cls.id === editingClass.id) return false;

        // Check Room and Date (Exact match)
        if (cls.room !== classData.room || cls.date !== targetDate) return false;

        // Check Time Overlap
        const [clsStartH, clsStartM] = cls.startTime.split(':').map(Number);
        const [clsEndH, clsEndM] = cls.endTime.split(':').map(Number);
        const clsStartMinutes = clsStartH * 60 + clsStartM;
        const clsEndMinutes = clsEndH * 60 + clsEndM;

        // Conflict formula: Overlaps if (StartA < EndB) and (EndA > StartB)
        return (newStartMinutes < clsEndMinutes && newEndMinutes > clsStartMinutes);
      });

      if (hasConflict) {
        toast.error(`Room ${classData.room} is fully booked at this time!`);
        return;
      }

      // Find trainer ID
      const selectedTrainer = availableTrainers.find(t => t.fullName === classData.trainer);
      const trainerId = selectedTrainer ? selectedTrainer.userId : 2;

      // Calculate duration
      const durationMinutes = newEndMinutes - newStartMinutes;

      // Metadata to store in notes
      const metadata = {
        name: classData.name,
        type: classData.type,
        room: classData.room,
        capacity: classData.capacity,
        enrolled: classData.enrolled || 0
      };

      const payload = {
        trainerId,
        memberId: 1,
        sessionDate: `${targetDate}T${classData.startTime || "09:00"}:00`,
        durationMinutes: durationMinutes > 0 ? durationMinutes : 60,
        status: 'SCHEDULED',
        progressNotes: JSON.stringify(metadata)
      };

      if (editingClass && editingClass.id && editingClass.id !== 0) {
        // Update
        await ptSessionApi.updateSession(Number(editingClass.id), payload as any);
        toast.success('Class updated successfully');
      } else {
        // Create
        await ptSessionApi.createSession(payload as any);
        toast.success('Class created successfully');
      }

      setIsModalOpen(false);
      setEditingClass(null);
      fetchClasses(); // Refresh data

    } catch (error: any) {
      console.error("Failed to save class:", error);
      const msg = error.response?.data?.message || "Failed to save class. Ensure time is valid.";
      toast.error(msg);
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClass(null)
  }

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
    setSelectedDay('week')
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
    setSelectedDay('week')
  }

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date)
    setSelectedDay('week')
  }

  if (loading && classes.length === 0) {
    return (
      <div className="classes-page">
        <div className="classes-page__loading">
          <div className="loading-spinner" />
          <span>Syncing with database...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="classes-page">
      <ScheduleHeader
        dateRange={getDateRange()}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onDateSelect={handleDateSelect}
      >
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
          trainers={availableTrainers.map(t => t.fullName)}
          onAddClass={() => {
            setEditingClass(null)
            setIsModalOpen(true)
          }}
        />
      </ScheduleHeader>

      {/* Premium Stats Dashboard */}
      <div className="classes-stats-dashboard">
        <div className="stats-dashboard__row">
          {/* Today's Overview Card */}
          <div className="stats-card stats-card--today">
            <div className="stats-card__header">
              <div className="stats-card__icon stats-card__icon--today">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="stats-card__label">Today</span>
              {enhancedStats.inProgressNow > 0 && (
                <span className="stats-card__live-badge">
                  <span className="live-dot"></span>
                  {enhancedStats.inProgressNow} Live
                </span>
              )}
            </div>
            <div className="stats-card__content">
              <div className="stats-card__main-value">{enhancedStats.todayTotal}</div>
              <div className="stats-card__sub-label">classes scheduled</div>
            </div>
            <div className="stats-card__footer">
              <div className="stats-card__detail">
                <span className="detail-value">{enhancedStats.upcomingToday}</span>
                <span className="detail-label">upcoming</span>
              </div>
              <div className="stats-card__detail">
                <span className="detail-value">{enhancedStats.todayEnrolled}/{enhancedStats.todayCapacity}</span>
                <span className="detail-label">enrolled</span>
              </div>
              <div className="stats-card__progress-mini">
                <div className="progress-mini__bar">
                  <div className="progress-mini__fill" style={{ width: `${enhancedStats.todayOccupancy}%` }}></div>
                </div>
                <span className="progress-mini__text">{enhancedStats.todayOccupancy}%</span>
              </div>
            </div>
          </div>

          {/* Week Overview Card */}
          <div className="stats-card stats-card--week">
            <div className="stats-card__header">
              <div className="stats-card__icon stats-card__icon--week">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="stats-card__label">This Week</span>
            </div>
            <div className="stats-card__content">
              <div className="stats-card__main-value">{enhancedStats.weekTotal}</div>
              <div className="stats-card__sub-label">total classes</div>
            </div>
            <div className="stats-card__footer">
              <div className="stats-card__detail">
                <span className="detail-value">{enhancedStats.uniqueTrainers}</span>
                <span className="detail-label">trainers</span>
              </div>
              <div className="stats-card__detail">
                <span className="detail-value">{enhancedStats.fullClasses}</span>
                <span className="detail-label">full</span>
              </div>
              <div className="stats-card__detail">
                <span className="detail-value">{enhancedStats.availableSpots}</span>
                <span className="detail-label">spots left</span>
              </div>
            </div>
          </div>

          {/* Occupancy Card */}
          <div className="stats-card stats-card--occupancy">
            <div className="stats-card__header">
              <div className="stats-card__icon stats-card__icon--occupancy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="stats-card__label">Occupancy Rate</span>
            </div>
            <div className="stats-card__content">
              <div className="stats-card__main-value stats-card__main-value--gradient">
                {enhancedStats.occupancyRate}%
              </div>
              <div className="stats-card__sub-label">{enhancedStats.weekEnrolled} of {enhancedStats.weekCapacity} spots filled</div>
            </div>
            <div className="stats-card__occupancy-bar">
              <div 
                className="occupancy-bar__fill" 
                style={{ width: `${enhancedStats.occupancyRate}%` }}
              >
                <div className="occupancy-bar__glow"></div>
              </div>
            </div>
          </div>

          {/* Popular Classes Card */}
          <div className="stats-card stats-card--popular">
            <div className="stats-card__header">
              <div className="stats-card__icon stats-card__icon--popular">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span className="stats-card__label">Class Types</span>
            </div>
            <div className="stats-card__type-grid">
              {CLASS_TYPES.slice(0, 6).map(type => (
                <div key={type} className={`type-pill ${enhancedStats.typeBreakdown[type] > 0 ? 'type-pill--active' : ''}`}>
                  <span className="type-pill__icon">{CLASS_TYPE_ICONS[type]}</span>
                  <span className="type-pill__name">{type}</span>
                  <span className="type-pill__count">{enhancedStats.typeBreakdown[type] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="classes-page__content">
        <WeeklyCalendar
          currentDate={currentDate}
          classes={filteredClasses}
          onClassClick={handleClassClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      </div>

      <AddClassModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClass}
        classData={editingClass}
        trainers={availableTrainers.map(t => t.fullName)}
        classTypes={CLASS_TYPES}
      />
    </div>
  )
}

export default Classes
