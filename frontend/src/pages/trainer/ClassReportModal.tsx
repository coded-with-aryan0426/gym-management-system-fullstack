import React, { useState, useEffect } from 'react';
import {
    X, Download, Users, Clock, Star, TrendingUp, Calendar,
    FileText, CheckCircle2, XCircle, AlertCircle, Award,
    BarChart2, Zap, Activity, ChevronRight
} from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { ClassAttendee, TrainerClassItem } from '../../services/trainerApi';
import './ClassReportModal.css';

interface ClassReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    classItem: TrainerClassItem | null;
}

const TYPE_META: Record<string, { label: string; gradient: string; color: string; bg: string }> = {
    pt:       { label: 'Personal Training', gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    group:    { label: 'Group Class',        gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    hiit:     { label: 'HIIT',               gradient: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    yoga:     { label: 'Yoga',               gradient: 'linear-gradient(135deg,#10b981,#059669)', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    strength: { label: 'Strength',           gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    cardio:   { label: 'Cardio',             gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    pilates:  { label: 'Pilates',            gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
};

const ClassReportModal: React.FC<ClassReportModalProps> = ({ isOpen, onClose, classItem }) => {
    const [attendees, setAttendees] = useState<ClassAttendee[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && classItem) {
            setLoading(true);
            trainerApi.getClassAttendees(classItem.id)
                .then(data => setAttendees(data))
                .catch(err => console.error('Failed to fetch attendees', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, classItem]);

    if (!isOpen || !classItem) return null;

    const typeMeta = TYPE_META[classItem.type?.toLowerCase()] || TYPE_META.group;

    const presentCount  = attendees.filter(a => a.status === 'CONFIRMED').length;
    const absentCount   = attendees.filter(a => a.status === 'ABSENT').length;
    const pendingCount  = attendees.filter(a => a.status === 'PENDING').length;

    const effectivePresent = loading ? classItem.attendees.confirmed : presentCount;
    const effectiveTotal   = classItem.enrolled;

    const attendanceRate  = effectiveTotal > 0 ? Math.round((effectivePresent / effectiveTotal) * 100) : 0;
    const utilizationRate = classItem.capacity > 0 ? Math.round((effectiveTotal / classItem.capacity) * 100) : 0;

    let tier = 'Average'; let tierKey = 'average';
    if (attendanceRate >= 90)      { tier = 'Excellent'; tierKey = 'excellent'; }
    else if (attendanceRate >= 75) { tier = 'Good';      tierKey = 'good'; }
    else if (attendanceRate < 50)  { tier = 'Poor';      tierKey = 'poor'; }

    const baseRate = classItem.type === 'pt' ? 80 : 15;
    const earnings = classItem.type === 'pt' ? (effectivePresent > 0 ? baseRate : 0) : effectivePresent * baseRate;

    const tierColors: Record<string, string> = {
        excellent: '#10b981', good: '#3b82f6', average: '#f59e0b', poor: '#ef4444'
    };
    const tierColor = tierColors[tierKey];

    const handleExport = () => {
        const pw = window.open('', '_blank');
        if (!pw) return;

        // Determine accent colors from class type
        const accentColor = typeMeta.color;
        const gradientCss = typeMeta.gradient;

        // Build attendee rows
        const attendeeRows = attendees.length === 0
            ? `<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:20px;">No attendees recorded</td></tr>`
            : attendees.map((a, i) => {
                const statusStyles: Record<string, string> = {
                    CONFIRMED: 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0;',
                    ABSENT:    'background:#fee2e2;color:#991b1b;border:1px solid #fecaca;',
                    PENDING:   'background:#fef9c3;color:#854d0e;border:1px solid #fde68a;',
                };
                const st = statusStyles[a.status] || statusStyles.PENDING;
                const initials = (a.memberName || '?').charAt(0).toUpperCase();
                return `<tr>
                    <td style="color:#9ca3af;font-size:12px;padding:10px 12px;">${i + 1}</td>
                    <td style="padding:10px 12px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:30px;height:30px;border-radius:50%;background:${gradientCss};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0;">${initials}</div>
                            <span style="font-weight:500;color:#111827;">${a.memberName || `Member ${a.memberId}`}</span>
                        </div>
                    </td>
                    <td style="padding:10px 12px;color:#6b7280;font-size:12px;">#${a.memberId}</td>
                    <td style="padding:10px 12px;">
                        <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;${st}">${a.status}</span>
                    </td>
                </tr>`;
            }).join('');

        // Attendance bar widths
        const pW = effectiveTotal > 0 ? Math.round((presentCount  / effectiveTotal) * 100) : 0;
        const aW = effectiveTotal > 0 ? Math.round((absentCount   / effectiveTotal) * 100) : 0;
        const nW = effectiveTotal > 0 ? Math.round((pendingCount  / effectiveTotal) * 100) : 0;

        const tierBg: Record<string, string> = {
            excellent: '#f0fdf4', good: '#eff6ff', average: '#fffbeb', poor: '#fef2f2'
        };
        const tierBd: Record<string, string> = {
            excellent: '#bbf7d0', good: '#bfdbfe', average: '#fde68a', poor: '#fecaca'
        };

        pw.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Class Report — ${classItem.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#f8fafc;color:#111827;-webkit-print-color-adjust:exact;print-color-adjust:exact;}

  /* ── Page wrapper ── */
  .page{max-width:780px;margin:0 auto;padding:40px 32px 60px;}

  /* ── Cover header ── */
  .cover{background:${gradientCss};border-radius:16px;padding:32px 36px;color:#fff;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;position:relative;overflow:hidden;}
  .cover::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,0.08);border-radius:50%;}
  .cover::after{content:'';position:absolute;bottom:-60px;right:60px;width:160px;height:160px;background:rgba(255,255,255,0.05);border-radius:50%;}
  .cover-left{}
  .cover-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px;}
  .cover-title{font-size:26px;font-weight:800;line-height:1.2;margin-bottom:6px;}
  .cover-meta{font-size:13px;opacity:.85;}
  .cover-meta span{margin-right:16px;}
  .cover-ring{position:relative;z-index:1;}
  .cover-ring-outer{width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .cover-ring-pct{font-size:26px;font-weight:800;line-height:1;}
  .cover-ring-lbl{font-size:10px;opacity:.8;margin-top:2px;text-transform:uppercase;letter-spacing:.5px;}

  /* ── Section label ── */
  .sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${accentColor};margin-bottom:12px;display:flex;align-items:center;gap:6px;}
  .sec-title::before{content:'';display:inline-block;width:3px;height:14px;background:${gradientCss};border-radius:2px;}

  /* ── KPI row ── */
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
  .kpi{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.04);}
  .kpi-val{font-size:22px;font-weight:800;color:#111827;line-height:1;}
  .kpi-val span{font-size:13px;font-weight:500;color:#9ca3af;}
  .kpi-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-top:4px;}
  .kpi-bar{height:3px;border-radius:2px;margin-top:10px;}

  /* ── Performance banner ── */
  .perf{background:${tierBg[tierKey] || '#f9fafb'};border:1px solid ${tierBd[tierKey] || '#e5e7eb'};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:28px;}
  .perf-tier{font-size:16px;font-weight:800;color:${tierColor};}
  .perf-sub{font-size:12px;color:#6b7280;margin-top:2px;}
  .perf-pct{margin-left:auto;font-size:28px;font-weight:800;color:${tierColor};}

  /* ── Breakdown bar ── */
  .bk-section{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,.04);}
  .bk-bar-wrap{display:flex;height:10px;border-radius:6px;overflow:hidden;background:#f3f4f6;margin-bottom:14px;}
  .bk-seg-g{background:#22c55e;height:100%;}
  .bk-seg-r{background:#ef4444;height:100%;}
  .bk-seg-a{background:#f59e0b;height:100%;}
  .bk-legend{display:flex;gap:24px;}
  .bk-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#374151;}
  .bk-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

  /* ── Table ── */
  .tbl-section{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,.04);}
  table{width:100%;border-collapse:collapse;}
  thead tr{background:#f9fafb;border-bottom:1px solid #e5e7eb;}
  th{padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;text-align:left;}
  tbody tr{border-bottom:1px solid #f3f4f6;}
  tbody tr:last-child{border-bottom:none;}

  /* ── Insights ── */
  .insights{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,.04);}
  .insight-row{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:13px;color:#374151;line-height:1.5;}
  .insight-row:last-child{margin-bottom:0;}
  .ins-dot{width:8px;height:8px;border-radius:50%;background:${accentColor};flex-shrink:0;margin-top:5px;}

  /* ── Footer ── */
  .footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;}

  /* ── Print rules ── */
  @media print {
    body{background:#fff;}
    .page{padding:20px;}
    .cover{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Cover Header -->
  <div class="cover">
    <div class="cover-left">
      <div class="cover-badge">&#128196; Class Performance Report</div>
      <div class="cover-title">${classItem.title}</div>
      <div class="cover-meta">
        <span>&#128197; ${classItem.date}</span>
        <span>&#128336; ${classItem.startTime}${classItem.endTime ? ' – ' + classItem.endTime : ''}</span>
        <span>&#127919; ${typeMeta.label}</span>
      </div>
    </div>
    <div class="cover-ring">
      <div class="cover-ring-outer">
        <div class="cover-ring-pct">${attendanceRate}%</div>
        <div class="cover-ring-lbl">Attendance</div>
      </div>
    </div>
  </div>

  <!-- Performance Banner -->
  <div class="perf">
    <div>
      <div class="perf-tier">&#127942; ${tier} Performance</div>
      <div class="perf-sub">${typeMeta.label} &nbsp;·&nbsp; ${classItem.startTime} &nbsp;·&nbsp; Capacity ${classItem.capacity}</div>
    </div>
    <div class="perf-pct">${attendanceRate}%</div>
  </div>

  <!-- KPIs -->
  <div class="sec-title">Key Metrics</div>
  <div class="kpis">
    <div class="kpi">
      <div class="kpi-val">${effectivePresent}<span>/${effectiveTotal}</span></div>
      <div class="kpi-lbl">Participants</div>
      <div class="kpi-bar" style="background:linear-gradient(90deg,#3b82f6,#60a5fa);width:${pW}%;"></div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${utilizationRate}<span>%</span></div>
      <div class="kpi-lbl">Utilization</div>
      <div class="kpi-bar" style="background:linear-gradient(90deg,#10b981,#34d399);width:${utilizationRate}%;"></div>
    </div>
    <div class="kpi">
      <div class="kpi-val">$${earnings}</div>
      <div class="kpi-lbl">Est. Revenue</div>
      <div class="kpi-bar" style="background:linear-gradient(90deg,#f59e0b,#fbbf24);width:60%;"></div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${classItem.capacity}</div>
      <div class="kpi-lbl">Capacity</div>
      <div class="kpi-bar" style="background:linear-gradient(90deg,#a855f7,#c084fc);width:100%;"></div>
    </div>
  </div>

  <!-- Attendance Breakdown -->
  <div class="sec-title">Attendance Breakdown</div>
  <div class="bk-section">
    <div class="bk-bar-wrap">
      <div class="bk-seg-g" style="width:${pW}%;"></div>
      <div class="bk-seg-r" style="width:${aW}%;"></div>
      <div class="bk-seg-a" style="width:${nW}%;"></div>
    </div>
    <div class="bk-legend">
      <div class="bk-item"><div class="bk-dot" style="background:#22c55e;"></div> Present &nbsp;<strong>${presentCount}</strong></div>
      <div class="bk-item"><div class="bk-dot" style="background:#ef4444;"></div> Absent &nbsp;<strong>${absentCount}</strong></div>
      <div class="bk-item"><div class="bk-dot" style="background:#f59e0b;"></div> Pending &nbsp;<strong>${pendingCount}</strong></div>
    </div>
  </div>

  <!-- Participant List -->
  <div class="sec-title">Participant List</div>
  <div class="tbl-section">
    <table>
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Member</th>
          <th>ID</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${attendeeRows}</tbody>
    </table>
  </div>

  <!-- Performance Insights -->
  <div class="sec-title">Performance Insights</div>
  <div class="insights">
    <div class="insight-row">
      <div class="ins-dot"></div>
      <div><strong>Utilization:</strong> ${utilizationRate}% of capacity used.${utilizationRate < 50 ? ' Consider promoting this slot to increase sign-ups.' : utilizationRate > 90 ? ' High demand — consider adding another session.' : ' Healthy fill rate for this class.'}</div>
    </div>
    <div class="insight-row">
      <div class="ins-dot"></div>
      <div><strong>Attendance Rate:</strong> ${attendanceRate}% — ${tier} performance.${tier === 'Excellent' ? ' Great job keeping members engaged!' : tier === 'Poor' ? ' Follow up with absentees to improve retention.' : tier === 'Good' ? ' Strong showing — keep the momentum going.' : ' Room to grow — try targeted reminders before class.'}</div>
    </div>
    <div class="insight-row">
      <div class="ins-dot"></div>
      <div><strong>Revenue Estimate:</strong> $${earnings} based on ${effectivePresent} confirmed participant${effectivePresent !== 1 ? 's' : ''} at the standard rate.</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Generated ${new Date().toLocaleString()}</span>
    <span>Gym Management System &nbsp;·&nbsp; Class Report</span>
  </div>

</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`);
        pw.document.close();
    };

    return (
        <div className="crm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="crm-modal">

                {/* ── Header ── */}
                <div className="crm-header" style={{ '--type-gradient': typeMeta.gradient, '--type-color': typeMeta.color } as React.CSSProperties}>
                    <div className="crm-header-glow" />
                    <div className="crm-header-left">
                        <div className="crm-header-icon" style={{ background: typeMeta.gradient }}>
                            <FileText size={18} />
                        </div>
                        <div>
                            <h2 className="crm-title">Class Report</h2>
                            <p className="crm-subtitle">{classItem.title} &nbsp;·&nbsp; {classItem.date}</p>
                        </div>
                    </div>
                    <button className="crm-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="crm-body" id="report-content">

                    {/* Performance Banner */}
                    <div className="crm-banner" style={{ '--tier-color': tierColor } as React.CSSProperties}>
                        <div className="crm-banner-left">
                            <div className="crm-banner-icon">
                                <Award size={22} />
                            </div>
                            <div>
                                <div className="crm-banner-tier">{tier} Performance</div>
                                <div className="crm-banner-sub">{typeMeta.label}&nbsp;·&nbsp;{classItem.startTime}</div>
                            </div>
                        </div>
                        <div className="crm-attendance-ring">
                            <svg viewBox="0 0 36 36" className="crm-ring-svg">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.2"/>
                                <circle cx="18" cy="18" r="15.9" fill="none"
                                    stroke={tierColor} strokeWidth="3.2"
                                    strokeDasharray={`${attendanceRate} 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                    style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 4px ${tierColor})` }}
                                />
                            </svg>
                            <div className="crm-ring-val">
                                {attendanceRate}%
                                <small>attend</small>
                            </div>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="crm-kpis">
                        <div className="crm-kpi" style={{ '--kc': '#3b82f6' } as React.CSSProperties}>
                            <div className="crm-kpi-icon"><Users size={16}/></div>
                            <div className="crm-kpi-val">{effectivePresent}<span>/{effectiveTotal}</span></div>
                            <div className="crm-kpi-lbl">Participants</div>
                        </div>
                        <div className="crm-kpi" style={{ '--kc': '#10b981' } as React.CSSProperties}>
                            <div className="crm-kpi-icon"><TrendingUp size={16}/></div>
                            <div className="crm-kpi-val">{utilizationRate}<span>%</span></div>
                            <div className="crm-kpi-lbl">Utilization</div>
                        </div>
                        <div className="crm-kpi" style={{ '--kc': '#f59e0b' } as React.CSSProperties}>
                            <div className="crm-kpi-icon"><Zap size={16}/></div>
                            <div className="crm-kpi-val">${earnings}</div>
                            <div className="crm-kpi-lbl">Est. Revenue</div>
                        </div>
                        <div className="crm-kpi" style={{ '--kc': '#a855f7' } as React.CSSProperties}>
                            <div className="crm-kpi-icon"><Activity size={16}/></div>
                            <div className="crm-kpi-val">{classItem.capacity}</div>
                            <div className="crm-kpi-lbl">Capacity</div>
                        </div>
                    </div>

                    {/* Attendance Breakdown Bar */}
                    <div className="crm-section">
                        <div className="crm-section-head"><BarChart2 size={15}/> Attendance Breakdown</div>
                        <div className="crm-breakdown">
                            <div className="crm-bk-bar">
                                {effectiveTotal > 0 && <>
                                    <div className="crm-bk-seg seg-present"  style={{ width: `${(presentCount/effectiveTotal)*100}%` }}/>
                                    <div className="crm-bk-seg seg-absent"   style={{ width: `${(absentCount/effectiveTotal)*100}%` }}/>
                                    <div className="crm-bk-seg seg-pending"  style={{ width: `${(pendingCount/effectiveTotal)*100}%` }}/>
                                </>}
                            </div>
                            <div className="crm-bk-legend">
                                <span className="crm-bk-item"><span className="crm-bk-dot dot-green"/><CheckCircle2 size={12}/> Present <strong>{presentCount}</strong></span>
                                <span className="crm-bk-item"><span className="crm-bk-dot dot-red"/><XCircle size={12}/> Absent <strong>{absentCount}</strong></span>
                                <span className="crm-bk-item"><span className="crm-bk-dot dot-amber"/><AlertCircle size={12}/> Pending <strong>{pendingCount}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Attendee Table */}
                    <div className="crm-section">
                        <div className="crm-section-head"><Users size={15}/> Participant List
                            <span className="crm-section-badge">{attendees.length}</span>
                        </div>
                        {loading ? (
                            <div className="crm-loading">
                                <div className="crm-spinner"/>
                                <span>Loading participants…</span>
                            </div>
                        ) : attendees.length === 0 ? (
                            <div className="crm-empty">
                                <Users size={28}/>
                                <span>No attendees found</span>
                            </div>
                        ) : (
                            <div className="crm-table-wrap">
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Member</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.map((a, i) => (
                                            <tr key={a.id}>
                                                <td className="crm-td-num">{i + 1}</td>
                                                <td>
                                                    <div className="crm-member-row">
                                                        <div className="crm-avatar" style={{ background: typeMeta.gradient }}>
                                                            {(a.memberName?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <span>{a.memberName || `Member ${a.memberId}`}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`crm-badge crm-badge-${a.status.toLowerCase()}`}>
                                                        {a.status === 'CONFIRMED' && <CheckCircle2 size={11}/>}
                                                        {a.status === 'ABSENT'    && <XCircle size={11}/>}
                                                        {a.status === 'PENDING'   && <AlertCircle size={11}/>}
                                                        {a.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Performance Insights */}
                    <div className="crm-section">
                        <div className="crm-section-head"><Star size={15}/> Performance Insights</div>
                        <div className="crm-insights">
                            <div className="crm-insight-row">
                                <ChevronRight size={14} style={{ color: tierColor, flexShrink: 0 }}/>
                                <span>
                                    <strong>Utilization:</strong> {utilizationRate}% of capacity used.
                                    {utilizationRate < 50 && ' Consider promoting this slot.'}
                                    {utilizationRate > 90 && ' High demand — consider adding another session.'}
                                </span>
                            </div>
                            <div className="crm-insight-row">
                                <ChevronRight size={14} style={{ color: tierColor, flexShrink: 0 }}/>
                                <span>
                                    <strong>Overall:</strong> {tier} performance.
                                    {tier === 'Excellent' && ' Great job keeping members engaged!'}
                                    {tier === 'Poor'      && ' Follow up with absentees to improve retention.'}
                                    {tier === 'Good'      && ' Strong showing — keep the momentum going.'}
                                    {tier === 'Average'   && ' Room to grow — try targeted reminders before class.'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="crm-footer">
                    <span className="crm-footer-meta">
                        <Clock size={12}/> Generated {new Date().toLocaleString()}
                    </span>
                    <div className="crm-footer-actions">
                        <button className="crm-btn-ghost" onClick={onClose}>Close</button>
                        <button className="crm-btn-primary" style={{ background: typeMeta.gradient }} onClick={handleExport}>
                            <Download size={15}/> Export PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassReportModal;
