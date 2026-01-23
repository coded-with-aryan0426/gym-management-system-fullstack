import React, { useState, useEffect, useMemo } from 'react';
import type { Equipment, EquipmentStats, EquipmentStatus, EquipmentCategory } from '../../types/equipment';
import { equipmentApi } from '../../services/equipmentApi';
import EquipmentGrid from './components/EquipmentGrid';
import EquipmentModal from './components/EquipmentModal';
import MaintenancePanel from './components/MaintenancePanel';
import { Plus, Search, Filter, X, LayoutGrid, Layout, Maximize2, Dumbbell, Wrench, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import Button from '../../components/Form/Button';
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
    const [selectedBrand, setSelectedBrand] = useState<string | 'ALL'>('ALL');
    const [gridDensity, setGridDensity] = useState<GridDensity>('comfortable');

    // Modals
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

    const uniqueBrands = useMemo(() => {
        const brands = new Set(equipmentList.map(item => item.brand).filter(Boolean));
        return ['ALL', ...Array.from(brands).sort()];
    }, [equipmentList]);

    const filteredList = useMemo(() => {
        return equipmentList.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = activeStatusFilter === 'ALL' || activeStatusFilter === null || item.status === activeStatusFilter;
            const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
            const matchesLocation = selectedLocation === 'ALL' || item.location === selectedLocation;
            const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;

            return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesBrand;
        });
    }, [equipmentList, searchQuery, activeStatusFilter, selectedCategory, selectedLocation, selectedBrand]);

    const categories: (EquipmentCategory | 'ALL')[] = ['ALL', 'CARDIO', 'STRENGTH', 'FUNCTIONAL', 'YOGA', 'RECOVERY'];

    return (
        <div className="equipment-page space-y-5">
            {/* 1. Top Header: Title + KPIs + Add Button */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Equipment Management</h1>
                        <span className="text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/20">
                            PRO MAX
                        </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium opacity-80">
                        Track inventory, schedule maintenance, and monitor usage.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Status Pills (Moved to Header) */}
                    <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-color)] p-1.5 rounded-lg shadow-sm">
                        {[
                            { id: 'ALL', label: 'Total', value: stats.total, color: 'text-[var(--text-primary)]' },
                            { id: 'ACTIVE', label: 'Active', value: stats.active, color: 'text-[var(--status-active)]' },
                            { id: 'MAINTENANCE', label: 'Fixing', value: stats.maintenance, color: 'text-[var(--status-maintenance)]' },
                            { id: 'OUT_OF_ORDER', label: 'Broken', value: stats.outOfOrder, color: 'text-[var(--status-outoforder)]' },
                        ].map((stat) => {
                            const isActive = activeStatusFilter === stat.id || (activeStatusFilter === null && stat.id === 'ALL');
                            return (
                                <button
                                    key={stat.id}
                                    onClick={() => setActiveStatusFilter(isActive ? 'ALL' : stat.id as any)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200
                                        ${isActive
                                            ? 'bg-[var(--bg-surface-secondary)] shadow-sm'
                                            : 'hover:bg-[var(--bg-surface-secondary)]/50 opacity-60 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{stat.label}</span>
                                    <span className={`text-xs font-bold font-mono ${stat.color}`}>{stat.value}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Separator */}
                    <div className="h-8 w-px bg-[var(--border-color)]/60" />

                    <button
                        className="add-equipment-btn group"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Equipment</span>
                    </button>
                </div>
            </div>

            {/* 2. Controls Row: Search + Filters + View Toggle */}
            <div className="flex flex-col gap-4">
                <div className="control-bar">
                    {/* Left: Search & Dropdowns */}
                    <div className="flex items-center gap-3 flex-1">
                        {/* Compact Search */}
                        <div className="search-container group transition-all duration-300 focus-within:w-72">
                            <Search className="search-icon" size={14} />
                            <input
                                type="text"
                                placeholder="Search equipment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
                                >
                                    <X size={10} />
                                </button>
                            )}
                        </div>

                        {/* Location Filter */}
                        <div className="relative group">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="appearance-none bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 pl-3 pr-8 rounded-lg cursor-pointer outline-none transition-all shadow-sm w-32 truncate focus:ring-2 focus:ring-[var(--glow-color)] focus:border-[var(--accent-primary)]"
                            >
                                <option value="ALL">All Locations</option>
                                {uniqueLocations.filter(l => l !== 'ALL').map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]" />
                        </div>

                        {/* Brand Filter */}
                        <div className="relative group">
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="appearance-none bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 pl-3 pr-8 rounded-lg cursor-pointer outline-none transition-all shadow-sm w-32 truncate focus:ring-2 focus:ring-[var(--glow-color)] focus:border-[var(--accent-primary)]"
                            >
                                <option value="ALL">All Brands</option>
                                {uniqueBrands.filter(b => b !== 'ALL').map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]" />
                        </div>
                    </div>

                    {/* Right: View Toggles */}
                    <div className="bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-color)] flex items-center gap-1 shadow-sm">
                        <button
                            onClick={() => setGridDensity('compact')}
                            className={`p-1.5 rounded-md transition-all ${gridDensity === 'compact' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            title="Compact"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            onClick={() => setGridDensity('comfortable')}
                            className={`p-1.5 rounded-md transition-all ${gridDensity === 'comfortable' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            title="Comfortable"
                        >
                            <Layout size={14} />
                        </button>
                        <button
                            onClick={() => setGridDensity('spacious')}
                            className={`p-1.5 rounded-md transition-all ${gridDensity === 'spacious' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            title="Spacious"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                {/* 3. Category Tabs (Pills Style) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 border
                                    ${isSelected
                                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md shadow-[var(--glow-color)]'
                                        : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                    <div className="w-12 h-12 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium animate-pulse">Scanning inventory...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--status-outoforder)]">
                    <p className="mb-4">{error}</p>
                    <Button variant="secondary" onClick={loadData}>
                        Retry
                    </Button>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
                    <div className="p-6 bg-[var(--bg-surface)] rounded-2xl mb-4 shadow-xl shadow-[rgba(0,0,0,0.05)]">
                        <Search size={40} className="text-[var(--text-secondary)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No equipment found</h3>
                    <p className="text-[var(--text-secondary)] max-w-sm text-center mb-8">
                        We couldn't find any equipment matching your criteria. Try adjusting your filters or search terms.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => {
                            setSearchQuery('');
                            setActiveStatusFilter('ALL');
                            setSelectedCategory('ALL');
                            setSelectedLocation('ALL');
                            setSelectedBrand('ALL');
                        }}>
                            Reset All Filters
                        </Button>
                    </div>
                </div>
            ) : (
                <EquipmentGrid
                    equipmentList={filteredList}
                    density={gridDensity}
                    onEdit={(eq) => setEditingEquipment(eq)}
                    onDelete={handleDelete}
                    onMaintenance={(eq) => setMaintenanceEquipment(eq)}
                />
            )}

            {/* Modals */}
            <EquipmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAdd}
            />

            <EquipmentModal
                isOpen={!!editingEquipment}
                onClose={() => setEditingEquipment(null)}
                onSubmit={handleEdit}
                initialData={editingEquipment}
            />

            <MaintenancePanel
                isOpen={!!maintenanceEquipment}
                onClose={() => setMaintenanceEquipment(null)}
                equipment={maintenanceEquipment}
            />
        </div>
    );
};

export default EquipmentPage;
