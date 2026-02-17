import React, { useState, useEffect } from 'react';
import { X, Download, Users, Clock, Star, TrendingUp, Calendar, AlertCircle, FileText } from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { ClassAttendee, TrainerClassItem } from '../../services/trainerApi';
import './ClassReportModal.css';

interface ClassReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    classItem: TrainerClassItem | null;
}

const ClassReportModal: React.FC<ClassReportModalProps> = ({
    isOpen,
    onClose,
    classItem
}) => {
    const [attendees, setAttendees] = useState<ClassAttendee[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && classItem) {
            setLoading(true);
            trainerApi.getClassAttendees(classItem.id)
                .then(data => setAttendees(data))
                .catch(err => console.error("Failed to fetch attendees", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, classItem]);

    if (!isOpen || !classItem) return null;

    // Calculate metrics
    const totalEnrolled = classItem.enrolled;
    const presentCount = attendees.filter(a => a.status === 'CONFIRMED').length;
    const absentCount = attendees.filter(a => a.status === 'ABSENT').length;
    const pendingCount = attendees.filter(a => a.status === 'PENDING').length;

    // Use fetched counts if available, otherwise fall back to classItem snapshot
    // Actually, classItem.attendees might be stale if we just updated. 
    // Just using fetched counts for consistency if they match up, 
    // but classItem has the summary. Let's trust classItem for the fast stats, 
    // but attendes list for the table.
    // However, for consistency, let's recalculate rates based on the fetched list if loaded.
    const effectivePresent = loading ? classItem.attendees.confirmed : presentCount;
    const effectiveTotal = classItem.enrolled; // Enrolled count comes from class metadata

    const attendanceRate = effectiveTotal > 0
        ? Math.round((effectivePresent / effectiveTotal) * 100)
        : 0;

    const utilizationRate = classItem.capacity > 0
        ? Math.round((effectiveTotal / classItem.capacity) * 100)
        : 0;

    // Determine performance tier
    let tier = 'Average';
    let tierColor = 'average';
    if (attendanceRate >= 90) { tier = 'Excellent'; tierColor = 'excellent'; }
    else if (attendanceRate >= 75) { tier = 'Good'; tierColor = 'good'; }
    else if (attendanceRate < 50) { tier = 'Poor'; tierColor = 'poor'; }

    // Mock earnings calculation based on type
    const baseRate = classItem.type === 'pt' ? 80 : 15;
    const earnings = classItem.type === 'pt'
        ? (effectivePresent > 0 ? baseRate : 0)
        : (effectivePresent * baseRate);

    const handleExport = () => {
        const printContent = document.getElementById('report-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Class Report - ${classItem.title}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; color: #000; padding: 40px; }
                        h1 { font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 30px; }
                        .meta-item { font-size: 14px; }
                        .stats-grid { display: flex; gap: 20px; margin-bottom: 30px; }
                        .stat-card { border: 1px solid #ddd; padding: 15px; flex: 1; border-radius: 8px; text-align: center; }
                        .stat-value { font-size: 24px; font-weight: bold; display: block; }
                        .stat-label { font-size: 12px; text-transform: uppercase; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
                        th { background-color: #f9f9f9; font-size: 12px; text-transform: uppercase; }
                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .badge.confirmed { background: #dcfce7; color: #166534; }
                        .badge.absent { background: #fee2e2; color: #991b1b; }
                        .badge.pending { background: #fef9c3; color: #854d0e; }
                    </style>
                </head>
                <body>
                    <h1>Class Performance Report</h1>
                    <div class="meta-grid">
                        <div class="meta-item"><strong>Class:</strong> ${classItem.title}</div>
                        <div class="meta-item"><strong>Date:</strong> ${classItem.date}</div>
                        <div class="meta-item"><strong>Time:</strong> ${classItem.startTime}</div>
                        <div class="meta-item"><strong>Trainer:</strong> Aryan (Lead Trainer)</div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <span class="stat-value">${attendanceRate}%</span>
                            <span class="stat-label">Attendance</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">${effectivePresent}/${effectiveTotal}</span>
                            <span class="stat-label">Participants</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">$${earnings}</span>
                            <span class="stat-label">Revenue</span>
                        </div>
                    </div>

                    <h3>Attendee List</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Member ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attendees.map(a => `
                                <tr>
                                    <td>${a.memberName || 'Unknown Member'}</td>
                                    <td><span class="badge ${a.status.toLowerCase()}">${a.status}</span></td>
                                    <td>#${a.memberId}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        Generated on ${new Date().toLocaleString()} • Gym Management System
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="report-modal-overlay">
            <div className="report-modal">
                <div className="report-modal__header">
                    <div className="report-modal__title">
                        <h2>
                            <FileText size={20} className="text-blue-500" />
                            Class Report
                        </h2>
                        <div className="report-modal__date">
                            {classItem.title} • {classItem.date}
                        </div>
                    </div>
                    <button className="report-modal__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="report-modal__content" id="report-content">
                    {/* Key Metrics Grid */}
                    <div className="report-stats-grid">
                        <div className="report-stat-card">
                            <span className={`report-stat-value ${tierColor}`}>{attendanceRate}%</span>
                            <span className="report-stat-label">Attendance Rate</span>
                        </div>
                        <div className="report-stat-card">
                            <span className="report-stat-value">{effectivePresent}/{effectiveTotal}</span>
                            <span className="report-stat-label">Participants</span>
                        </div>
                        <div className="report-stat-card">
                            <span className="report-stat-value text-green-400">${earnings}</span>
                            <span className="report-stat-label">Est. Revenue</span>
                        </div>
                    </div>

                    {/* Attendance List (New) */}
                    <div className="report-section">
                        <div className="report-section-title">
                            <Users size={16} /> Participant List
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-zinc-500">Loading data...</div>
                        ) : (
                            <div className="report-table-container">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.length > 0 ? attendees.map(attendee => (
                                            <tr key={attendee.id}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                                                            {attendee.memberName?.[0] || '?'}
                                                        </div>
                                                        {attendee.memberName || `Member ${attendee.memberId}`}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${attendee.status.toLowerCase()}`}>
                                                        {attendee.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={2} className="text-center py-4 text-zinc-500">No attendees found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Class Details / Performance */}
                    <div className="report-section">
                        <div className="report-section-title">
                            <Star size={16} /> Performance Insights
                        </div>
                        <div className="report-notes">
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>Utilization:</strong> {utilizationRate}% of capacity used.
                                {utilizationRate < 50 && " Consider promoting this slot locally."}
                                {utilizationRate > 90 && " High demand! Consider adding another session."}
                            </p>
                            <p>
                                <strong>Class Status:</strong> {tier} Performance.
                                {tier === 'Excellent' && " Great job keeping members engaged!"}
                                {tier === 'Poor' && " Follow up with absentees to improve retention."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="report-modal__footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button className="btn-primary" onClick={handleExport}>
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassReportModal;
