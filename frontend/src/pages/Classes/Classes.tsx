"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import api, { ptSessionApi } from "../../services/api"
import { WeeklyCalendar, AddClassModal, type ClassData } from "./components"
import { useClasses } from "../../contexts/ClassesContext"
import "./Classes.css"
import type { User } from "../../types/user"
import { format, startOfWeek, addDays } from 'date-fns'
import { Calendar, Clock, ChevronLeft, ChevronRight, Filter, ChevronDown, Users, Zap } from 'lucide-react'
import { useClickOutside } from "../../hooks"
import PTSessions, { type PTStats } from "../PTSessions/PTSessions"

const CLASS_TYPES = ["Yoga", "HIIT", "Cardio", "Strength", "Pilates", "CrossFit"]

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState({ type: "All", trainer: "All", status: "All" })
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([])
  const { setStats } = useClasses()
  const [activeTab, setActiveTab] = useState<'classes' | 'sessions'>('classes')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [ptStats, setPtStats] = useState<PTStats | null>(null)

  useClickOutside(filterRef, () => setFilterOpen(false), filterOpen)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'sessions') setActiveTab('sessions')
  }, [])

  useEffect(() => {
    api.getUsers('TRAINER').then(setAvailableTrainers).catch(() => {})
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const data = await ptSessionApi.getAllSessions()
      if (data?.length > 0) {
        const transformed: ClassData[] = data.map((session: any) => {
          let meta: any = {}
          try { if (session.progressNotes?.startsWith('{')) meta = JSON.parse(session.progressNotes) } catch {}
          const d = new Date(session.sessionDate)
          const pad = (n: number) => String(n).padStart(2, '0')
          const end = new Date(d.getTime() + session.durationMinutes * 60000)
          return {
            id: session.sessionId || session.id,
            name: meta.name || session.sessionType || "PT Session",
            trainer: session.trainerName || "Unknown",
            startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
            endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
            date: d.toLocaleDateString('en-CA'),
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
    } catch {
      toast.error("Failed to sync with database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClasses() }, [])

  const filteredClasses = useMemo(() => classes.filter(cls => {
    if (filter.type !== "All" && cls.type !== filter.type) return false
    if (filter.trainer !== "All" && cls.trainer !== filter.trainer) return false
    if (filter.status !== "All" && cls.status !== filter.status) return false
    return true
  }), [classes, filter])

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))
    const todayClasses = classes.filter(c => c.date === todayStr)
    const weekClasses = classes.filter(c => weekDays.includes(c.date))
    const totalCap = weekClasses.reduce((s, c) => s + c.capacity, 0)
    const totalEnr = weekClasses.reduce((s, c) => s + c.enrolled, 0)
    const nowMins = now.getHours() * 60 + now.getMinutes()
    const inProgress = todayClasses.filter(c => {
      const [sh, sm] = c.startTime.split(':').map(Number)
      const [eh, em] = c.endTime.split(':').map(Number)
      return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em
    }).length
    const upcoming = todayClasses.filter(c => {
      const [h, m] = c.startTime.split(':').map(Number)
      return h * 60 + m > nowMins
    }).length
    return {
      todayTotal: todayClasses.length,
      weekTotal: weekClasses.length,
      occupancyRate: totalCap > 0 ? Math.round((totalEnr / totalCap) * 100) : 0,
      inProgress, upcoming,
      availableSpots: totalCap - totalEnr,
      uniqueTrainers: [...new Set(weekClasses.map(c => c.trainer))].length,
      fullClasses: weekClasses.filter(c => c.enrolled >= c.capacity).length,
      todayEnrolled: todayClasses.reduce((s, c) => s + c.enrolled, 0),
      todayCapacity: todayClasses.reduce((s, c) => s + c.capacity, 0),
      todayOccupancy: 0,
      weekEnrolled: totalEnr, weekCapacity: totalCap,
      upcomingToday: upcoming, inProgressNow: inProgress,
      typeBreakdown: {}, mostPopularType: '',
    }
  }, [classes, currentDate])

  useEffect(() => { setStats(stats as any) }, [stats, setStats])

  const getDateRange = () => {
    const s = new Date(currentDate)
    const day = s.getDay()
    const monday = new Date(s.setDate(s.getDate() - day + (day === 0 ? -6 : 1)))
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(monday)} – ${fmt(sunday)}`
  }

  const handleClassClick = (cls: ClassData) => { setEditingClass(cls); setIsModalOpen(true) }

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const d = new Date(date); d.setHours(hour, 0, 0, 0)
    if (d < new Date()) { toast.error("Cannot schedule in the past"); return }
    setEditingClass({
      id: 0, name: '', trainer: '',
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      date: date.toLocaleDateString('en-CA'),
      capacity: 15, enrolled: 0, status: 'Available', room: 'Studio A', type: 'General'
    } as ClassData)
    setIsModalOpen(true)
  }

  const handleSaveClass = async (classData: Partial<ClassData>) => {
    try {
      const targetDate = classData.date || new Date().toLocaleDateString('en-CA')
      if (new Date(`${targetDate}T${classData.startTime || "09:00"}:00`) < new Date()) {
        toast.error("Cannot schedule in the past"); return
      }
      const [sh, sm] = (classData.startTime || "09:00").split(':').map(Number)
      const [eh, em] = (classData.endTime || "10:00").split(':').map(Number)
      const newStart = sh * 60 + sm, newEnd = eh * 60 + em
      const conflict = classes.some(cls => {
        if (editingClass && cls.id === editingClass.id) return false
        if (cls.room !== classData.room || cls.date !== targetDate) return false
        const [csh, csm] = cls.startTime.split(':').map(Number)
        const [ceh, cem] = cls.endTime.split(':').map(Number)
        return newStart < ceh * 60 + cem && newEnd > csh * 60 + csm
      })
      if (conflict) { toast.error(`Room ${classData.room} is booked at this time`); return }
      const trainer = availableTrainers.find(t => t.fullName === classData.trainer)
      const payload = {
        trainerId: trainer?.userId || 2, memberId: 1,
        sessionDate: `${targetDate}T${classData.startTime || "09:00"}:00`,
        durationMinutes: Math.max(newEnd - newStart, 60),
        status: 'SCHEDULED',
        progressNotes: JSON.stringify({ name: classData.name, type: classData.type, room: classData.room, capacity: classData.capacity, enrolled: classData.enrolled || 0 })
      }
      if (editingClass?.id && editingClass.id !== 0) {
        await ptSessionApi.updateSession(Number(editingClass.id), payload as any)
        toast.success('Class updated')
      } else {
        await ptSessionApi.createSession(payload as any)
        toast.success('Class created')
      }
      setIsModalOpen(false); setEditingClass(null); fetchClasses()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save class")
    }
  }

  const activeFilters = [filter.type !== "All", filter.trainer !== "All", filter.status !== "All"].filter(Boolean).length

  if (loading && classes.length === 0) {
    return (
      <div className="cls-page">
        <div className="cls-page__loading">
          <div className="loading-spinner" />
          <span>Loading schedule…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cls-page">

      {/* ── Single unified toolbar ── */}
      <div className="cls-toolbar">
        <div className="cls-tabs">
          <button className={`cls-tab ${activeTab === 'classes' ? 'cls-tab--active' : ''}`} onClick={() => setActiveTab('classes')}>
            <Calendar size={14} /><span>Schedule</span>
          </button>
          <button className={`cls-tab ${activeTab === 'sessions' ? 'cls-tab--active' : ''}`} onClick={() => setActiveTab('sessions')}>
            <Clock size={14} /><span>PT Sessions</span>
          </button>
        </div>

        {/* PT Sessions inline stats — shown beside tabs when that tab is active */}
        {activeTab === 'sessions' && ptStats && (
          <div className="cls-stats cls-stats--pt">
            <div className="cls-stat">
              <Zap size={11} style={{ opacity: .55 }} />
              <span className="cls-stat__val">{ptStats.today}</span>
              <span className="cls-stat__lbl">Today</span>
            </div>
            <div className="cls-stat-sep" />
            <div className="cls-stat">
              <Calendar size={11} style={{ opacity: .55 }} />
              <span className="cls-stat__val">{ptStats.thisWeek}</span>
              <span className="cls-stat__lbl">Week</span>
            </div>
            <div className="cls-stat-sep" />
            <div className="cls-stat">
              <Clock size={11} style={{ opacity: .55 }} />
              <span className="cls-stat__val">{ptStats.scheduled}</span>
              <span className="cls-stat__lbl">Upcoming</span>
            </div>
            <div className="cls-stat-sep" />
            <div className="cls-stat">
              <span className="cls-stat__val" style={{ color: 'var(--color-emerald)' }}>{ptStats.completionRate}%</span>
              <span className="cls-stat__lbl">Done rate</span>
            </div>
            <div className="cls-stat-sep" />
            <div className="cls-stat">
              <Users size={11} style={{ opacity: .55 }} />
              <span className="cls-stat__val">{ptStats.trainers}</span>
              <span className="cls-stat__lbl">Trainers</span>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <>
            <div className="cls-week-nav">
              <button className="cls-nav-btn" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }}><ChevronLeft size={16} /></button>
              <span className="cls-week-label">{getDateRange()}</span>
              <button className="cls-nav-btn" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }}><ChevronRight size={16} /></button>
              <div className="cls-datepick-wrap" title="Jump to date">
                <Calendar size={12} />
                <input type="date" className="cls-datepick" onChange={e => e.target.valueAsDate && setCurrentDate(e.target.valueAsDate)} />
              </div>
            </div>

            <div className="cls-toolbar-right">
              <div className="cls-stats">
                <div className="cls-stat">
                  <span className="cls-stat__val">{stats.todayTotal}</span>
                  <span className="cls-stat__lbl">Today</span>
                  {stats.inProgress > 0 && <span className="cls-live"><span className="cls-live-dot" />LIVE</span>}
                </div>
                <div className="cls-stat-sep" />
                <div className="cls-stat">
                  <span className="cls-stat__val">{stats.weekTotal}</span>
                  <span className="cls-stat__lbl">Week</span>
                </div>
                <div className="cls-stat-sep" />
                <div className="cls-stat">
                  <Users size={11} style={{ opacity: .55 }} />
                  <span className="cls-stat__val">{stats.occupancyRate}%</span>
                  <span className="cls-stat__lbl">Fill rate</span>
                </div>
                <div className="cls-stat-sep" />
                <div className="cls-stat">
                  <Zap size={11} style={{ opacity: .55 }} />
                  <span className="cls-stat__val">{stats.upcoming}</span>
                  <span className="cls-stat__lbl">Upcoming</span>
                </div>
              </div>

              <div className="cls-filter-wrap" ref={filterRef}>
                <button className={`cls-filter-btn ${filterOpen ? 'open' : ''} ${activeFilters > 0 ? 'has-active' : ''}`} onClick={() => setFilterOpen(v => !v)}>
                  <Filter size={13} />
                  <span>Filter</span>
                  {activeFilters > 0 && <span className="cls-filter-badge">{activeFilters}</span>}
                  <ChevronDown size={12} className={`cls-chevron ${filterOpen ? 'up' : ''}`} />
                </button>
                {filterOpen && (
                  <div className="cls-filter-popover">
                    <div className="cls-filter-group">
                      <label>Type</label>
                      <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}>
                        <option value="All">All Types</option>
                        {CLASS_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="cls-filter-group">
                      <label>Trainer</label>
                      <select value={filter.trainer} onChange={e => setFilter(p => ({ ...p, trainer: e.target.value }))}>
                        <option value="All">All Trainers</option>
                        {availableTrainers.map(t => <option key={t.userId} value={t.fullName}>{t.fullName}</option>)}
                      </select>
                    </div>
                    <div className="cls-filter-group">
                      <label>Status</label>
                      <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
                        <option value="All">All</option>
                        <option>Available</option>
                        <option>Full</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    {activeFilters > 0 && (
                      <button className="cls-filter-reset" onClick={() => setFilter({ type: "All", trainer: "All", status: "All" })}>
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button className="cls-add-btn" onClick={() => { setEditingClass(null); setIsModalOpen(true) }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                <span>Add Class</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Content ── */}
      {activeTab === 'sessions' ? (
        <div className="cls-sessions-wrap"><PTSessions onStatsChange={setPtStats} /></div>
      ) : (
        <div className="cls-calendar-wrap">
          <WeeklyCalendar
            currentDate={currentDate}
            classes={filteredClasses}
            onClassClick={handleClassClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
      )}

      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClass(null) }}
        onSave={handleSaveClass}
        classData={editingClass}
        trainers={availableTrainers.map(t => t.fullName)}
        classTypes={CLASS_TYPES}
      />
    </div>
  )
}

export default Classes
