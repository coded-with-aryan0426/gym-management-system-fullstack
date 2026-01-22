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
        <div className="equipment-page">
            {/* Header */}
            <div className="equipment-header">
                <div className="equipment-title">
                    <h1>Equipment Management</h1>
                    <p>Track inventory, schedule maintenance, and monitor usage.</p>
                </div>
                <button
                    className="add-equipment-btn group"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
                    <span>Add Equipment</span>
                </button>
            </div>

            {/* Unified Control Bar & Stats */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="control-bar flex items-center justify-between p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm">
                    
                    {/* Search Section */}
                    <div className="search-container relative group w-40 shrink-0 px-2 mr-2">
                        <Search className="search-icon absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input w-full bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] group-focus-within:border-[var(--accent-primary)] text-[var(--text-primary)] rounded-full py-1.5 pl-9 pr-8 outline-none transition-all duration-300 text-xs placeholder-[var(--text-secondary)]"
                        />
                         {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Separator */}
                    <div className="h-6 w-px bg-[var(--border-color)] mx-2" />

                    {/* Filters Section */}
                    <div className="flex items-center gap-4 px-2">
                        <div className="relative group">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="appearance-none bg-transparent text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:text-[var(--accent-primary)] py-2 pl-2 pr-6 cursor-pointer outline-none transition-colors"
                            >
                                <option value="ALL">All Locations</option>
                                {uniqueLocations.filter(l => l !== 'ALL').map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        <div className="relative group">
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="appearance-none bg-transparent text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:text-[var(--accent-primary)] py-2 pl-2 pr-6 cursor-pointer outline-none transition-colors"
                            >
                                <option value="ALL">All Brands</option>
                                {uniqueBrands.filter(b => b !== 'ALL').map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-6 w-px bg-[var(--border-color)] mx-2" />

                    {/* Stats Section - Compact Row */}
                    <div className="flex items-center gap-3 px-4">
                         {[
                            { id: 'ALL', label: 'TOTAL', value: stats.total, icon: <Dumbbell size={14} />, color: 'text-[var(--accent-primary)]' },
                            { id: 'ACTIVE', label: 'ACTIVE', value: stats.active, icon: <CheckCircle size={14} />, color: 'text-[var(--status-active)]' },
                            { id: 'MAINTENANCE', label: 'FIXING', value: stats.maintenance, icon: <Wrench size={14} />, color: 'text-[var(--status-maintenance)]' },
                            { id: 'OUT_OF_ORDER', label: 'BROKEN', value: stats.outOfOrder, icon: <AlertTriangle size={14} />, color: 'text-[var(--status-outoforder)]' },
                        ].map((stat) => {
                             const isActive = activeStatusFilter === stat.id || (activeStatusFilter === null && stat.id === 'ALL');
                             return (
                                <button
                                    key={stat.id}
                                    onClick={() => setActiveStatusFilter(isActive ? 'ALL' : stat.id as any)}
                                    className={`flex items-center gap-2 group transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`${isActive ? stat.color : 'text-[var(--text-secondary)]'} transition-colors`}>
                                        {stat.icon}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider leading-none mb-0.5">{stat.label}</span>
                                        <span className={`text-sm font-bold leading-none ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{stat.value}</span>
                                    </div>
                                </button>
                             );
                        })}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* View Toggles */}
                    <div className="flex items-center gap-1 px-3 border-l border-[var(--border-color)] pl-4">
                        <button 
                            onClick={() => setGridDensity('compact')}
                            className={`p-1.5 rounded-lg transition-all duration-300 ${gridDensity === 'compact' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'}`}
                            title="Compact View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button 
                            onClick={() => setGridDensity('comfortable')}
                            className={`p-1.5 rounded-lg transition-all duration-300 ${gridDensity === 'comfortable' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'}`}
                            title="Comfortable View"
                        >
                            <Layout size={16} />
                        </button>
                        <button 
                            onClick={() => setGridDensity('spacious')}
                            className={`p-1.5 rounded-lg transition-all duration-300 ${gridDensity === 'spacious' ? 'bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'}`}
                            title="Spacious View"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>

            {/* Category Tabs */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] mb-6 overflow-x-auto scrollbar-hide px-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                            relative px-8 py-3 text-xs font-bold tracking-wider transition-all duration-300 flex-1 text-center
                            ${selectedCategory === cat 
                                ? 'text-[var(--accent-primary)]' 
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }
                        `}
                    >
                        {cat}
                        {selectedCategory === cat && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--accent-primary)] shadow-[0_-1px_6px_var(--glow-color)] rounded-t-full" />
                        )}
                    </button>
                ))}
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
