import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Settings,
  LogOut,
  Dumbbell,
  Search,
  Bell,
  X,
  ChevronRight,
  User,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

interface NavbarProps {
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface SearchResult {
  id: string;
  type: 'member' | 'staff' | 'session';
  title: string;
  subtitle: string;
  link: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [unreadCount] = useState(3);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New Member Joined',
      message: 'John Smith just signed up for the Gold Plan',
      time: '2 min ago',
      isRead: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Membership Expiring',
      message: '5 members have memberships expiring this week',
      time: '1 hour ago',
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      title: 'PT Session Completed',
      message: 'Sarah completed session with Mike Johnson',
      time: '3 hours ago',
      isRead: false
    },
    {
      id: '4',
      type: 'success',
      title: 'Payment Received',
      message: '$150 payment from Emily Davis',
      time: '5 hours ago',
      isRead: true
    }
  ]);

  // Real search functionality
  useEffect(() => {
    const searchData = async () => {
      if (searchQuery.length > 1) {
        try {
          // Fetch real data from API
          const [members, trainers, staffUsers] = await Promise.all([
            import('../../services/api').then(m => m.default.getUsers('CUSTOMER')),
            import('../../services/api').then(m => m.default.getUsers('TRAINER')),
            import('../../services/api').then(m => m.default.getUsers('STAFF')),
          ]);

          const results: SearchResult[] = [];

          // Filter members
          members.forEach((user: any) => {
            const name = user.fullName || user.username || '';
            if (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))) {
              results.push({
                id: `member-${user.userId}`,
                type: 'member' as const,
                title: name,
                subtitle: `${user.email} • Member`,
                link: '/members'
              });
            }
          });

          // Filter trainers
          trainers.forEach((user: any) => {
            const name = user.fullName || user.username || '';
            if (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))) {
              results.push({
                id: `trainer-${user.userId}`,
                type: 'staff' as const,
                title: name,
                subtitle: `${user.email} • Trainer`,
                link: '/staff'
              });
            }
          });

          // Filter staff
          staffUsers.forEach((user: any) => {
            const name = user.fullName || user.username || '';
            if (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))) {
              results.push({
                id: `staff-${user.userId}`,
                type: 'staff' as const,
                title: name,
                subtitle: `${user.email} • Staff`,
                link: '/staff'
              });
            }
          });

          // Limit to 8 results
          setSearchResults(results.slice(0, 8));
        } catch (error) {
          console.error('Search error:', error);
          // Fallback to mock data on error
          const mockResults = ([
            { id: '1', type: 'member' as const, title: 'John Smith', subtitle: 'Gold Plan • Active', link: '/members' },
            { id: '2', type: 'member' as const, title: 'Sarah Williams', subtitle: 'Silver Plan • Active', link: '/members' },
            { id: '3', type: 'staff' as const, title: 'Mike Johnson', subtitle: 'Personal Trainer', link: '/staff' },
            { id: '4', type: 'session' as const, title: 'PT Session #124', subtitle: 'Tomorrow at 10:00 AM', link: '/pt-sessions' },
          ] as SearchResult[]).filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(mockResults);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchData, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconClasses = {
      success: 'notification-icon--success',
      warning: 'notification-icon--warning',
      info: 'notification-icon--info',
      error: 'notification-icon--error'
    };
    return iconClasses[type as keyof typeof iconClasses] || iconClasses.info;
  };

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff', icon: UserCheck, label: 'Staff' },
    { to: '/members', icon: Users, label: 'Members' },
    { to: '/pt-sessions', icon: Calendar, label: 'PT Sessions' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <motion.nav
        className="navbar-premium"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Logo */}
        <motion.div
          className="navbar-premium__logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="navbar-premium__logo-icon">
            <Dumbbell size={24} />
          </div>
          <span className="navbar-premium__logo-text">AthlonX</span>
        </motion.div>

        {/* Navigation Links */}
        <div className="navbar-premium__nav">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar-premium__link ${isActive ? 'navbar-premium__link--active' : ''}`
              }
            >
              <motion.div
                className="navbar-premium__link-content"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <link.icon size={18} className="navbar-premium__link-icon" />
                <span>{link.label}</span>
              </motion.div>
            </NavLink>
          ))}
        </div>

        {/* Right Section */}
        <div className="navbar-premium__right">
          {/* Global Search Button */}
          <motion.button
            className="navbar-premium__search-btn"
            onClick={() => setSearchOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={18} />
            <span className="navbar-premium__search-hint">
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
            </span>
          </motion.button>

          {/* Notifications */}
          <div className="navbar-premium__dropdown-wrapper" ref={notificationsRef}>
            <motion.button
              className={`navbar-premium__icon-btn ${notificationsOpen ? 'active' : ''}`}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  className="navbar-premium__badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notification Dropdown - rendered via portal */}
            {notificationsOpen && createPortal(
              <AnimatePresence>
                <motion.div
                  className="notifications-dropdown-portal"
                  ref={notificationsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'fixed',
                    top: '70px',
                    right: '120px',
                    width: '360px',
                    background: 'var(--card-glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="notifications-dropdown__header">
                    <h3>Notifications</h3>
                    <button className="notifications-dropdown__mark-read">Mark all read</button>
                  </div>
                  <div className="notifications-dropdown__list">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                      >
                        <div className={`notification-item__icon ${getNotificationIcon(notification.type)}`}>
                          <Bell size={14} />
                        </div>
                        <div className="notification-item__content">
                          <p className="notification-item__title">{notification.title}</p>
                          <p className="notification-item__message">{notification.message}</p>
                          <span className="notification-item__time">{notification.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="notifications-dropdown__footer">
                    <button onClick={() => setNotificationsOpen(false)}>View All Notifications</button>
                  </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>

          {/* Theme Toggle */}
          <motion.button
            className="navbar-premium__icon-btn"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          {/* Profile Dropdown */}
          <div className="navbar-premium__dropdown-wrapper" ref={profileRef}>
            <motion.button
              className={`navbar-premium__profile-btn ${profileOpen ? 'active' : ''}`}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="navbar-premium__avatar">
                <span>A</span>
              </div>
              <div className="navbar-premium__profile-info">
                <span className="navbar-premium__profile-name">Admin User</span>
                <span className="navbar-premium__profile-role">Owner</span>
              </div>
            </motion.button>

            {/* Profile Dropdown - rendered via portal */}
            {profileOpen && createPortal(
              <AnimatePresence>
                <motion.div
                  className="profile-dropdown-portal"
                  ref={profileRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'fixed',
                    top: '70px',
                    right: '24px',
                    width: '240px',
                    background: 'var(--card-glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    padding: '8px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="profile-dropdown__item" onClick={() => { navigate('/settings'); setProfileOpen(false); }}>
                    <User size={16} />
                    <span>My Profile</span>
                    <ChevronRight size={14} />
                  </div>
                  <div className="profile-dropdown__item" onClick={() => { navigate('/settings'); setProfileOpen(false); }}>
                    <CreditCard size={16} />
                    <span>Billing</span>
                    <ChevronRight size={14} />
                  </div>
                  <div className="profile-dropdown__item" onClick={() => setProfileOpen(false)}>
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                    <ChevronRight size={14} />
                  </div>
                  <div className="profile-dropdown__divider" />
                  <div className="profile-dropdown__item profile-dropdown__item--danger" onClick={() => { onLogout(); setProfileOpen(false); }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="navbar-premium__mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Global Search Modal - Rendered via Portal */}
      {
        createPortal(
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                className="search-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearchOpen(false)}
              >
                <motion.div
                  ref={searchRef}
                  className="search-modal"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="search-modal__input-wrapper">
                    <Search size={20} className="search-modal__icon" />
                    <input
                      type="text"
                      placeholder="Search members, staff, sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button className="search-modal__close" onClick={() => setSearchOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="search-modal__results">
                      {searchResults.map(result => (
                        <motion.div
                          key={result.id}
                          className="search-result-item"
                          whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                          onClick={() => {
                            navigate(result.link);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className={`search-result-item__icon search-result-item__icon--${result.type}`}>
                            {result.type === 'member' && <Users size={16} />}
                            {result.type === 'staff' && <UserCheck size={16} />}
                            {result.type === 'session' && <Calendar size={16} />}
                          </div>
                          <div className="search-result-item__content">
                            <p className="search-result-item__title">{result.title}</p>
                            <p className="search-result-item__subtitle">{result.subtitle}</p>
                          </div>
                          <ChevronRight size={16} className="search-result-item__arrow" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="search-modal__empty">
                      <Search size={40} />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  )}

                  <div className="search-modal__hints">
                    <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span><kbd>Enter</kbd> Select</span>
                    <span><kbd>Esc</kbd> Close</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      }

      {/* Mobile Menu - Rendered via Portal */}
      {
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.div
                  className="mobile-menu"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mobile-menu__header">
                    <div className="navbar-premium__logo">
                      <div className="navbar-premium__logo-icon">
                        <Dumbbell size={24} />
                      </div>
                      <span className="navbar-premium__logo-text">AthlonX</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  <div className="mobile-menu__links">
                    {navLinks.map(link => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon size={20} />
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                  <div className="mobile-menu__footer">
                    <button className="mobile-menu__logout" onClick={onLogout}>
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      }
    </>
  );
};

export default Navbar;

