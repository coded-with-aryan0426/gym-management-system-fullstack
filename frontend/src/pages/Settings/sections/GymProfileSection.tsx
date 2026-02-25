"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import {
  Building2,
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  Info,
  AlertCircle,
  Dumbbell,
} from "lucide-react"
import api from "../../../services/api"
import type { GymHoursDTO, PTConfigDTO, BlackoutDayDTO } from "../../../types/gymSettings"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

const GymProfileSection: React.FC = () => {
  const [gymHours, setGymHours] = useState<GymHoursDTO[]>([])
  const [ptConfig, setPtConfig] = useState<PTConfigDTO>({
    defaultDurationMinutes: 60,
    maxSessionsPerDay: 8,
    slotIntervalMinutes: 30,
  })
  const [blackoutDays, setBlackoutDays] = useState<BlackoutDayDTO[]>([])
  const [newBlackoutDate, setNewBlackoutDate] = useState("")
  const [newBlackoutReason, setNewBlackoutReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [savingHours, setSavingHours] = useState(false)
  const [savingPT, setSavingPT] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [hoursRes, ptRes, blackoutRes] = await Promise.allSettled([
        api.get<GymHoursDTO[]>("/settings/gym/gym-hours"),
        api.get<PTConfigDTO>("/settings/gym/pt-config"),
        api.get<BlackoutDayDTO[]>("/settings/gym/blackout-days"),
      ])

      if (hoursRes.status === "fulfilled" && hoursRes.value.data) {
        const hours = hoursRes.value.data
        // Ensure all 7 days are present
        const fullWeek = DAYS.map((day) => {
          const existing = hours.find((h: GymHoursDTO) => h.dayOfWeek === day)
          return existing || { dayOfWeek: day, openTime: "06:00", closeTime: "22:00", isClosed: false }
        })
        setGymHours(fullWeek)
      } else {
        setGymHours(
          DAYS.map((day) => ({ dayOfWeek: day, openTime: "06:00", closeTime: "22:00", isClosed: false }))
        )
      }

      if (ptRes.status === "fulfilled" && ptRes.value.data) {
        setPtConfig(ptRes.value.data)
      }

      if (blackoutRes.status === "fulfilled" && blackoutRes.value.data) {
        setBlackoutDays(blackoutRes.value.data)
      }
    } catch (err) {
      console.error("Failed to load gym profile:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleHoursChange = (index: number, field: keyof GymHoursDTO, value: string | boolean) => {
    setGymHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }

  const saveHours = async () => {
    setSavingHours(true)
    try {
      for (const h of gymHours) {
        await api.put("/settings/gym/gym-hours", h)
      }
      toast.success("Gym hours updated")
    } catch {
      toast.error("Failed to update gym hours")
    } finally {
      setSavingHours(false)
    }
  }

  const savePTConfig = async () => {
    setSavingPT(true)
    try {
      await api.put("/settings/gym/pt-config", ptConfig)
      toast.success("PT configuration updated")
    } catch {
      toast.error("Failed to update PT config")
    } finally {
      setSavingPT(false)
    }
  }

  const addBlackoutDay = async () => {
    if (!newBlackoutDate) {
      toast.error("Please select a date")
      return
    }
    try {
      const params = new URLSearchParams({ date: newBlackoutDate })
      if (newBlackoutReason) params.append("reason", newBlackoutReason)
      const res = await api.post<BlackoutDayDTO>(`/settings/gym/blackout-days?${params.toString()}`)
      setBlackoutDays((prev) => [...prev, res.data])
      setNewBlackoutDate("")
      setNewBlackoutReason("")
      toast.success("Blackout day added")
    } catch {
      toast.error("Failed to add blackout day")
    }
  }

  const removeBlackoutDay = async (date: string) => {
    try {
      await api.delete(`/settings/gym/blackout-days?date=${date}`)
      setBlackoutDays((prev) => prev.filter((b) => b.date !== date))
      toast.success("Blackout day removed")
    } catch {
      toast.error("Failed to remove blackout day")
    }
  }

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__loading">
          <div className="settings-section__loading-spinner" />
          <span>Loading gym profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section settings-section--green">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon settings-section__icon--green">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Gym Profile</h2>
            <p className="settings-section__description">Operating hours, PT configuration & holidays</p>
          </div>
        </div>
      </div>

        <div className="settings-section__content">
          {/* Gym Hours */}
          <div className="form-group">
            <div className="form-group__header form-group__header--spaced">
              <div className="form-group__header-left">
                <Clock size={16} />
                <h4 className="form-group__title">Operating Hours</h4>
              </div>
              <button className="settings-save-btn" onClick={saveHours} disabled={savingHours}>
                <Save size={14} />
                {savingHours ? "Saving..." : "Save Hours"}
              </button>
            </div>
            <div className="gym-hours-list">
              {gymHours.map((h, i) => (
                <div
                  key={h.dayOfWeek}
                  className={`gym-hours-row${h.isClosed ? " gym-hours-row--closed" : ""}`}
                >
                  <span className="gym-hours-row__day">
                    {h.dayOfWeek.charAt(0) + h.dayOfWeek.slice(1).toLowerCase()}
                  </span>
                  <input
                    type="time"
                    className="dense-input"
                    value={h.openTime}
                    onChange={(e) => handleHoursChange(i, "openTime", e.target.value)}
                    disabled={h.isClosed}
                  />
                  <input
                    type="time"
                    className="dense-input"
                    value={h.closeTime}
                    onChange={(e) => handleHoursChange(i, "closeTime", e.target.value)}
                    disabled={h.isClosed}
                  />
                  <label className="gym-hours-row__closed-label">
                    <input
                      type="checkbox"
                      checked={!!h.isClosed}
                      onChange={(e) => handleHoursChange(i, "isClosed", e.target.checked)}
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* PT Configuration */}
          <div className="form-group">
            <div className="form-group__header form-group__header--spaced">
              <div className="form-group__header-left">
                <Dumbbell size={16} />
                <h4 className="form-group__title">PT Session Configuration</h4>
              </div>
              <button className="settings-save-btn" onClick={savePTConfig} disabled={savingPT}>
                <Save size={14} />
                {savingPT ? "Saving..." : "Save Config"}
              </button>
            </div>
            <div className="form-grid">
            <div className="field-wrapper">
              <label className="field-label">
                Default Duration (minutes)
                <div className="info-icon" data-tooltip="Default length of a PT session">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={15}
                max={180}
                step={15}
                value={ptConfig.defaultDurationMinutes}
                onChange={(e) => setPtConfig((p) => ({ ...p, defaultDurationMinutes: +e.target.value }))}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Max Sessions / Day
                <div className="info-icon" data-tooltip="Maximum PT sessions a trainer can have per day">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={1}
                max={20}
                value={ptConfig.maxSessionsPerDay}
                onChange={(e) => setPtConfig((p) => ({ ...p, maxSessionsPerDay: +e.target.value }))}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Slot Interval (minutes)
                <div className="info-icon" data-tooltip="Time gap between available booking slots">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={15}
                max={60}
                step={15}
                value={ptConfig.slotIntervalMinutes}
                onChange={(e) => setPtConfig((p) => ({ ...p, slotIntervalMinutes: +e.target.value }))}
              />
            </div>
          </div>
        </div>

          {/* Blackout Days */}
          <div className="form-group">
            <div className="form-group__header">
              <Calendar size={16} />
              <h4 className="form-group__title">Blackout Days / Holidays</h4>
            </div>
            <p className="form-group__desc">
              Days when the gym is closed for holidays or maintenance. No bookings allowed.
            </p>

            <div className="blackout-add-row">
              <input
                type="date"
                className="dense-input"
                value={newBlackoutDate}
                onChange={(e) => setNewBlackoutDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                type="text"
                className="dense-input"
                placeholder="Reason (optional)"
                value={newBlackoutReason}
                onChange={(e) => setNewBlackoutReason(e.target.value)}
              />
              <button
                className="settings-save-btn"
                onClick={addBlackoutDay}
                disabled={!newBlackoutDate}
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {blackoutDays.length === 0 ? (
              <p className="blackout-empty">No blackout days configured</p>
            ) : (
              <div className="blackout-list">
                {blackoutDays
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((b) => (
                    <div key={b.date} className="blackout-row">
                      <div className="blackout-row__info">
                        <span className="blackout-row__date">
                          {new Date(b.date + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {b.reason && (
                          <span className="blackout-row__reason">&mdash; {b.reason}</span>
                        )}
                      </div>
                      <button
                        className="blackout-row__remove"
                        onClick={() => removeBlackoutDay(b.date)}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

        <div className="policy-note">
          <div className="policy-note__icon">
            <AlertCircle size={16} />
          </div>
          <span>
            <strong>Note:</strong> Changes to operating hours and blackout days affect member booking
            availability immediately.
          </span>
        </div>
      </div>
    </div>
  )
}

export default GymProfileSection
