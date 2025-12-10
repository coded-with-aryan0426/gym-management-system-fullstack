"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Button, Card } from "../../components/ui"
import { ptSessionApi } from "../../services/api"
import "./Classes.css"

interface GymClass {
  id: number
  name: string
  trainer: string
  time: string
  displayTime?: string
  day: string
  capacity: number
  enrolled: number
  status: "Available" | "Busy" | "Full" | "Capacity"
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIMES = ["6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<GymClass[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const loadClasses = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch sessions from multiple trainers (85-90 have sessions)
      const trainerIds = [85, 86, 87, 88, 89, 90]
      const allSessions = await Promise.all(
        trainerIds.map(id => ptSessionApi.getTrainerSessions(id).catch(() => []))
      )
      const sessions = allSessions.flat()
      
      console.log("[Classes] Raw sessions from API:", sessions)

      // Transform real session data to class format
      const transformed: GymClass[] = sessions.map((session, idx) => {
        const sessionDate = new Date(session.sessionDate)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const hours = sessionDate.getHours()
        const minutes = sessionDate.getMinutes()

        // Use 24-hour format for matching with TIMES array
        const timeStr24 = `${hours}:00`
        // Display time in 12-hour format
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
        
        // Determine status based on session status
        let classStatus: GymClass["status"] = "Available"
        if (session.status === "COMPLETED") classStatus = "Full"
        else if (session.status === "CANCELLED") classStatus = "Capacity"
        else if (session.status === "SCHEDULED") classStatus = "Busy"
        
        return {
          id: session.sessionId || idx,
          name: session.workoutPlan || `PT Session ${idx + 1}`,
          trainer: session.trainerName || 'Unknown Trainer',
          time: timeStr24, // Use 24-hour format for grid matching
          displayTime: displayTime, // Use 12-hour for display
          day: dayNames[sessionDate.getDay()],
          capacity: 1, // PT sessions are typically 1:1
          enrolled: session.status === "SCHEDULED" || session.status === "COMPLETED" ? 1 : 0,
          status: classStatus,
        }
      })

      console.log("[Classes] Transformed classes:", transformed)
      setClasses(transformed)
    } catch (err) {
      console.error("[Beta] Failed to load classes from backend:", err)
      // For beta testing: show empty state instead of demo data
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const getCapacityPercent = (enrolled: number, capacity: number) => Math.round((enrolled / capacity) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Full":
        return "var(--color-crimson)"
      case "Busy":
        return "var(--color-amber)"
      case "Capacity":
        return "var(--color-crimson)"
      default:
        return "var(--color-emerald)"
    }
  }

  const getClassColor = (name: string) => {
    switch (name) {
      case "Yoga Flow":
        return "#10B981" // Emerald
      case "HIIT Burn":
        return "#8B5CF6" // Purple
      case "Spin Cycle":
        return "#3B82F6" // Blue
      case "CrossFit":
        return "#F59E0B" // Amber
      case "Pilates":
        return "#EC4899" // Pink
      default:
        return "#6B7280" // Gray
    }
  }

  // Get classes for a specific day and time slot
  const getClassesForSlot = (day: string, time: string) => {
    return classes.filter((c) => {
      const classHour = c.time.split(":")[0]
      const slotHour = time.split(":")[0]
      return c.day === day && classHour === slotHour
    })
  }

  // Today's classes for the right panel
  const todayClasses = classes.slice(0, 10)

  return (
    <div className="classes-page">
      {/* Header */}
      <div className="classes-page__header">
        <div className="classes-page__title-section">
          <h1 className="classes-page__title">Class Schedule</h1>
          <span className="classes-page__count">Upcoming: {classes.length} Classes Today</span>
        </div>
        <div className="classes-page__actions">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            }
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="classes-page__grid">
        {/* Weekly View */}
        <Card
          title="Weekly View"
          action={<button className="card-action-btn">•••</button>}
          className="classes-page__weekly"
        >
          <div className="weekly-calendar">
            <div className="weekly-header">
              <div className="weekly-time-header"></div>
              {DAYS.map((day) => (
                <div key={day} className="weekly-day-header">
                  {day}
                </div>
              ))}
            </div>
            <div className="weekly-body">
              {TIMES.map((time, timeIdx) => (
                <div key={`${time}-${timeIdx}`} className="weekly-row">
                  <div className="weekly-time">{time}</div>
                  {DAYS.map((day) => {
                    const slotClasses = getClassesForSlot(day, time)
                    return (
                      <div key={`${day}-${time}-${timeIdx}`} className="weekly-cell">
                        {slotClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="weekly-class"
                            style={{ backgroundColor: getClassColor(cls.name) }}
                          >
                            {cls.name}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's Classes */}
        <Card
          title="Today's Classes"
          action={<button className="card-action-btn">•••</button>}
          className="classes-page__today"
        >
          <div className="today-list">
            <div className="today-header">
              <span>Time</span>
              <span>Class</span>
              <span>Trainer</span>
              <span>Capacity</span>
              <span>Actions</span>
            </div>
            {todayClasses.map((cls) => (
              <div key={cls.id} className="today-row">
                <span className="today-time">{cls.time}</span>
                <span className="today-class">{cls.name}</span>
                <span className="today-trainer">{cls.trainer}</span>
                <div className="today-capacity">
                  <span className="capacity-text">{cls.status}</span>
                  <div
                    className="capacity-bar"
                    style={
                      {
                        "--capacity-width": `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                        "--capacity-color": getStatusColor(cls.status),
                      } as React.CSSProperties
                    }
                  />
                </div>
                <button className="action-menu-btn">•••</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Classes
