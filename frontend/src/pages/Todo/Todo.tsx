import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Plus, Search, RefreshCw, Trash2,
  Edit3, X, Check, AlertCircle, Clock, ArrowUp, Minus,
  LayoutGrid, List, Tag, Calendar, User,
  Zap, Circle, CheckCircle2, Loader2, Flag, TrendingUp, Database
} from 'lucide-react';
import { taskApi } from '../../services/attendanceTaskApi';
import type { GymTask, TaskStats } from '../../services/attendanceTaskApi';
import './Todo.css';

// ─── Animation variants ───────────────────────────────────────────────────────
const CARD = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.36, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.18 } }
};

const FADE = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITIES: GymTask['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: GymTask['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];
const CATEGORIES = ['General', 'Maintenance', 'Finance', 'Staff', 'Members', 'Equipment', 'Marketing'];

const PRIORITY_META: Record<GymTask['priority'], { label: string; color: string; icon: React.ReactNode }> = {
  LOW:    { label: 'Low',    color: '#6B7280', icon: <Minus size={11} /> },
  MEDIUM: { label: 'Medium', color: '#F59E0B', icon: <ArrowUp size={11} style={{ transform: 'rotate(45deg)' }} /> },
  HIGH:   { label: 'High',   color: '#F43F5E', icon: <ArrowUp size={11} /> },
  URGENT: { label: 'Urgent', color: '#DC2626', icon: <Zap size={11} /> },
};

const STATUS_META: Record<GymTask['status'], { label: string; color: string; icon: React.ReactNode }> = {
  TODO:        { label: 'To Do',       color: '#6B7280', icon: <Circle size={13} /> },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', icon: <Loader2 size={13} /> },
  DONE:        { label: 'Done',        color: '#10B981', icon: <CheckCircle2 size={13} /> },
};

const COLUMN_ORDER: GymTask['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];
const COL_CSS: Record<GymTask['status'], string> = {
  TODO: 'todo-kanban__col--todo',
  IN_PROGRESS: 'todo-kanban__col--in_progress',
  DONE: 'todo-kanban__col--done',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function isOverdue(task: GymTask) {
  return task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
}

// ─── Task Card ────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: GymTask;
  index: number;
  onEdit: (task: GymTask) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: GymTask['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete, onStatusChange }) => {
  const pm = PRIORITY_META[task.priority];
  const sm = STATUS_META[task.status];
  const overdue = isOverdue(task);
  const nextStatus: GymTask['status'] | null =
    task.status === 'TODO' ? 'IN_PROGRESS' :
    task.status === 'IN_PROGRESS' ? 'DONE' : null;

  return (
    <motion.div
      layout
      variants={CARD}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`todo-card todo-card--${task.priority.toLowerCase()} ${task.status === 'DONE' ? 'todo-card--done' : ''}`}
    >
      {/* Priority stripe */}
      <div className="todo-card__stripe" />

      <div className="todo-card__body">
        {/* Top row */}
        <div className="todo-card__top">
          <button
            className="todo-card__status-btn"
            onClick={() => nextStatus && onStatusChange(task.taskId, nextStatus)}
            title={nextStatus ? `Move to ${STATUS_META[nextStatus].label}` : 'Completed'}
            disabled={!nextStatus}
            style={{ color: sm.color }}
          >
            {sm.icon}
          </button>
          <h4 className={`todo-card__title ${task.status === 'DONE' ? 'todo-card__title--done' : ''}`}>
            {task.title}
          </h4>
          <div className="todo-card__actions">
            <button className="todo-card__action-btn" onClick={() => onEdit(task)} title="Edit">
              <Edit3 size={12} />
            </button>
            <button className="todo-card__action-btn todo-card__action-btn--danger" onClick={() => onDelete(task.taskId)} title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="todo-card__desc">{task.description}</p>
        )}

        {/* Footer badges */}
        <div className="todo-card__footer">
          <span className="todo-card__priority-badge" style={{ color: pm.color, background: `${pm.color}18` }}>
            {pm.icon} {pm.label}
          </span>
          {task.category && (
            <span className="todo-card__category-badge">
              <Tag size={9} /> {task.category}
            </span>
          )}
          {task.dueDate && (
            <span className={`todo-card__due ${overdue ? 'todo-card__due--overdue' : ''}`}>
              {overdue ? <AlertCircle size={9} /> : <Calendar size={9} />}
              {fmtDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <span className="todo-card__assignee">
              <User size={9} /> {task.assignedTo}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Task Modal ───────────────────────────────────────────────────────────────
interface TaskModalProps {
  task: Partial<GymTask> | null;
  onClose: () => void;
  onSave: (task: Partial<GymTask>) => Promise<void>;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<GymTask>>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    category: 'General',
    dueDate: '',
    assignedTo: '',
    ...task,
  });
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const set = (k: keyof GymTask, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      className="todo-modal-overlay"
      variants={FADE}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="todo-modal"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="todo-modal__header">
          <h2 className="todo-modal__title">{task?.taskId ? 'Edit Task' : 'New Task'}</h2>
          <button className="todo-modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="todo-modal__form">
          {/* Title */}
          <div className="todo-modal__field">
            <label className="todo-modal__label">Title *</label>
            <input
              ref={titleRef}
              className="todo-modal__input"
              placeholder="Task title…"
              value={form.title || ''}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="todo-modal__field">
            <label className="todo-modal__label">Description</label>
            <textarea
              className="todo-modal__textarea"
              placeholder="Optional description…"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Row: priority + status */}
          <div className="todo-modal__row">
            <div className="todo-modal__field">
              <label className="todo-modal__label">Priority</label>
              <select className="todo-modal__select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{PRIORITY_META[p].label}</option>
                ))}
              </select>
            </div>
            <div className="todo-modal__field">
              <label className="todo-modal__label">Status</label>
              <select className="todo-modal__select" value={form.status} onChange={e => set('status', e.target.value as GymTask['status'])}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: category + dueDate */}
          <div className="todo-modal__row">
            <div className="todo-modal__field">
              <label className="todo-modal__label">Category</label>
              <select className="todo-modal__select" value={form.category || 'General'} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="todo-modal__field">
              <label className="todo-modal__label">Due Date</label>
              <input
                type="date"
                className="todo-modal__input"
                value={form.dueDate ? form.dueDate.split('T')[0] : ''}
                onChange={e => set('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Assigned to */}
          <div className="todo-modal__field">
            <label className="todo-modal__label">Assigned To</label>
            <input
              className="todo-modal__input"
              placeholder="Name or role…"
              value={form.assignedTo || ''}
              onChange={e => set('assignedTo', e.target.value)}
            />
          </div>

          <div className="todo-modal__footer">
            <button type="button" className="todo-modal__btn todo-modal__btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="todo-modal__btn todo-modal__btn--save" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {task?.taskId ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  color: string;
  glowColor: string;
  mod: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, glowColor, mod, index }) => (
  <motion.div
    className={`todo-stat-card todo-stat-card--${mod}`}
    variants={CARD}
    custom={index}
    initial="hidden"
    animate="visible"
  >
    <div className="todo-stat-card__glow" style={{ background: glowColor }} />
    <span className="todo-stat-card__value" style={{ color }}>{value}</span>
    <span className="todo-stat-card__label">{label}</span>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TodoPage: React.FC = () => {
  const [tasks, setTasks] = useState<GymTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<GymTask['priority'] | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [modalTask, setModalTask] = useState<Partial<GymTask> | null | false>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const [tasksRes, statsRes] = await Promise.allSettled([
      taskApi.getAll(),
      taskApi.getStats(),
    ]);
    if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTo || '').toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchCat = filterCategory === 'ALL' || t.category === filterCategory;
    return matchSearch && matchPriority && matchCat;
  });

  const byStatus = (status: GymTask['status']) => filtered.filter(t => t.status === status);

  const completionPct = stats && stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSave = async (form: Partial<GymTask>) => {
    if (form.taskId) {
      const updated = await taskApi.update(form.taskId, form);
      setTasks(ts => ts.map(t => t.taskId === updated.taskId ? updated : t));
    } else {
      const created = await taskApi.create(form);
      setTasks(ts => [created, ...ts]);
    }
    setModalTask(false);
    const s = await taskApi.getStats();
    setStats(s);
  };

  const handleStatusChange = async (id: number, status: GymTask['status']) => {
    const updated = await taskApi.updateStatus(id, status);
    setTasks(ts => ts.map(t => t.taskId === updated.taskId ? updated : t));
    const s = await taskApi.getStats();
    setStats(s);
  };

  const handleDelete = async (id: number) => {
    await taskApi.delete(id);
    setTasks(ts => ts.filter(t => t.taskId !== id));
    setDeleteConfirm(null);
    const s = await taskApi.getStats();
    setStats(s);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await taskApi.seed();
      setSeedMsg(res.message);
      await loadData(true);
    } catch (e) {
      setSeedMsg('Seed failed — check backend logs.');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(null), 4000);
    }
  };

  const uniqueCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="todo-loading">
        <div className="todo-loading__spinner" />
        <p style={{ fontSize: '0.82rem' }}>Loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="todo-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="todo-header">
        <div className="todo-header__left">
          <div className="todo-header__icon">
            <CheckSquare size={20} />
          </div>
          <div>
            <h1 className="todo-header__title">Task Board</h1>
            <p className="todo-header__sub">Gym operations · task management</p>
          </div>
          {/* Completion pill */}
          {stats && stats.total > 0 && (
            <div className="todo-live-pill">
              <TrendingUp size={9} />
              {completionPct}% done
            </div>
          )}
        </div>
          <div className="todo-header__right">
            <div className="todo-view-toggle">
              <button
                className={`todo-view-btn ${view === 'kanban' ? 'todo-view-btn--active' : ''}`}
                onClick={() => setView('kanban')}
              >
                <LayoutGrid size={13} /> Kanban
              </button>
              <button
                className={`todo-view-btn ${view === 'list' ? 'todo-view-btn--active' : ''}`}
                onClick={() => setView('list')}
              >
                <List size={13} /> List
              </button>
            </div>
            <button
              className={`todo-refresh-btn ${refreshing ? 'todo-refresh-btn--spinning' : ''}`}
              onClick={() => loadData(true)}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              className={`todo-seed-btn ${seeding ? 'todo-seed-btn--loading' : ''}`}
              onClick={handleSeed}
              disabled={seeding}
              title="Insert 20 dummy tasks into database"
            >
              {seeding ? <Loader2 size={13} className="spin" /> : <Database size={13} />}
              {seeding ? 'Seeding…' : 'Seed Data'}
            </button>
            <button className="todo-add-btn" onClick={() => setModalTask({})}>
              <Plus size={15} /> New Task
            </button>
          </div>
      </div>

      {/* ── Seed feedback toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {seedMsg && (
          <motion.div
            className="todo-seed-toast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <Database size={13} />
            {seedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      {stats && (
        <div className="todo-stats-strip">
          <StatCard label="Total"       value={stats.total}      color="#a8a8c8" glowColor="#6b7280" mod="total"   index={0} />
          <StatCard label="To Do"       value={stats.todo}       color="#a8a8c8" glowColor="#6b7280" mod="todo"    index={1} />
          <StatCard label="In Progress" value={stats.inProgress} color="#3b82f6" glowColor="#3b82f6" mod="inprog"  index={2} />
          <StatCard label="Done"        value={stats.done}       color="#10b981" glowColor="#10b981" mod="done"    index={3} />
          <StatCard label="Urgent"      value={stats.urgent}     color="#f43f5e" glowColor="#f43f5e" mod="urgent"  index={4} />
          <StatCard label="Overdue"     value={stats.overdue}    color="#f59e0b" glowColor="#f59e0b" mod="overdue" index={5} />
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="todo-filters">
        <div className="todo-search-box">
          <Search size={13} className="todo-search-box__icon" />
          <input
            className="todo-search-box__input"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="todo-search-box__clear" onClick={() => setSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="todo-filter-group">
          <Flag size={12} className="todo-filter-group__icon" />
          <select
            className="todo-filter-select"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as any)}
          >
            <option value="ALL">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
          </select>
        </div>

        <div className="todo-filter-group">
          <Tag size={12} className="todo-filter-group__icon" />
          <select
            className="todo-filter-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c!}>{c}</option>)}
          </select>
        </div>

        {(search || filterPriority !== 'ALL' || filterCategory !== 'ALL') && (
          <button
            className="todo-clear-filters"
            onClick={() => { setSearch(''); setFilterPriority('ALL'); setFilterCategory('ALL'); }}
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="todo-filter-count">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Kanban Board ────────────────────────────────────────────────── */}
      {view === 'kanban' && (
        <div className="todo-kanban">
          {/* Empty state across all columns */}
          {tasks.length === 0 && !search && (
            <motion.div
              className="todo-empty-state"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Database size={38} className="todo-empty-state__icon" />
              <h3>No tasks yet</h3>
              <p>Click <strong>Seed Data</strong> to insert 20 realistic dummy tasks covering all priorities, statuses and categories into the database.</p>
              <button
                className={`todo-seed-btn todo-seed-btn--lg ${seeding ? 'todo-seed-btn--loading' : ''}`}
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? <Loader2 size={15} className="spin" /> : <Database size={15} />}
                {seeding ? 'Seeding…' : 'Seed 20 Dummy Tasks'}
              </button>
            </motion.div>
          )}

          {tasks.length > 0 && COLUMN_ORDER.map(status => {
            const sm = STATUS_META[status];
            const col = byStatus(status);
            return (
              <div key={status} className={`todo-kanban__col ${COL_CSS[status]}`}>
                <div className="todo-kanban__col-header">
                  <div className="todo-kanban__col-title">
                    <span style={{ color: sm.color }}>{sm.icon}</span>
                    <span>{sm.label}</span>
                    <span className="todo-kanban__col-count">{col.length}</span>
                  </div>
                  <button
                    className="todo-kanban__col-add"
                    onClick={() => setModalTask({ status })}
                    title={`Add to ${sm.label}`}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="todo-kanban__cards">
                  <AnimatePresence mode="popLayout">
                    {col.length === 0 ? (
                      <motion.div
                        key="empty"
                        className="todo-kanban__empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CheckSquare size={20} />
                        <span>No tasks here</span>
                      </motion.div>
                    ) : (
                      col.map((t, ti) => (
                        <TaskCard
                          key={t.taskId}
                          task={t}
                          index={ti}
                          onEdit={t => setModalTask(t)}
                          onDelete={id => setDeleteConfirm(id)}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ───────────────────────────────────────────────────── */}
      {view === 'list' && (
        <motion.div
          className="todo-list-card"
          variants={CARD} initial="hidden" animate="visible" custom={0}
        >
          {filtered.length === 0 ? (
            <div className="todo-list__empty">
              <CheckSquare size={32} />
              <p>{search ? 'No tasks match your search' : 'No tasks yet — create your first one!'}</p>
              <button className="todo-add-btn" onClick={() => setModalTask({})}>
                <Plus size={13} /> New Task
              </button>
            </div>
          ) : (
            <table className="todo-list-table">
              <thead>
                <tr>
                  <th style={{ width: 34 }} />
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Due</th>
                  <th>Assigned</th>
                  <th style={{ width: 76 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map(t => {
                    const pm = PRIORITY_META[t.priority];
                    const sm = STATUS_META[t.status];
                    const overdue = isOverdue(t);
                    const nextStatus: GymTask['status'] | null =
                      t.status === 'TODO' ? 'IN_PROGRESS' :
                      t.status === 'IN_PROGRESS' ? 'DONE' : null;
                    return (
                      <motion.tr
                        key={t.taskId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`todo-list-row ${t.status === 'DONE' ? 'todo-list-row--done' : ''} ${overdue ? 'todo-list-row--overdue' : ''}`}
                      >
                        <td>
                          <button
                            className="todo-card__status-btn"
                            style={{ color: sm.color }}
                            onClick={() => nextStatus && handleStatusChange(t.taskId, nextStatus)}
                            disabled={!nextStatus}
                            title={nextStatus ? `Move to ${STATUS_META[nextStatus].label}` : 'Done'}
                          >
                            {sm.icon}
                          </button>
                        </td>
                        <td>
                          <div className={`todo-list-row__title ${t.status === 'DONE' ? 'todo-list-row__title--done' : ''}`}>
                            {t.title}
                          </div>
                          {t.description && <div className="todo-list-row__desc">{t.description}</div>}
                        </td>
                        <td>
                          <span className="todo-card__priority-badge" style={{ color: pm.color, background: `${pm.color}18` }}>
                            {pm.icon} {pm.label}
                          </span>
                        </td>
                        <td>
                          <span className="todo-status-badge" style={{ color: sm.color, background: `${sm.color}18` }}>
                            {sm.icon} {sm.label}
                          </span>
                        </td>
                        <td>
                          {t.category && (
                            <span className="todo-card__category-badge"><Tag size={9} /> {t.category}</span>
                          )}
                        </td>
                        <td>
                          {t.dueDate && (
                            <span className={`todo-card__due ${overdue ? 'todo-card__due--overdue' : ''}`}>
                              {overdue ? <AlertCircle size={9} /> : <Calendar size={9} />}
                              {fmtDate(t.dueDate)}
                            </span>
                          )}
                        </td>
                        <td>
                          {t.assignedTo && (
                            <span className="todo-card__assignee"><User size={9} /> {t.assignedTo}</span>
                          )}
                        </td>
                        <td>
                          <div className="todo-list-row__actions">
                            <button className="todo-card__action-btn" onClick={() => setModalTask(t)} title="Edit">
                              <Edit3 size={12} />
                            </button>
                            <button className="todo-card__action-btn todo-card__action-btn--danger" onClick={() => setDeleteConfirm(t.taskId)} title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>
      )}

      {/* ── Task Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalTask !== false && (
          <TaskModal
            task={modalTask}
            onClose={() => setModalTask(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            className="todo-modal-overlay"
            variants={FADE}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="todo-delete-confirm"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <AlertCircle size={30} className="todo-delete-confirm__icon" />
              <h3>Delete Task?</h3>
              <p>This action cannot be undone.</p>
              <div className="todo-delete-confirm__actions">
                <button className="todo-modal__btn todo-modal__btn--cancel" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="todo-modal__btn todo-modal__btn--danger" onClick={() => handleDelete(deleteConfirm)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoPage;
