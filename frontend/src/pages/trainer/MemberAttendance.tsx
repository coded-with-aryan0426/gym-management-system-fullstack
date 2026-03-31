import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Clock, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, Search,
  X, TrendingUp, Flame, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../services/attendanceTaskApi';
import { trainerApi } from '../../services/trainerApi';
import './MemberAttendance.css';

interface MemberAttendanceSummary {
  memberId: number;
  memberName: string;
  email: string;
  avatarUrl?: string;
  lastVisit?: string;
  visitsThisMonth: number;
  currentStreak: number;
  isInside: boolean;
  checkInTime?: string;
}

interface MemberHistoryPoint {
  date: string;
  day: string;
  checkIns: number;
  durationMinutes: number;
}

const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CARD: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
  })
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

const MemberAttendance: React.FC = () => {
  const [members, setMembers] = useState<MemberAttendanceSummary[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberAttendanceSummary | null>(null);
  const [memberHistory, setMemberHistory] = useState<MemberHistoryPoint[]>([]);
  const [memberVisits, setMemberVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'absent'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const myMembers = await trainerApi.getMyMembers().catch(() => []);
      const summaries: MemberAttendanceSummary[] = Array.isArray(myMembers)
        ? myMembers.map((m: any) => ({
            memberId: m.userId || m.memberId || m.id,
            memberName: m.fullName || m.name || 'Unknown',
            email: m.email || '',
            avatarUrl: m.avatarUrl,
            lastVisit: m.lastVisit,
            visitsThisMonth: m.visitsThisMonth || 0,
            currentStreak: m.currentStreak || 0,
            isInside: !!m.isInside,
            checkInTime: m.checkInTime,
          }))
        : [];
      setMembers(summaries);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const loadMemberDetail = useCallback(async (member: MemberAttendanceSummary) => {
    setLoadingDetail(true);
    setSelectedMember(member);
    try {
      const visits = await attendanceApi.getMemberAttendance?.(member.memberId).catch(() => []);
      setMemberVisits(Array.isArray(visits) ? visits : []);

      const history: MemberHistoryPoint[] = [];
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        if (date > new Date()) break;
        const dayVisits = Array.isArray(visits)
          ? visits.filter((v: any) => {
              const vDate = new Date(v.checkInTime);
              return vDate.getFullYear() === currentYear &&
                vDate.getMonth() === currentMonth &&
                vDate.getDate() === d;
            })
          : [];
        history.push({
          date: date.toISOString().split('T')[0],
          day: DAYS_ORDER[date.getDay() === 0 ? 6 : date.getDay() - 1],
          checkIns: dayVisits.length,
          durationMinutes: dayVisits.reduce((s: number, v: any) =>
            s + (v.durationMinutes || 0), 0),
        });
      }
      setMemberHistory(history);
    } catch {
      setMemberVisits([]);
      setMemberHistory([]);
    } finally {
      setLoadingDetail(false);
    }
  }, [currentMonth, currentYear]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !searchQuery ||
        m.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const days = daysSince(m.lastVisit);
      if (activityFilter === 'active') return matchSearch && m.isInside;
      if (activityFilter === 'absent') return matchSearch && days !== null && days > 7;
      return matchSearch;
    });
  }, [members, searchQuery, activityFilter]);

  const liveNowMembers = useMemo(
    () => members.filter(m => m.isInside),
    [members]
  );

  const absentCount = useMemo(
    () => members.filter(m => { const d = daysSince(m.lastVisit); return d !== null && d > 7; }).length,
    [members]
  );

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    if (selectedMember) loadMemberDetail(selectedMember);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    if (selectedMember) loadMemberDetail(selectedMember);
  };

  const getStatusColor = (days: number | null) => {
    if (days === null) return 'status--none';
    if (days <= 3) return 'status--recent';
    if (days <= 7) return 'status--warning';
    return 'status--absent';
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="tma-page">
        <div className="tma-loading">
          <Loader2 size={40} className="tma-spin" />
          <p>Loading your members…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div className="tma-header">
        <div className="tma-header__icon"><Users size={22} /></div>
        <div>
          <h1 className="tma-header__title">Member Attendance</h1>
          <p className="tma-header__sub">
            {members.length} assigned members
            {absentCount > 0 && <span className="tma-absent-badge">{absentCount} absent 7d+</span>}
          </p>
        </div>
        <button className="tma-refresh-btn" onClick={loadMembers} aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="tma-body">
        {/* ── Members List ── */}
        <motion.div className="tma-members-panel" variants={CARD} initial="hidden" animate="visible" custom={0}>
          <div className="tma-members-panel__header">
            <div className="tma-members-panel__search">
              <Search size={14} />
              <input
                placeholder="Search members…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search members"
              />
            </div>
            <div className="tma-members-panel__filters" role="group" aria-label="Activity filter">
              {([['all', 'All'], ['active', 'Inside'], ['absent', 'Absent 7d+']] as const).map(([val, label]) => (
                <button
                  key={val}
                  className={`tma-filter-chip ${activityFilter === val ? 'active' : ''}`}
                  onClick={() => setActivityFilter(val)}
                  aria-pressed={activityFilter === val}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {liveNowMembers.length > 0 && (
            <div className="tma-live-now-section">
              <div className="tma-live-now-label">
                <span className="tma-live-dot" aria-hidden="true" />
                Inside Now ({liveNowMembers.length})
              </div>
              {liveNowMembers.map(m => (
                <button
                  key={m.memberId}
                  className={`tma-member-card tma-member-card--live ${selectedMember?.memberId === m.memberId ? 'selected' : ''}`}
                  onClick={() => loadMemberDetail(m)}
                  aria-label={`View ${m.memberName} attendance`}
                >
                  <div className="tma-member-card__avatar tma-member-card__avatar--live">
                    {getInitials(m.memberName)}
                  </div>
                  <div className="tma-member-card__info">
                    <span className="tma-member-card__name">{m.memberName}</span>
                    <span className="tma-member-card__meta tma-member-card__meta--live">
                      <Clock size={10} /> Since {m.checkInTime ? new Date(m.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="tma-members-list">
            {filteredMembers.length === 0 ? (
              <div className="tma-empty">
                <Users size={28} />
                <p>No members found</p>
              </div>
            ) : (
              filteredMembers.map(m => {
                const days = daysSince(m.lastVisit);
                return (
                  <button
                    key={m.memberId}
                    className={`tma-member-card ${selectedMember?.memberId === m.memberId ? 'selected' : ''} ${m.isInside ? 'tma-member-card--live' : ''}`}
                    onClick={() => loadMemberDetail(m)}
                    aria-label={`View ${m.memberName} attendance`}
                  >
                    <div className={`tma-member-card__avatar ${getStatusColor(days)}`}>
                      {getInitials(m.memberName)}
                    </div>
                    <div className="tma-member-card__info">
                      <span className="tma-member-card__name">{m.memberName}</span>
                      <span className="tma-member-card__meta">
                        {m.lastVisit
                          ? `Last: ${new Date(m.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                          : 'No visits yet'}
                      </span>
                    </div>
                    <div className="tma-member-card__stats">
                      <span className="tma-member-card__streak">
                        <Flame size={11} /> {m.currentStreak}
                      </span>
                      <span className={`tma-member-card__badge ${getStatusColor(days)}`}>
                        {days === null ? '—' : days <= 3 ? '<3d' : days <= 7 ? '3-7d' : `${days}d`}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Detail Panel ── */}
        <div className="tma-detail-panel">
          {selectedMember ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMember.memberId}
                className="tma-detail-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="tma-detail-header">
                  <div className="tma-detail-header__info">
                    <div className="tma-detail-header__avatar">
                      {getInitials(selectedMember.memberName)}
                    </div>
                    <div>
                      <h2 className="tma-detail-header__name">{selectedMember.memberName}</h2>
                      <p className="tma-detail-header__email">{selectedMember.email}</p>
                    </div>
                    {selectedMember.isInside && (
                      <span className="tma-inside-chip">
                        <span className="tma-live-dot" /> Inside
                      </span>
                    )}
                  </div>
                  <button
                    className="tma-detail-close"
                    onClick={() => setSelectedMember(null)}
                    aria-label="Close detail"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="tma-detail-stats">
                  <div className="tma-detail-stat">
                    <span className="tma-detail-stat__value">{selectedMember.visitsThisMonth}</span>
                    <span className="tma-detail-stat__label">This Month</span>
                  </div>
                  <div className="tma-detail-stat">
                    <span className="tma-detail-stat__value">{selectedMember.currentStreak}</span>
                    <span className="tma-detail-stat__label">Streak</span>
                  </div>
                  <div className="tma-detail-stat">
                    <span className="tma-detail-stat__value">
                      {selectedMember.lastVisit
                        ? new Date(selectedMember.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                        : '—'}
                    </span>
                    <span className="tma-detail-stat__label">Last Visit</span>
                  </div>
                  <div className="tma-detail-stat">
                    <span className={`tma-detail-stat__value ${getStatusColor(daysSince(selectedMember.lastVisit))}`}>
                      {daysSince(selectedMember.lastVisit) === null
                        ? '—'
                        : `${daysSince(selectedMember.lastVisit)}d ago`}
                    </span>
                    <span className="tma-detail-stat__label">Last Seen</span>
                  </div>
                </div>

                {loadingDetail ? (
                  <div className="tma-detail-loading"><Loader2 size={24} className="tma-spin" /></div>
                ) : (
                  <>
                    <div className="tma-calendar-section">
                      <div className="tma-calendar-nav">
                        <button onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={16} /></button>
                        <span>{MONTHS[currentMonth]} {currentYear}</span>
                        <button onClick={nextMonth} aria-label="Next month"><ChevronRight size={16} /></button>
                      </div>
                      <div className="tma-calendar-grid">
                        {DAYS_ORDER.map(d => (
                          <div key={d} className="tma-calendar-day-label">{d}</div>
                        ))}
                        {(() => {
                          const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
                          const daysInMonth = getDaysInMonth(currentYear, currentMonth);
                          const cells = [];
                          for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="tma-calendar-cell empty" />);
                          for (let d = 1; d <= daysInMonth; d++) {
                            const hasVisit = memberHistory.some(h => {
                              const hDate = new Date(h.date);
                              return hDate.getDate() === d && h.checkIns > 0;
                            });
                            const today = new Date();
                            const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            cells.push(
                              <div key={d} className={`tma-calendar-cell ${hasVisit ? 'visited' : ''} ${isToday ? 'today' : ''}`}>
                                {d}
                              </div>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>

                    {memberVisits.length > 0 && (
                      <div className="tma-recent-visits">
                        <h3 className="tma-recent-visits__title">Recent Sessions</h3>
                        <div className="tma-visit-list">
                          {memberVisits.slice(0, 8).map(v => (
                            <div key={v.checkInId} className="tma-visit-item">
                              <div className="tma-visit-item__date">
                                {new Date(v.checkInTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </div>
                              <div className="tma-visit-item__times">
                                <span>{new Date(v.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                {v.checkOutTime && (
                                  <span> → {new Date(v.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                              <div className="tma-visit-item__duration">
                                {v.durationMinutes ? `${Math.round(v.durationMinutes)}m` : '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="tma-detail-empty">
              <Users size={40} />
              <p>Select a member to view their attendance</p>
              <span>Click on any member card to see their history, streak, and recent visits</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberAttendance;
