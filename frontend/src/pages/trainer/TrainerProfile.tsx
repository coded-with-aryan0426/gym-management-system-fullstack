import React, { useState } from 'react';
import { Camera, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Basic Info');
    const [formData, setFormData] = useState({
        fullName: 'John Smith',
        dob: '1990-01-15',
        gender: 'Male',
        bloodType: 'O+',
        employeeId: 'TR-00123',
        joiningDate: '2020-01-15',
        bio: 'Certified personal trainer with 8 years experience specializing in functional training and rehabilitation. Passionate about helping clients achieve sustainable lifestyle changes.'
    });

    const handleSave = () => {
        toast.success('Profile updated successfully');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header Layout Container */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-8">
                <div className="flex justify-between items-center max-w-[1400px] mx-auto w-full">
                    <h1 className="text-[28px] font-bold text-gray-900">My Profile</h1>
                    <button className="px-5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-6 pb-12">
                {/* Profile Header Card */}
                <div className="h-[200px] rounded-t-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] relative p-8">
                    {/* Action Buttons */}
                    <div className="absolute top-8 right-10 flex gap-3">
                        <button className="h-10 px-5 text-sm font-medium text-white bg-white/20 border border-white/30 rounded-lg backdrop-blur-md hover:bg-white/30 transition-colors">
                            Change Avatar
                        </button>
                        <button className="h-10 px-5 text-sm font-medium text-white bg-white/20 border border-white/30 rounded-lg backdrop-blur-md hover:bg-white/30 transition-colors">
                            Upload Photo
                        </button>
                    </div>

                    {/* Avatar & Info Row - Positioned absolutely to overlap */}
                    <div className="absolute top-[40px] left-[40px] flex items-center gap-6">
                        <div className="relative">
                            <div className="w-[128px] h-[128px] rounded-full border-4 border-white bg-gray-200 shadow-lg flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden">
                                {/* Placeholder Avatar */}
                                <img src="https://ui-avatars.com/api/?name=John+Smith&background=random" alt="John Smith" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 cursor-pointer border border-gray-200">
                                <Camera size={16} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="pt-12"> {/* Push text down to align visually below gradient header top */}
                            <h2 className="text-[28px] font-bold text-white mb-2 text-shadow-sm">John Smith</h2>
                            <p className="text-base text-white/90 font-normal">Certified Personal Trainer</p>
                            <div className="flex items-center gap-1 mt-2 text-sm text-white/90">
                                ⭐⭐⭐⭐⭐ 4.9/5.0 (127 reviews)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content Area */}
                <div className="bg-white border border-gray-200 rounded-b-xl pt-[80px] px-10 pb-10 shadow-sm relative -mt-[60px] z-0">
                    {/* Tabs Navigation */}
                    <div className="flex gap-8 border-b-2 border-gray-200 mb-8">
                        {['Basic Info', 'Contact', 'Professional', 'Stats', 'Security'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-[15px] font-medium transition-colors relative ${activeTab === tab
                                        ? 'text-[#4F46E5] font-semibold after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[#4F46E5] after:rounded-t-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content - Basic Info */}
                    {activeTab === 'Basic Info' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-8">
                                {/* Row 1 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all"
                                    />
                                </div>

                                {/* Row 2 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all appearance-none"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Type</label>
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all appearance-none"
                                    >
                                        <option>O+</option>
                                        <option>A+</option>
                                        <option>B+</option>
                                        <option>AB+</option>
                                    </select>
                                </div>

                                {/* Row 3 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                                    <input
                                        type="text"
                                        value={formData.employeeId}
                                        disabled
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.joiningDate}
                                        disabled
                                        className="w-full h-[44px] px-4 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>

                                {/* Row 4 - Full Width */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio / Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all resize-y min-h-[120px]"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                                <button className="h-[44px] px-6 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="h-[44px] px-8 bg-[#4F46E5] rounded-lg text-white font-semibold hover:bg-[#4338CA] transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'Basic Info' && (
                        <div className="py-12 text-center text-gray-500">
                            Content for {activeTab} tab would go here following the same grid layout.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
