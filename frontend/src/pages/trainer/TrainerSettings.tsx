import React, { useState } from 'react';
import { Bell, Moon, Sun, Smartphone, Calendar, Shield, HelpCircle, ChevronRight, LogOut, Globe, Mail } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { toast } from 'react-hot-toast';
import './Trainer.css';

const TrainerSettings: React.FC = () => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [calendarSync, setCalendarSync] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean, label: string) => {
        setter(!value);
        toast.success(`${label} ${!value ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="trainer-dashboard fade-in max-w-4xl mx-auto">
            <PageHeader
                title="Settings"
                subtitle="Manage your app preferences and integrations"
            />

            <div className="space-y-6 mt-8">
                {/* Visual Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Moon size={16} />
                            Appearance
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Dark Mode</h4>
                                    <p className="text-sm text-zinc-500">Switch between dark and light themes</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setDarkMode, darkMode, 'Dark Mode')}
                                className={`w-14 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Bell size={16} />
                            Notifications
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        <div className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-medium text-white">Email Notifications</h4>
                                    <p className="text-sm text-zinc-500">Receive daily summaries and important alerts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setEmailNotifs, emailNotifs, 'Email Notifications')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotifs ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-medium text-white">Push Notifications</h4>
                                    <p className="text-sm text-zinc-500">Get real-time updates on your device</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setPushNotifs, pushNotifs, 'Push Notifications')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${pushNotifs ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Integrations Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Globe size={16} />
                            Integrations
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Google Calendar</h4>
                                    <p className="text-sm text-zinc-500">Sync your sessions automatically</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setCalendarSync, calendarSync, 'Calendar Sync')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${calendarSync ? 'bg-transparent border-red-500/50 text-red-500 hover:bg-red-500/10' : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'}`}
                            >
                                {calendarSync ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Apple Health</h4>
                                    <p className="text-sm text-zinc-500">Import step count and activity data</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>

                {/* Support & Danger Zone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                <HelpCircle size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">Help & Support</h4>
                                <p className="text-sm text-zinc-500">FAQs and Contact</p>
                            </div>
                        </div>
                        <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between group hover:border-red-500/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-red-500 transition-colors">
                                <LogOut size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-white group-hover:text-red-500 transition-colors">Log Out</h4>
                                <p className="text-sm text-zinc-500">End your session</p>
                            </div>
                        </div>
                        <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                </div>

                <div className="text-center pt-8 text-xs text-zinc-600">
                    <p>Gym Management System v2.4.0</p>
                    <p>&copy; 2024 Titan Fitness. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default TrainerSettings;
