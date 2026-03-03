import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Activity, Target, Dumbbell, Camera, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';
import { showToast } from '../../../utils/toast';
import '../../styles/macos-member.css';
import './MyProgress.css';

// Import section components
import OverviewTab from './OverviewTab';
import MetricsTab from './MetricsTab';
import GoalsTab from './GoalsTab';
import WorkoutsTab from './WorkoutsTab';
import PhotosTab from './PhotosTab';
import TrainerNotesTab from './TrainerNotesTab';

// Import modal components
import LogProgressModal from './components/LogProgressModal';
import LogWorkoutModal from './components/LogWorkoutModal';
import CreateGoalModal from './components/CreateGoalModal';
import PhotoUploadModal from './components/PhotoUploadModal';
import PhotoGalleryModal from './components/PhotoGalleryModal';
import HistoryModal from './components/HistoryModal';

type TabType = 'overview' | 'metrics' | 'goals' | 'workouts' | 'photos' | 'notes';
type ModalType = 'logProgress' | 'logWorkout' | 'createGoal' | 'photoUpload' | 'history' | 'photoGallery' | null;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
};

const MyProgress: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('30D');
    const [saving, setSaving] = useState(false);

    const { user, isLoading: authLoading } = useAuth();
    const memberId = Number(user?.userId || user?.id);

    // State for modals - these will be passed down to modal components
    const [newProgress, setNewProgress] = useState({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        chest: '',
        waist: '',
        arms: '',
        legs: '',
        hips: '',
        shoulders: '',
        notes: ''
    });

    const [newWorkout, setNewWorkout] = useState({
        exercise: '',
        weight: '',
        reps: '',
        unit: 'lbs',
        category: 'push' as 'push' | 'pull' | 'legs' | 'core' | 'cardio',
        notes: ''
    });

    const [newGoal, setNewGoal] = useState({
        title: '',
        type: 'weight' as 'weight' | 'muscle' | 'bodyFat' | 'strength' | 'endurance',
        currentValue: '',
        targetValue: '',
        unit: 'kg',
        targetDate: '',
        weeklyTarget: ''
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoDescription, setPhotoDescription] = useState('');
    const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><BarChart3 size={14} /></svg> },
        { id: 'metrics', label: 'Metrics', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Activity size={14} /></svg> },
        { id: 'goals', label: 'Goals', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Target size={14} /></svg> },
        { id: 'workouts', label: 'Workouts', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Dumbbell size={14} /></svg> },
        { id: 'photos', label: 'Photos', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Camera size={14} /></svg> },
        { id: 'notes', label: 'Notes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Heart size={14} /></svg> }
    ];

    // Modal handlers
    const handleLogProgress = async () => {
        if (!memberId) {
            showToast.error('User session not found. Please log in again.');
            return;
        }

        if (!newProgress.weight && !newProgress.bodyFat && !newProgress.muscleMass && !newProgress.waist && !newProgress.chest) {
            showToast.error('Please enter at least some data to log');
            return;
        }

        const recordDate = new Date().toISOString().split('T')[0];
        const entryData = {
            recordDate,
            weight: newProgress.weight ? parseFloat(newProgress.weight) : undefined,
            bodyFat: newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : undefined,
            muscleMass: newProgress.muscleMass ? parseFloat(newProgress.muscleMass) : undefined,
            chest: newProgress.chest ? parseFloat(newProgress.chest) : undefined,
            waist: newProgress.waist ? parseFloat(newProgress.waist) : undefined,
            arms: newProgress.arms ? parseFloat(newProgress.arms) : undefined,
            legs: newProgress.legs ? parseFloat(newProgress.legs) : undefined,
            hips: newProgress.hips ? parseFloat(newProgress.hips) : undefined,
            shoulders: newProgress.shoulders ? parseFloat(newProgress.shoulders) : undefined,
            notes: newProgress.notes || undefined
        };

        try {
            setSaving(true);
            await memberProgressApi.createMetric(memberId, entryData);
            if (newProgress.waist || newProgress.chest || newProgress.arms || newProgress.hips) {
                await memberProgressApi.createMeasurement(memberId, entryData);
            }
            
            // Reset form and close modal
            setNewProgress({ weight: '', bodyFat: '', muscleMass: '', chest: '', waist: '', arms: '', legs: '', hips: '', shoulders: '', notes: '' });
            setActiveModal(null);
        } catch (error: any) {
            console.error('Error saving progress:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
            showToast.error(`Failed to save progress: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleLogWorkout = async () => {
        if (!newWorkout.exercise || !newWorkout.weight) {
            showToast.error('Please enter exercise and weight');
            return;
        }

        try {
            setSaving(true);
            const pbData = {
                exercise: newWorkout.exercise,
                weightValue: parseFloat(newWorkout.weight),
                reps: newWorkout.reps ? parseInt(newWorkout.reps) : undefined,
                unit: newWorkout.unit,
                recordDate: new Date().toISOString().split('T')[0],
                category: newWorkout.category,
                notes: newWorkout.notes || undefined
            };

            await memberProgressApi.createOrUpdatePersonalBest(memberId, pbData);
            setNewWorkout({ exercise: '', weight: '', reps: '', unit: 'lbs', category: 'push', notes: '' });
            setActiveModal(null);
        } catch (error) {
            console.error('Error saving PR:', error);
            showToast.error('Failed to save PR. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!newGoal.title || !newGoal.targetValue) {
            showToast.error('Please enter goal title and target value');
            return;
        }

        try {
            setSaving(true);
            const goalData = {
                title: newGoal.title,
                goalType: newGoal.type.toUpperCase(),
                startValue: newGoal.currentValue ? parseFloat(newGoal.currentValue) : 0,
                currentValue: newGoal.currentValue ? parseFloat(newGoal.currentValue) : 0,
                targetValue: parseFloat(newGoal.targetValue),
                unit: newGoal.unit,
                startDate: new Date().toISOString().split('T')[0],
                targetDate: newGoal.targetDate || undefined,
                weeklyTarget: newGoal.weeklyTarget ? parseFloat(newGoal.weeklyTarget) : undefined,
                isActive: true
            };

            await memberProgressApi.createGoal(memberId, goalData);
            setNewGoal({ title: '', type: 'weight', currentValue: '', targetValue: '', unit: 'kg', targetDate: '', weeklyTarget: '' });
            setActiveModal(null);
        } catch (error) {
            console.error('Error creating goal:', error);
            showToast.error('Failed to create goal. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async () => {
        if (!photoFile || !memberId) {
            showToast.error('Please select a photo');
            return;
        }

        try {
            setSaving(true);
            await memberProgressApi.uploadPhoto(memberId, photoFile, photoDescription, photoDate);
            
            // Reset form
            setPhotoFile(null);
            setPhotoDescription('');
            setPhotoDate(new Date().toISOString().split('T')[0]);
            setActiveModal(null);
        } catch (error) {
            console.error('Error uploading photo:', error);
            showToast.error('Failed to upload photo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            className="macos-page progress-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Quick Actions Bar */}
            <motion.div className="quick-actions-bar" variants={itemVariants}>
                <button className="quick-action-btn primary" onClick={() => setActiveModal('logProgress')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Plus size={16} /></svg>
                    Log Progress
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('logWorkout')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Dumbbell size={16} /></svg>
                    Log PR
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('createGoal')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Target size={16} /></svg>
                    New Goal
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('photoUpload')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Camera size={16} /></svg>
                    Add Photo
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('photoGallery')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Images size={16} /></svg>
                    View Gallery
                </button>
                <button className="quick-action-btn history-btn" onClick={() => setActiveModal('history')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><History size={16} /></svg>
                    History
                </button>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div className="chart-section__header" variants={itemVariants}>
                <div className="chart-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`chart-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="time-filters">
                    {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((range) => (
                        <button
                            key={range}
                            className={`time-filter ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="tab-content"
                >
                    {activeTab === 'overview' && <OverviewTab timeRange={timeRange} />}
                    {activeTab === 'metrics' && <MetricsTab timeRange={timeRange} />}
                    {activeTab === 'goals' && <GoalsTab />}
                    {activeTab === 'workouts' && <WorkoutsTab />}
                    {activeTab === 'photos' && <PhotosTab />}
                    {activeTab === 'notes' && <TrainerNotesTab />}
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'logProgress' && (
                    <LogProgressModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onSave={handleLogProgress}
                        saving={saving}
                        newProgress={newProgress}
                        setNewProgress={setNewProgress}
                    />
                )}
                
                {activeModal === 'logWorkout' && (
                    <LogWorkoutModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onSave={handleLogWorkout}
                        saving={saving}
                        newWorkout={newWorkout}
                        setNewWorkout={setNewWorkout}
                    />
                )}
                
                {activeModal === 'createGoal' && (
                    <CreateGoalModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onSave={handleCreateGoal}
                        saving={saving}
                        newGoal={newGoal}
                        setNewGoal={setNewGoal}
                    />
                )}
                
                {activeModal === 'photoUpload' && (
                    <PhotoUploadModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onSave={handlePhotoUpload}
                        saving={saving}
                        photoFile={photoFile}
                        setPhotoFile={setPhotoFile}
                        photoDescription={photoDescription}
                        setPhotoDescription={setPhotoDescription}
                        photoDate={photoDate}
                        setPhotoDate={setPhotoDate}
                    />
                )}
                
                {activeModal === 'photoGallery' && (
                    <PhotoGalleryModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onUpload={() => setActiveModal('photoUpload')}
                    />
                )}
                
                {activeModal === 'history' && (
                    <HistoryModal
                        isOpen={true}
                        onClose={() => setActiveModal(null)}
                        onAddEntry={() => setActiveModal('logProgress')}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyProgress;