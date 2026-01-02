import React, { useState } from 'react';
import { Bell, Moon, Sun, Smartphone, Calendar, Globe, Mail, ChevronRight, LogOut, HelpCircle, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TrainerSettings: React.FC = () => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [calendarSync, setCalendarSync] = useState(true);
    const [darkMode, setDarkMode] = useState(false); // Default to false (Light) given the new spec direction

    const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean, label: string) => {
        setter(!value);
        toast.success(`${label} ${!value ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">Settings</h1>
                <p className="text-sm font-normal text-gray-500">Manage your app preferences and integrations</p>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full space-y-6">

                {/* Visual Section */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Moon size={14} />
                            Appearance
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">Dark Mode</h4>
                                    <p className="text-sm text-gray-500">Switch between dark and light themes</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setDarkMode, darkMode, 'Dark Mode')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Bell size={14} />
                            Notifications
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
                                    <p className="text-sm text-gray-500">Receive daily summaries and important alerts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setEmailNotifs, emailNotifs, 'Email Notifications')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotifs ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-medium text-gray-900">Push Notifications</h4>
                                    <p className="text-sm text-gray-500">Get real-time updates on your device</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setPushNotifs, pushNotifs, 'Push Notifications')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${pushNotifs ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Integrations Section */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Globe size={14} />
                            Integrations
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">Google Calendar</h4>
                                    <p className="text-sm text-gray-500">Sync your sessions automatically</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(setCalendarSync, calendarSync, 'Calendar Sync')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${calendarSync ? 'bg-transparent border-red-200 text-red-600 hover:bg-red-50' : 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800'}`}
                            >
                                {calendarSync ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">Apple Health</h4>
                                    <p className="text-sm text-gray-500">Import step count and activity data</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>

                {/* Support & Danger Zone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between group hover:border-[#4F46E5] hover:shadow-md transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                <HelpCircle size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#4F46E5] transition-colors">Help & Support</h4>
                                <p className="text-sm text-gray-500">FAQs and Contact</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-[#4F46E5] transition-colors" />
                    </button>

                    <button className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between group hover:border-red-500 hover:shadow-md transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-lg text-red-500 group-hover:bg-red-100 transition-colors">
                                <LogOut size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">Log Out</h4>
                                <p className="text-sm text-gray-500">End your session</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>

                <div className="text-center pt-8 text-xs text-gray-400">
                    <p>Gym Management System v2.4.0</p>
                    <p>&copy; 2024 Titan Fitness. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default TrainerSettings;
