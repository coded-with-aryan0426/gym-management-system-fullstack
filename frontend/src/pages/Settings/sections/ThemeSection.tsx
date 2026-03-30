"use client"

import type React from "react"
import { Monitor, Sun, Moon, Palette, MessageSquare } from "lucide-react"
import { useTheme, type ThemeMode } from "../../../contexts/ThemeContext"
import { useFeatureContext } from "../../../contexts/FeatureContext"

const ThemeSection: React.FC = () => {
    const { themeMode, setThemeMode, resolvedTheme } = useTheme()
    const { localFeatures, toggleLocalFeature } = useFeatureContext()

    const isChatEnabled = localFeatures['chat-enabled'] !== false

    const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
        {
            id: 'system',
            label: 'System',
            icon: <Monitor size={18} />,
            desc: 'Follow system preference'
        },
        {
            id: 'light',
            label: 'Light',
            icon: <Sun size={18} />,
            desc: 'Always use light theme'
        },
        {
            id: 'dark',
            label: 'Dark',
            icon: <Moon size={18} />,
            desc: 'Always use dark theme'
        },
    ]

    return (
        <div className="settings-section settings-section--purple">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon settings-section__icon--purple">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Appearance</h2>
                        <p className="settings-section__description">
                            Customize the look and feel of your dashboard
                        </p>
                    </div>
                </div>
            </div>

            <div className="settings-section__content">
                <div className="form-group">
                    <div className="form-group__header">
                        <Palette size={16} />
                        <h4 className="form-group__title">Theme</h4>
                    </div>

                    <div className="theme-selector">
                        {themeOptions.map((option) => (
                            <button
                                key={option.id}
                                className={`theme-option ${themeMode === option.id ? 'theme-option--active' : ''}`}
                                onClick={() => setThemeMode(option.id)}
                            >
                                <div className="theme-option__icon">
                                    {option.icon}
                                </div>
                                <div className="theme-option__text">
                                    <span className="theme-option__label">{option.label}</span>
                                    <span className="theme-option__desc">{option.desc}</span>
                                </div>
                                {themeMode === option.id && (
                                    <div className="theme-option__check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="policy-note">
                        <div className="policy-note__icon">
                            <Monitor size={16} />
                        </div>
                        <span>
                            <strong>Current theme:</strong> {resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode
                            {themeMode === 'system' && ' (following system preference)'}
                        </span>
                    </div>
                </div>

{/*}
                <div className="form-group">
                    <div className="form-group__header">
                        <MessageSquare size={16} />
                        <h4 className="form-group__title">Chat Feature</h4>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-option__info">
                            <span className="toggle-option__label">Enable Chat</span>
                            <span className="toggle-option__desc">
                                Show chat messages, notifications, and real-time messaging
                            </span>
                        </div>
                        <button
                            className={`toggle-switch ${isChatEnabled ? 'toggle-switch--active' : ''}`}
                            onClick={() => toggleLocalFeature('chat-enabled')}
                            role="switch"
                            aria-checked={isChatEnabled}
                        >
                            <span className="toggle-switch__thumb" />
                        </button>
                    </div>

                    <div className="policy-note">
                        <div className="policy-note__icon">
                            <MessageSquare size={16} />
                        </div>
                        <span>
                            <strong>Status:</strong> {isChatEnabled ? 'Chat is enabled' : 'Chat is disabled'}
                            {!isChatEnabled && ' - Disabling saves bandwidth and CPU'}
                        </span>
                    </div>
                </div>
{*/}
            </div>
        </div>
    )
}

export default ThemeSection
