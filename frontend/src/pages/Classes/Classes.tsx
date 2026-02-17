"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import api, { ptSessionApi } from "../../services/api"
import { ScheduleHeader, ScheduleFilters, WeeklyCalendar, AddClassModal, StatsDashboard, type ClassData } from "./components"
import { useClasses } from "../../contexts/ClassesContext"
import "./Classes.css"
import type { User } from "../../types/user"
import { format, isToday, isTomorrow, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Calendar, Clock, Layers } from 'lucide-react'

// Import PTSessions component for the sessions tab
import PTSessions from "../PTSessions/PTSessions";

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
  const { setStats } = useClasses()

  // Tab state for consolidated pages
  const [activeTab, setActiveTab] = useState<'classes' | 'sessions' | 'schedule'>('classes')

  // Drawer/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [attendanceClass, setAttendanceClass] = useState<ClassData | null>(null)

  // Handle URL query param for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'sessions') {
      setActiveTab('sessions')
    } else if (tab === 'schedule') {
      setActiveTab('schedule')
    }
  }, [])

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

  // Update context with stats
  useEffect(() => {
    setStats(enhancedStats)
  }, [enhancedStats, setStats])

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

  const handleMarkAttendance = (classData: ClassData) => {
    setAttendanceClass(classData)
  }

  const handleConfirmAttendance = async (presentCount: number) => {
    if (!attendanceClass) return
    try {
      await api.put(`/api/classes/${attendanceClass.id}`, {
        ...attendanceClass,
        enrolled: presentCount,
      })
      toast.success(`Attendance marked: ${presentCount}/${attendanceClass.capacity} present`)
      setAttendanceClass(null)
      fetchClasses()
    } catch (err) {
      toast.error('Failed to mark attendance')
    }
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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'sessions':
        // Render PT Sessions component in full page
        return (
          <div className="classes-page__sessions">
            <PTSessions />
          </div>
        )
      case 'schedule':
        // Show combined schedule (Classes + Sessions) - currently just classes view
        return (
          <div className="classes-page__schedule">
            <WeeklyCalendar
              currentDate={currentDate}
              classes={filteredClasses}
              onClassClick={handleClassClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          </div>
        )
      default:
        // Default: Show Group Classes
        return (
          <>
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

            <StatsDashboard stats={enhancedStats} />

            <div className="classes-page__content">
              <WeeklyCalendar
                currentDate={currentDate}
                classes={filteredClasses}
                onClassClick={handleClassClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>
          </>
        )
    }
  }

  return (
    <div className="classes-page">
      {/* Tab Navigation */}
      <div className="classes-page__tabs">
        <button 
          className={`classes-page__tab ${activeTab === 'classes' ? 'classes-page__tab--active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <Calendar size={16} />
          <span>Group Classes</span>
        </button>
        <button 
          className={`classes-page__tab ${activeTab === 'sessions' ? 'classes-page__tab--active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Clock size={16} />
          <span>PT Sessions</span>
        </button>
        <button 
          className={`classes-page__tab ${activeTab === 'schedule' ? 'classes-page__tab--active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Layers size={16} />
          <span>Schedule Overview</span>
        </button>
      </div>

      {/* Tab Content */}
      {renderContent()}

      <AddClassModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClass}
        classData={editingClass}
        trainers={availableTrainers.map(t => t.fullName)}
        classTypes={CLASS_TYPES}
      />

      {/* Attendance Modal */}
      {attendanceClass && (
        <div className="attendance-modal-overlay" onClick={() => setAttendanceClass(null)}>
          <div className="attendance-modal" onClick={e => e.stopPropagation()}>
            <h3>Mark Attendance</h3>
            <p className="attendance-modal__class-name">{attendanceClass.name}</p>
            <p className="attendance-modal__meta">
              {attendanceClass.startTime} - {attendanceClass.endTime} &middot; Capacity: {attendanceClass.capacity}
            </p>
            <div className="attendance-modal__input-row">
              <label>Present:</label>
              <input
                id="attendance-count"
                type="number"
                min={0}
                max={attendanceClass.capacity}
                defaultValue={attendanceClass.enrolled}
                className="attendance-modal__input"
              />
              <span className="attendance-modal__of">/ {attendanceClass.capacity}</span>
            </div>
            <div className="attendance-modal__actions">
              <button className="btn-secondary" onClick={() => setAttendanceClass(null)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  const input = document.getElementById('attendance-count') as HTMLInputElement
                  handleConfirmAttendance(parseInt(input.value) || 0)
                }}
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classes
