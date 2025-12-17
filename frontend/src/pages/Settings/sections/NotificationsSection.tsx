"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface NotificationSettings {
    membershipExpiry: boolean
    paymentFailure: boolean
    lowAttendance: boolean
    dailySummary: boolean
    weeklySummary: boolean
}

const NotificationsSection: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        membershipExpiry: true,
        paymentFailure: true,
        lowAttendance: false,
        dailySummary: false,
        weeklySummary: true,
    })

    const updateSetting = (key: keyof NotificationSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        toast.success("Notification setting updated")
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Notifications</h2>
                    <p className="settings-section__description">
                        Actionable signals only. These drive decisions.
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Critical Alerts */}
                <div className="form-group">
                    <h4 className="form-group__title">Critical Alerts</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Membership Expiry
                                <div className="info-icon" data-tooltip="Get notified when memberships are about to expire or have expired.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${settings.membershipExpiry ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('membershipExpiry')}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Payment Failure
                                <div className="info-icon" data-tooltip="Immediate notification when an auto-renewal payment fails.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${settings.paymentFailure ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('paymentFailure')}
                        />
                    </div>
                </div>

                {/* Engagement Alerts */}
                <div className="form-group">
                    <h4 className="form-group__title">Engagement</h4>
                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Low Attendance
                                <div className="info-icon" data-tooltip="Get notified when a member hasn't visited in 2+ weeks.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${settings.lowAttendance ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('lowAttendance')}
                        />
                    </div>
                </div>

                {/* Summary Reports */}
                <div className="form-group">
                    <h4 className="form-group__title">Digests</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Daily Summary
                                <div className="info-icon" data-tooltip="Daily digest of new members, payments, and key metrics.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${settings.dailySummary ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('dailySummary')}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Weekly Summary
                                <div className="info-icon" data-tooltip="Weekly report with revenue, member growth, and trends.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${settings.weeklySummary ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('weeklySummary')}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
