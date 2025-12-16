"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Button, Card } from "../../components/ui"
import { ptSessionApi } from "../../services/api"
import "./Classes.css"

interface GymClass {
  id: number
  name: string
  trainer: string
  trainerAvatar?: string
  time: string
  displayTime: string
  day: string
  capacity: number
  enrolled: number
  status: "Available" | "Busy" | "Full" | "Capacity"
  room?: string
  tags?: string[]
  color?: string
}

// Filter State Type
interface ClassFilter {
  trainer: string
  type: string
  status: "All" | "Available" | "Full"
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIMES = ["6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

const CLASSES_TYPES = ["Yoga", "HIIT", "Cardio", "Strength", "Pilates", "CrossFit"]

// Mock helpers for visual enhancement
const getRandomColor = (id: number) => {
  const colors = ["#10B981", "#8B5CF6", "#3B82F6", "#F59E0B", "#EC4899", "#EF4444"]
  return colors[id % colors.length]
}

const getMockCapacity = (id: number) => {
  // Deterministic random capacity between 10 and 30
  return 10 + (id % 20)
}

const getMockEnrolled = (id: number, capacity: number) => {
  // Deterministic random enrolled count
  const percent = ((id * 17) % 100) / 100
  return Math.floor(capacity * percent)
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<GymClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<GymClass[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<ClassFilter>({
    trainer: "All",
    type: "All",
    status: "All"
  })

  // Refs for scrolling
  const classRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const loadClasses = useCallback(async () => {
    setLoading(true)
    try {
      const sessions = await ptSessionApi.getAllSessions()
      console.log("[Classes] Raw sessions:", sessions)

      const transformed: GymClass[] = sessions.map((session, idx) => {
        const sessionDate = new Date(session.sessionDate)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const hour = sessionDate.getHours()
        const minutes = sessionDate.getMinutes()
        const timeStr24 = `${hour}:00` // Simplified for grid
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayH = hour % 12 || 12
        const displayTime = `${displayH}:${minutes.toString().padStart(2, '0')} ${ampm}`

        // Enhance with mock data for better UI demo
        const capacity = getMockCapacity(idx)
        const enrolled = getMockEnrolled(idx, capacity)
        const isFull = enrolled >= capacity
        const isBusy = enrolled >= capacity * 0.8

        let status: GymClass["status"] = "Available"
        if (isFull) status = "Full"
        else if (isBusy) status = "Busy"

        return {
          id: session.sessionId || idx,
          name: session.workoutPlan || "PT Session",
          trainer: session.trainerName || "Staff Trainer",
          time: timeStr24,
          displayTime: displayTime,
          day: days[sessionDate.getDay()],
          capacity: capacity,
          enrolled: enrolled,
          status: status,
          room: `Studio ${1 + (idx % 3)}`,
          color: getRandomColor(idx),
          tags: [session.workoutPlan || "General"]
        }
      })

      setClasses(transformed)
      setFilteredClasses(transformed)
    } catch (err) {
      console.error("Failed to load classes", err)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter Logic
  useEffect(() => {
    let result = classes
    if (filter.trainer !== "All") {
      result = result.filter(c => c.trainer === filter.trainer)
    }
    if (filter.status !== "All") {
      if (filter.status === "Available") result = result.filter(c => c.status === "Available")
      if (filter.status === "Full") result = result.filter(c => c.status === "Full")
    }
    setFilteredClasses(result)
  }, [filter, classes])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const scrollToClass = (id: number) => {
    const element = classRefs.current[id]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add highlight effect logic here if needed
      element.classList.add('highlight-flash')
      setTimeout(() => element.classList.remove('highlight-flash'), 1000)
    }
  }

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

  // Today's classes for the right panel
  const todayClasses = classes.slice(0, 10)

  return (
    <div className="classes-page">
      {/* Header */}
      <div className="classes-page__header">
        <div className="classes-page__title-section">
          <h1 className="classes-page__title">Class Schedule</h1>
          <div className="classes-page__subtitle">
            <span>Dec 16 – Dec 22</span>
            <span className="classes-stat-pill">{filteredClasses.length} Classes</span>
            <span className="classes-stat-pill">85% Capacity</span>
          </div>
        </div>

        {/* Compact Filter Bar */}
        <div className="classes-filter-bar">
          <select
            className="filter-select"
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="All">All Types</option>
            {CLASSES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            className="filter-select"
            value={filter.trainer}
            onChange={(e) => setFilter(prev => ({ ...prev, trainer: e.target.value }))}
          >
            <option value="All">All Trainers</option>
            {Array.from(new Set(classes.map(c => c.trainer))).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="classes-page__grid">
        {/* Weekly View */}
        <Card title="Weekly Schedule" className="classes-page__weekly">
          <div className="weekly-calendar">
            <div className="weekly-header">
              <div className="weekly-time-header"></div>
              {DAYS.map((day) => (
                <div key={day} className="weekly-day-header">{day}</div>
              ))}
            </div>
            <div className="weekly-body">
              {TIMES.map((time, timeIdx) => (
                <div key={time} className="weekly-row">
                  <div className="weekly-time">{time}</div>
                  {DAYS.map((day) => {
                    const slotClasses = filteredClasses.filter(c => {
                      const classHour = c.time.split(":")[0]
                      const slotHour = time.split(":")[0]
                      return c.day === day && classHour === slotHour
                    })

                    return (
                      <div key={`${day}-${time}`} className="weekly-cell">
                        {slotClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="class-card"
                            style={{ "--card-color": cls.color || "var(--primary-color)" } as React.CSSProperties}
                            onClick={() => scrollToClass(cls.id)}
                          >
                            <span className="class-card__title">{cls.name}</span>
                            <div className="class-card__meta">
                              <span>{cls.trainer.split(' ')[0]}</span>
                              <span
                                className="capacity-dot"
                                style={{ backgroundColor: getStatusColor(cls.status || "Available") }}
                              />
                            </div>
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
        <Card title="Today's Classes" className="classes-page__today">
          <div className="today-list">
            {/* Group by time logic */}
            {Array.from(new Set(filteredClasses.map(c => c.time)))
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(timeSlot => {
                const slotClasses = filteredClasses.filter(c => c.time === timeSlot && c.day === "Mon") // Demo: Mon as Today
                if (slotClasses.length === 0) return null

                return (
                  <div key={timeSlot} className="today-slot">
                    <div className="slot-time">{timeSlot}</div>
                    <div className="slot-cards">
                      {slotClasses.map(cls => (
                        <div
                          key={cls.id}
                          className="today-card"
                          ref={el => { classRefs.current[cls.id] = el }}
                        >
                          <div className="today-card__info">
                            <div className="today-card__title">{cls.name}</div>
                            <div className="today-card__trainer">
                              <div className="trainer-avatar-small">
                                {cls.trainer.charAt(0)}
                              </div>
                              {cls.trainer} • {cls.room}
                            </div>
                          </div>

                          <div className="today-card__stats">
                            <div className="capacity-text">
                              <span>{cls.status}</span>
                              <span>{cls.enrolled}/{cls.capacity}</span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                                  backgroundColor: getStatusColor(cls.status)
                                }}
                              />
                            </div>
                          </div>

                          <button className="card-action-btn">•••</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            {filteredClasses.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No classes found for the selected filters.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Classes
