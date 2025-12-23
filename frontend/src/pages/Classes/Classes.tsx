"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import api, { ptSessionApi } from "../../services/api"
import { ScheduleHeader, ScheduleFilters, WeeklyCalendar, AddClassModal, type ClassData } from "./components"
import "./Classes.css"
import type { User } from "../../types/user"

// Class types for filtering
const CLASS_TYPES = ["Yoga", "HIIT", "Cardio", "Strength", "Pilates", "CrossFit"]

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
        totalClasses={filteredClasses.length}
        capacityPercent={stats.capacityPercent}
        dateRange={getDateRange()}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onDateSelect={handleDateSelect}
      />

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
