import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import type { Equipment, EquipmentStats, EquipmentStatus, EquipmentCategory } from '../../types/equipment';
import { equipmentApi } from '../../services/equipmentApi';
import EquipmentGrid from './components/EquipmentGrid';
import EquipmentModal from './components/EquipmentModal';
import MaintenancePanel from './components/MaintenancePanel';
import { Plus, Search, X, LayoutGrid, Layout, Maximize2, ChevronDown, Activity, Wrench, AlertTriangle, Package, RefreshCw, Filter } from 'lucide-react';
import './Equipment.css';

type GridDensity = 'compact' | 'comfortable' | 'spacious';

const EquipmentPage: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [stats, setStats] = useState<EquipmentStats>({ total: 0, active: 0, maintenance: 0, outOfOrder: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<EquipmentStatus | 'ALL' | null>('ALL');
    const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'ALL'>('ALL');
    const [selectedLocation, setSelectedLocation] = useState<string | 'ALL'>('ALL');
    const [gridDensity, setGridDensity] = useState<GridDensity>('comfortable');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, statsData] = await Promise.all([
                equipmentApi.getAll(),
                equipmentApi.getStats()
            ]);
            setEquipmentList(data);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load equipment data', error);
            setError('Failed to load equipment data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (data: Partial<Equipment>) => {
        try {
            await equipmentApi.create(data);
            loadData();
        } catch (error) {
            console.error('Failed to create equipment', error);
        }
    };

    const handleEdit = async (data: Partial<Equipment>) => {
        if (!editingEquipment) return;
        try {
            await equipmentApi.update(editingEquipment.id, data);
            setEditingEquipment(null);
            loadData();
        } catch (error) {
            console.error('Failed to update equipment', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to retire this equipment?')) {
            try {
                await equipmentApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete equipment', error);
            }
        }
    };

    const uniqueLocations = useMemo(() => {
        const locs = new Set(equipmentList.map(item => item.location).filter(Boolean));
        return ['ALL', ...Array.from(locs).sort()];
    }, [equipmentList]);

    const filteredList = useMemo(() => {
        return equipmentList.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = activeStatusFilter === 'ALL' || activeStatusFilter === null || item.status === activeStatusFilter;
            const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
            const matchesLocation = selectedLocation === 'ALL' || item.location === selectedLocation;
            return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
        });
    }, [equipmentList, searchQuery, activeStatusFilter, selectedCategory, selectedLocation]);

    // Count active filters
    const activeFilterCount = [
        searchQuery ? 1 : 0,
        activeStatusFilter !== 'ALL' ? 1 : 0,
        selectedCategory !== 'ALL' ? 1 : 0,
        selectedLocation !== 'ALL' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('ALL');
        setSelectedLocation('ALL');
        setActiveStatusFilter('ALL');
    };

    // Compute extra stats from data
    const totalValue = useMemo(() =>
        equipmentList.reduce((sum, eq) => sum + (eq.purchaseCost || 0), 0),
    [equipmentList]);

    const overdueCount = useMemo(() =>
        equipmentList.filter(eq => eq.nextMaintenanceDueDate && new Date(eq.nextMaintenanceDueDate) < new Date() && eq.status !== 'MAINTENANCE').length,
    [equipmentList]);

    const categories: (EquipmentCategory | 'ALL')[] = ['ALL', 'CARDIO', 'STRENGTH', 'FUNCTIONAL', 'YOGA', 'RECOVERY'];

    const statItems = [
        { label: 'Total', value: stats.total, color: 'var(--accent-primary)', icon: Package },
        { label: 'Active', value: stats.active, color: 'var(--status-active)', icon: Activity },
        { label: 'Repair', value: stats.maintenance, color: 'var(--status-maintenance)', icon: Wrench },
        { label: 'Offline', value: stats.outOfOrder, color: 'var(--status-outoforder)', icon: AlertTriangle }
    ];

    const statusFilters: { key: EquipmentStatus | 'ALL'; label: string; color: string; count: number }[] = [
        { key: 'ALL', label: 'All', color: 'var(--accent-primary)', count: stats.total },
        { key: 'ACTIVE', label: 'Active', color: 'var(--status-active)', count: stats.active },
        { key: 'MAINTENANCE', label: 'In Service', color: 'var(--status-maintenance)', count: stats.maintenance },
        { key: 'OUT_OF_ORDER', label: 'Offline', color: 'var(--status-outoforder)', count: stats.outOfOrder },
    ];

    return (
        <div className="equipment-page">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="page-header"
            >
                <div className="header-left">
                    <h1 className="header-title">Equipment</h1>
                    <p className="header-subtitle">
                        Manage and monitor your fitness equipment fleet
                        {totalValue > 0 && (
                            <> — <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(totalValue)}</strong> total asset value</>
                        )}
                    </p>
                </div>

                <div className="header-right">
                    <div className="stats-summary-premium">
                        {statItems.map((stat, i) => (
                            <div
                                key={i}
                                className="stat-pill-v2"
                                style={{ '--_pill-color': stat.color } as React.CSSProperties}
                            >
                                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15` }}>
                                    <stat.icon size={15} style={{ color: stat.color }} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Overdue alert */}
            {overdueCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)]"
                >
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-300">
                        {overdueCount} equipment{overdueCount > 1 ? 's are' : ' is'} overdue for maintenance
                    </span>
                    <button
                        onClick={() => setActiveStatusFilter('ACTIVE')}
                        className="ml-auto text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                    >
                        View
                    </button>
                </motion.div>
            )}

            {/* Controls & Filters Area */}
            <div className="toolbar-section">
                <div className="toolbar-main">
                    <div className="search-box-v2 group">
                        <Search className="search-icon-v2" size={16} />
                        <input
                            type="text"
                            placeholder="Search by equipment, brand, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-v2"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="search-clear-v2">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="toolbar-actions">
                        <div className="select-wrapper-v2">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="select-v2"
                            >
                                <option value="ALL">All Locations</option>
                                {uniqueLocations.filter(l => l !== 'ALL').map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            <ChevronDown size={14} className="select-chevron-v2" />
                        </div>

                        <div className="view-toggle-v2">
                            {[
                                { id: 'compact', icon: LayoutGrid, label: 'Compact' },
                                { id: 'comfortable', icon: Layout, label: 'Grid' },
                                { id: 'spacious', icon: Maximize2, label: 'Large' }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setGridDensity(view.id as GridDensity)}
                                    className={`toggle-btn-v2 ${gridDensity === view.id ? 'active' : ''}`}
                                    title={view.label}
                                >
                                    <view.icon size={15} />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={loadData}
                            className="toggle-btn-v2"
                            title="Refresh"
                            style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                        >
                            <RefreshCw size={15} />
                        </button>

                        <button
                            className="btn-primary-premium"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus size={18} />
                            <span>Add Equipment</span>
                        </button>
                    </div>
                </div>

                {/* Category + Status Filters */}
                <div className="filter-row">
                    <div className="category-nav-v2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`nav-item-v2 ${selectedCategory === cat ? 'active' : ''}`}
                            >
                                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    {!loading && (
                        <span className="results-count">
                            Showing <strong>{filteredList.length}</strong> of <strong>{equipmentList.length}</strong> equipment
                            {activeFilterCount > 0 && (
                                <>
                                    <span className="active-filters-count">
                                        <Filter size={8} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                                        {activeFilterCount}
                                    </span>
                                    <button
                                        onClick={clearAllFilters}
                                        className="ml-2 text-[11px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer bg-transparent border-none"
                                    >
                                        Clear filters
                                    </button>
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* Grid Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="eq-loading-state"
                    >
                        <div className="eq-spinner">
                            <div className="eq-spinner__glow" />
                            <div className="eq-spinner__ring" />
                        </div>
                        <p className="mt-4 text-xs font-medium text-[var(--text-secondary)]">Loading equipment...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="eq-error-state"
                    >
                        <AlertTriangle size={28} className="text-red-400 mb-3 opacity-60" />
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Error Loading Equipment</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-4">{error}</p>
                        <button onClick={loadData} className="btn-primary-premium" style={{ height: '36px', fontSize: '0.75rem' }}>
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    </motion.div>
                ) : filteredList.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="eq-empty-state"
                    >
                        <div className="eq-empty-state__icon">
                            <Search size={28} className="text-[var(--text-secondary)] opacity-40" />
                        </div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">No equipment found</h3>
                        <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-5">
                            {activeFilterCount > 0
                                ? 'Try adjusting your filters or search query.'
                                : 'Get started by adding your first piece of equipment.'
                            }
                        </p>
                        {activeFilterCount > 0 ? (
                            <button
                                onClick={clearAllFilters}
                                className="btn-primary-premium"
                                style={{ height: '36px', fontSize: '0.75rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}
                            >
                                Clear All Filters
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="btn-primary-premium"
                                style={{ height: '36px', fontSize: '0.75rem' }}
                            >
                                <Plus size={14} />
                                Add Equipment
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <EquipmentGrid
                        equipmentList={filteredList}
                        density={gridDensity}
                        onEdit={(eq) => setEditingEquipment(eq)}
                        onDelete={handleDelete}
                        onMaintenance={(eq) => setMaintenanceEquipment(eq)}
                    />
                )}
            </AnimatePresence>

            <EquipmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAdd} />
            <EquipmentModal isOpen={!!editingEquipment} onClose={() => setEditingEquipment(null)} onSubmit={handleEdit} initialData={editingEquipment} />
            <MaintenancePanel isOpen={!!maintenanceEquipment} onClose={() => { setMaintenanceEquipment(null); loadData(); }} equipment={maintenanceEquipment} />
        </div>
    );
};

export default EquipmentPage;
