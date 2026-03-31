/**
 * AthlonXIcons.tsx
 * ─────────────────────────────────────────────────────────────
 * Self-contained animated SVG icon library for AthlonX V2.
 * Drop this file anywhere in your project and import what you need.
 *
 * USAGE:
 *   import { BellIcon, GearIcon, DumbbellIcon } from './AthlonXIcons'
 *   <BellIcon size={22} className="text-amber-400" />
 *
 * All icons:
 *  Admin  → AdminDashIcon, MembersIcon, TrainersIcon, StaffIcon,
 *            ClassesIcon, EquipmentIcon, CheckInIcon, AttendanceIcon,
 *            FinancialsIcon, TasksIcon, BellIcon, GearIcon
 *
 *  Trainer→ TrainerDashIcon, MyMembersIcon, MyScheduleIcon,
 *            MyClassesIcon, TrainerProgressIcon, ProgressNotesIcon,
 *            ReportsIcon, TrainerProfileIcon
 *
 *  Member → MemberDashIcon, MyMembershipIcon, MemberProgressIcon,
 *            MyTrainerIcon, AvailableClassesIcon, MyBookingsIcon,
 *            MemberProfileIcon
 *
 *  Shared → BellIcon, GearIcon  (used by all 3 roles)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────

export interface IconProps {
  /** px size for width & height. Default: 24 */
  size?: number;
  /** Tailwind or custom className — controls stroke color via currentColor */
  className?: string;
  /** Extra inline styles */
  style?: React.CSSProperties;
  /** aria-label for accessibility */
  label?: string;
}

// ─── CSS Injection (runs once per app) ───────────────────────

const STYLE_ID = 'athlonx-icons-css';

const CSS = `
/* ── PREMIUM EASING & ANIMATION FUNCTIONS ── */
:root {
  --ease-in: cubic-bezier(0.42, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.58, 1);
  --ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── PREMIUM STROKE WEIGHTS ── */
.axi-stroke-light { stroke-width: 1.25px; }
.axi-stroke-regular { stroke-width: 1.5px; }
.axi-stroke-medium { stroke-width: 2px; }
.axi-stroke-bold { stroke-width: 2.5px; }

/* ── SHADOW & DEPTH EFFECTS ── */
filter[id^="axi-shadow"] { }

/* ── AthlonXIcons Premium Animations ── */
@keyframes axi-bellSwing {
  0%,100% { transform: rotate(0); opacity: 1; }
  20%     { transform: rotate(-22deg); }
  40%     { transform: rotate(18deg); }
  60%     { transform: rotate(-12deg); }
  80%     { transform: rotate(7deg); }
}
@keyframes axi-gearSpin {
  to { transform: rotate(360deg); }
}
@keyframes axi-bounce {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}
@keyframes axi-barUp {
  0%,100% { transform: scaleY(1); }
  50%     { transform: scaleY(1.5); }
}
@keyframes axi-barPulse {
  0%   { opacity: 0.8; }
  50%  { opacity: 1; }
  100% { opacity: 0.8; }
}
@keyframes axi-checkDraw {
  from { stroke-dashoffset: 22; stroke-opacity: 0.4; }
  to   { stroke-dashoffset: 0; stroke-opacity: 1; }
}
@keyframes axi-trendIn {
  0%   { stroke-dashoffset: 40; opacity: 0; }
  100% { stroke-dashoffset: 0;  opacity: 1; }
}
@keyframes axi-pulsate {
  0%   { r: 5px; opacity: 0.8; }
  100% { r: 12px; opacity: 0; }
}
@keyframes axi-shimmer {
  0%   { transform: translateX(-20px) skewX(-12deg); opacity: 0; }
  50%  { opacity: 0.8; }
  100% { transform: translateX(24px)  skewX(-12deg); opacity: 0; }
}
@keyframes axi-cardflip {
  0%,100% { transform: perspective(100px) rotateY(0); }
  50%     { transform: perspective(100px) rotateY(-32deg); }
}
@keyframes axi-heartbeat {
  0%,100% { transform: scale(1); }
  14%     { transform: scale(1.35); }
  28%     { transform: scale(1); }
  42%     { transform: scale(1.2); }
}
@keyframes axi-clockTick {
  to { transform: rotate(360deg); }
}
@keyframes axi-arrowUp {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}
@keyframes axi-ringDraw1 {
  from { stroke-dashoffset: 62; opacity: 0.5; }
  to   { stroke-dashoffset: 12; opacity: 1; }
}
@keyframes axi-ringDraw2 {
  from { stroke-dashoffset: 48; opacity: 0.5; }
  to   { stroke-dashoffset: 10; opacity: 1; }
}
@keyframes axi-ringDraw3 {
  from { stroke-dashoffset: 36; opacity: 0.5; }
  to   { stroke-dashoffset: 6; opacity: 1; }
}
@keyframes axi-barXFill {
  from { transform: scaleX(0); opacity: 0.6; }
  to   { transform: scaleX(1); opacity: 1; }
}
@keyframes axi-starPop {
  0%,100% { transform: rotate(0)    scale(1); opacity: 1; }
  50%     { transform: rotate(40deg) scale(1.3); opacity: 0.9; }
}
@keyframes axi-ticketStamp {
  0%,100% { transform: scale(1); }
  35%     { transform: scale(0.91); }
  65%     { transform: scale(1.08); }
}
@keyframes axi-playPulse {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.3); opacity: 0.85; }
}
@keyframes axi-trophyShine {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.12); }
}
@keyframes axi-penWrite {
  from { stroke-dashoffset: 16; opacity: 0.6; }
  to   { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes axi-pieRotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(70deg); }
}
@keyframes axi-personPop {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.1); opacity: 0.9; }
}
@keyframes axi-doorSlide {
  0%   { transform: perspective(80px) rotateY(0deg); }
  100% { transform: perspective(80px) rotateY(-40deg); }
}
@keyframes axi-coinFlip {
  0%,100% { transform: scaleX(1); }
  50%     { transform: scaleX(0.08); }
}
@keyframes axi-chkSeq1 {
  0%,5%   { stroke-dashoffset: 18; opacity: 0.5; }
  100%    { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes axi-chkSeq2 {
  0%,30%  { stroke-dashoffset: 18; opacity: 0.5; }
  100%    { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes axi-chkSeq3 {
  0%,55%  { stroke-dashoffset: 18; opacity: 0.5; }
  100%    { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes axi-scanY {
  0%   { transform: translateY(-6px); opacity: 0.3; }
  50%  { opacity: 1; }
  100% { transform: translateY(6px);  opacity: 0.3; }
}
@keyframes axi-glow {
  0%,100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0)); }
  50%     { filter: drop-shadow(0 0 6px rgba(255,184,82,0.6)); }
}

/* ── HOVER ICON CONTAINER ── */
.axi-icon { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  transition: filter 0.3s cubic-bezier(0.42, 0, 0.58, 1);
}
.axi-icon:hover { filter: brightness(1.05); }

/* ── SMOOTH HOVER ANIMATIONS WITH PREMIUM EASING ── */
.axi-icon:hover .axi-bell       { animation: axi-bellSwing 0.75s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 12px 3px; }
.axi-icon:hover .axi-gear       { animation: axi-gearSpin 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; transform-origin: center; }
.axi-icon:hover .axi-bounce     { animation: axi-bounce 0.6s cubic-bezier(0.42, 0, 0.58, 1) infinite; }
.axi-icon:hover .axi-bar1       { animation: axi-barUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.00s infinite; transform-origin: 50% 100%; transform-box: fill-box; }
.axi-icon:hover .axi-bar2       { animation: axi-barUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s infinite; transform-origin: 50% 100%; transform-box: fill-box; }
.axi-icon:hover .axi-bar3       { animation: axi-barUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s infinite; transform-origin: 50% 100%; transform-box: fill-box; }
.axi-icon:hover .axi-check      { animation: axi-checkDraw 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 22; stroke-dashoffset: 22; }
.axi-icon:hover .axi-trend      { animation: axi-trendIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 40; stroke-dashoffset: 40; }
.axi-icon:hover .axi-pulse      { animation: axi-pulsate 1.2s cubic-bezier(0, 0, 0.58, 1) infinite; }
.axi-icon:hover .axi-shimmer    { animation: axi-shimmer 0.8s cubic-bezier(0.42, 0, 0.58, 1); overflow: hidden; }
.axi-icon:hover .axi-cardflip   { animation: axi-cardflip 0.9s cubic-bezier(0.42, 0, 0.58, 1); transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-heart      { animation: axi-heartbeat 0.8s cubic-bezier(0.42, 0, 0.58, 1) infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-clockhand  { animation: axi-clockTick 2.2s linear infinite; transform-box: fill-box; transform-origin: 19px 17px; }
.axi-icon:hover .axi-arrowup    { animation: axi-arrowUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
.axi-icon:hover .axi-ring1      { animation: axi-ringDraw1 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 62; stroke-dashoffset: 62; }
.axi-icon:hover .axi-ring2      { animation: axi-ringDraw2 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s forwards; stroke-dasharray: 48; stroke-dashoffset: 48; }
.axi-icon:hover .axi-ring3      { animation: axi-ringDraw3 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.36s forwards; stroke-dasharray: 36; stroke-dashoffset: 36; }
.axi-icon:hover .axi-bxh1       { animation: axi-barXFill 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.00s forwards; transform-origin: 0% 50%; transform-box: fill-box; }
.axi-icon:hover .axi-bxh2       { animation: axi-barXFill 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards; transform-origin: 0% 50%; transform-box: fill-box; }
.axi-icon:hover .axi-bxh3       { animation: axi-barXFill 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s forwards; transform-origin: 0% 50%; transform-box: fill-box; }
.axi-icon:hover .axi-star       { animation: axi-starPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-ticket     { animation: axi-ticketStamp 0.6s cubic-bezier(0.42, 0, 0.58, 1); }
.axi-icon:hover .axi-play       { animation: axi-playPulse 0.8s cubic-bezier(0.42, 0, 0.58, 1) infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-trophy     { animation: axi-trophyShine 0.9s cubic-bezier(0.42, 0, 0.58, 1) infinite; }
.axi-icon:hover .axi-pen        { animation: axi-penWrite 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 16; stroke-dashoffset: 16; }
.axi-icon:hover .axi-pie        { animation: axi-pieRotate 0.9s cubic-bezier(0.34, 1.56, 0.64, 1); transform-box: fill-box; transform-origin: 12px 13px; }
.axi-icon:hover .axi-person     { animation: axi-personPop 0.8s cubic-bezier(0.42, 0, 0.58, 1) infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-door       { animation: axi-doorSlide 0.6s cubic-bezier(0.42, 0, 0.58, 1) forwards; transform-box: fill-box; transform-origin: 3px 50%; }
.axi-icon:hover .axi-coin       { animation: axi-coinFlip 0.9s cubic-bezier(0.42, 0, 0.58, 1); transform-box: fill-box; transform-origin: 50% 50%; }
.axi-icon:hover .axi-chk1       { animation: axi-chkSeq1 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 18; stroke-dashoffset: 18; }
.axi-icon:hover .axi-chk2       { animation: axi-chkSeq2 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 18; stroke-dashoffset: 18; }
.axi-icon:hover .axi-chk3       { animation: axi-chkSeq3 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; stroke-dasharray: 18; stroke-dashoffset: 18; }
.axi-icon:hover .axi-scan       { animation: axi-scanY 1.1s cubic-bezier(0.42, 0, 0.58, 1) infinite; }

/* ── PREMIUM DEPTH & LAYERING EFFECTS ── */
/* Apply subtle shadows for depth perception */
.axi-icon:hover g[filter*="shadow"] { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }

/* Enhance primary bars with gradient opacity */
.axi-icon:hover .axi-bar1,
.axi-icon:hover .axi-bar2,
.axi-icon:hover .axi-bar3 { opacity: 0.95; }

/* Subtle glow on pulse rings for premium feel */
.axi-icon:hover .axi-pulse { 
  filter: drop-shadow(0 0 2px currentColor);
  opacity: 0.8;
}

/* Enhanced member icons - soft layering */
.axi-icon:hover circle[cx="9"],
.axi-icon:hover circle[cx="18"] {
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
}

/* Trend line glow effect */
.axi-icon:hover .axi-trend {
  filter: drop-shadow(0 0 1px currentColor);
  stroke-width: 1.7px;
}

/* ── ACCESSIBLE FOCUS STATES ── */
.axi-icon:focus-within {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}

/* ── SMOOTH COLOR TRANSITIONS FOR ICON COLORS ── */
.axi-icon svg {
  transition: filter 0.2s ease-out;
}

.axi-icon {
  --icon-primary-opacity: 1;
  --icon-secondary-opacity: 0.7;
  --icon-accent-opacity: 0.85;
}
`;

function useInjectCSS() {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    if (document.getElementById(STYLE_ID)) { injected.current = true; return; }
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
    injected.current = true;
  }, []);
}

// ─── Base SVG wrapper ─────────────────────────────────────────

function Icon({
  size = 24,
  className = '',
  style,
  label,
  children,
}: IconProps & { children: React.ReactNode }) {
  useInjectCSS();
  return (
    <span className={`axi-icon ${className}`} style={style} aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        overflow="visible"
        aria-hidden="true"
      >
        {/* SVG gradients and filters for premium effects */}
        <defs>
          {/* Gradient for dashboard bars - subtle blue accent */}
          <linearGradient id="grad-dash-bar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>

          {/* Gradient for member icons - soft accent */}
          <linearGradient id="grad-member" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>

          {/* Subtle glow filter for premium look */}
          <filter id="filter-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow for depth */}
          <filter id="filter-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.15" />
          </filter>

          {/* Radial gradient for circular elements */}
          <radialGradient id="grad-radial" cx="40%" cy="40%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        {children}
      </svg>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN / OWNER  (12 icons)
// ═══════════════════════════════════════════════════════════════

/** Admin Dashboard — bar chart with trend line. Bars pump up on hover. Premium styling with enhanced geometry. */
export function AdminDashIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Dashboard'}>
      {/* Baseline with subtle thickness for premium feel */}
      <line x1="2" y1="20" x2="22" y2="20" strokeWidth="1.75" opacity="0.85" />
      
      {/* Bars with rounded corners for premium appearance */}
      <rect className="axi-bar1" x="3"  y="13" width="4" height="7"  rx="1" />
      <rect className="axi-bar2" x="10" y="8"  width="4" height="12" rx="1" />
      <rect className="axi-bar3" x="17" y="11" width="4" height="9"  rx="1" />
      
      {/* Trend line with enhanced stroke and styling */}
      <polyline 
        className="axi-trend" 
        points="5,11 12,6 21,9" 
        strokeWidth="1.75"
        fill="none"
      />
      
      {/* Accent dot on trend endpoint */}
      <circle cx="21" cy="9" r="1.5" opacity="0.9" />
    </Icon>
  );
}

/** Members — group of people with pulse ring. Ring expands on hover. Premium layering. */
export function MembersIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Members'}>
      {/* Primary member circle - enhanced with better proportions */}
      <circle cx="9" cy="7" r="3.5" strokeWidth="1.5" opacity="0.95" />
      
      {/* Primary member lower body path - refined geometry */}
      <path d="M3 21v-2a5 5 0 0 1 5-5h2" strokeWidth="1.5" opacity="0.9" />
      
      {/* Secondary member circle - softer visual weight */}
      <circle cx="18" cy="8" r="2.5" strokeWidth="1.4" opacity="0.8" />
      
      {/* Secondary member lower body - refined */}
      <path d="M22 21v-1a3.5 3.5 0 0 0-3.5-3.5H17" strokeWidth="1.4" opacity="0.75" />
      
      {/* Tertiary member connection - subtle linking */}
      <path d="M9 14h2a5 5 0 0 1 5 5v2" strokeWidth="1.4" opacity="0.75" />
      
      {/* Pulse ring - animated expansion on hover with glow */}
      <circle 
        className="axi-pulse" 
        cx="9" 
        cy="7" 
        r="5.5" 
        strokeOpacity="0.45"
        strokeWidth="1.3"
      />
    </Icon>
  );
}

/** Trainers — dumbbell icon. Bounces on hover. */
export function TrainersIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Trainers'}>
      <g className="axi-bounce">
        <line x1="7" y1="12" x2="17" y2="12" />
        <rect x="2.5"  y="9.5" width="5" height="5" rx="2" />
        <rect x="16.5" y="9.5" width="5" height="5" rx="2" />
        <line x1="7"  y1="10.5" x2="7"  y2="13.5" />
        <line x1="17" y1="10.5" x2="17" y2="13.5" />
      </g>
      <path d="M17 5 L15 9" strokeOpacity="0.45" />
      <circle cx="17" cy="4" r="1.8" />
    </Icon>
  );
}

/** Staff — person with ID badge and shimmer sweep. */
export function StaffIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Staff'}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
      <rect x="9" y="13.5" width="6" height="4"  rx="1" />
      <rect className="axi-shimmer" x="9.5" y="14" width="5" height="3" rx="0.5" strokeOpacity="0.25" />
      <line x1="11" y1="15.5" x2="13" y2="15.5" strokeOpacity="0.5" />
    </Icon>
  );
}

/** Classes — calendar with a stick-figure inside. Calendar flips on hover. */
export function ClassesIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Classes'}>
      <g className="axi-cardflip">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8"  y1="2" x2="8"  y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
      </g>
      <circle cx="12" cy="15" r="2.2" />
      <line x1="12" y1="12.5" x2="12" y2="11" />
      <line x1="10.5" y1="15.5" x2="9"  y2="17" />
      <line x1="13.5" y1="15.5" x2="15" y2="17" />
    </Icon>
  );
}

/** Equipment — heavy barbell. Bounces on hover. */
export function EquipmentIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Equipment'}>
      <g className="axi-bounce">
        <line x1="5" y1="12" x2="19" y2="12" />
        <rect x="1"  y="9" width="5" height="6" rx="2.5" />
        <rect x="18" y="9" width="5" height="6" rx="2.5" />
        <rect x="6"  y="10" width="3" height="4" rx="1" />
        <rect x="15" y="10" width="3" height="4" rx="1" />
      </g>
    </Icon>
  );
}

/** Check-In — door frame with arrow entering. Arrow slides in on hover. */
export function CheckInIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Check-In'}>
      <rect x="3" y="3" width="13" height="18" rx="2" />
      <g className="axi-door">
        <rect x="4" y="4" width="11" height="16" rx="1.5" />
      </g>
      <circle cx="10" cy="12" r="1" fill="currentColor" strokeWidth="0" />
      <g className="axi-arrowup" style={{ transform: 'none' }}>
        <line x1="16" y1="12" x2="23" y2="12" />
        <polyline points="20,9 23,12 20,15" fill="none" />
      </g>
      <line x1="19" y1="7" x2="21" y2="7" strokeOpacity="0.3" />
      <line x1="19" y1="17" x2="21" y2="17" strokeOpacity="0.3" />
      <line className="axi-scan" x1="8" y1="9" x2="8" y2="15" strokeWidth="0.8" strokeOpacity="0.5" />
    </Icon>
  );
}

/** Attendance — checklist with 3 rows. Checks draw in sequence on hover. */
export function AttendanceIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Attendance'}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="7" cy="8"  r="1.4" />
      <circle cx="7" cy="13" r="1.4" />
      <circle cx="7" cy="18" r="1.4" strokeOpacity="0.4" />
      <polyline className="axi-chk1" points="9,7.5 11,9.5 15,6"   />
      <polyline className="axi-chk2" points="9,12.5 11,14.5 15,11" />
      <polyline className="axi-chk3" points="9,17.5 11,19.5 15,16" strokeOpacity="0.35" />
    </Icon>
  );
}

/** Financials — credit card with ₹ symbol + trend line. Card flips on hover. */
export function FinancialsIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Financials'}>
      <g className="axi-coin">
        <rect x="2" y="5" width="20" height="14" rx="2.5" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <circle cx="12" cy="15" r="2.5" />
      </g>
      <text
        x="10.3" y="16.8"
        fontSize="3.5"
        strokeWidth="0.5"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
      >₹</text>
      <polyline className="axi-trend" points="4,8 8,6 12,7 16,4 21,5" strokeOpacity="0.7" />
    </Icon>
  );
}

/** Tasks — checkbox list. Top check draws itself on hover. */
export function TasksIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Tasks'}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="9"  x2="16" y2="9"  strokeOpacity="0.4" />
      <line x1="8" y1="14" x2="16" y2="14" strokeOpacity="0.4" />
      <line x1="8" y1="19" x2="16" y2="19" strokeOpacity="0.4" />
      <polyline className="axi-check" points="8,8 11,11 16,6" />
    </Icon>
  );
}

/** Bell — notification bell. Swings left-right on hover. */
export function BellIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Notifications'}>
      <g className="axi-bell">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <line x1="12" y1="2" x2="12" y2="4" />
      </g>
      <circle cx="19" cy="5" r="2.5" fill="currentColor" strokeWidth="0" strokeOpacity="0" style={{ color: 'var(--color-text-danger, #ef4444)' }} />
    </Icon>
  );
}

/** Gear — settings icon. Spins on hover. */
export function GearIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Settings'}>
      <g className="axi-gear">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </g>
    </Icon>
  );
}

// ═══════════════════════════════════════════════════════════════
// TRAINER  (8 unique icons + shared BellIcon, GearIcon)
// ═══════════════════════════════════════════════════════════════

/** Trainer Dashboard — horizontal bars fill from left on hover. */
export function TrainerDashIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Dashboard'}>
      <rect className="axi-bxh1" x="3"  y="5"  width="14" height="3.5" rx="1" />
      <rect className="axi-bxh2" x="3"  y="10" width="18" height="3.5" rx="1" />
      <rect className="axi-bxh3" x="3"  y="15" width="10" height="3.5" rx="1" />
      <circle cx="20" cy="6.5" r="2" />
      <path d="M20 8.5L20 10" strokeOpacity="0.5" />
    </Icon>
  );
}

/** My Members — group with heartbeat in top corner. Heart beats on hover. */
export function MyMembersIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Members'}>
      <circle cx="8" cy="8" r="3.5" />
      <path d="M2 21v-2a4.5 4.5 0 0 1 4.5-4.5h3a4.5 4.5 0 0 1 4.5 4.5v2" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M22 21v-1a3.5 3.5 0 0 0-3.5-3.5H17" />
      <g className="axi-heart">
        <path d="M18.5 3.5C19.3 2.3 21 2.3 21.5 3.7 22 5.1 20.5 6.5 18.5 8 16.5 6.5 15 5.1 15.5 3.7 16 2.3 17.7 2.3 18.5 3.5Z" />
      </g>
    </Icon>
  );
}

/** My Schedule — mini calendar + clock. Clock hand rotates on hover. */
export function MyScheduleIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Schedule'}>
      <rect x="2" y="3" width="14" height="16" rx="2" />
      <line x1="2" y1="8" x2="16" y2="8" />
      <line x1="7" y1="1" x2="7" y2="5" />
      <line x1="11" y1="1" x2="11" y2="5" />
      <line x1="5" y1="12" x2="8" y2="12" strokeOpacity="0.5" />
      <line x1="5" y1="15" x2="9" y2="15" strokeOpacity="0.5" />
      <circle cx="19" cy="17" r="4" />
      <line x1="19" y1="14.2" x2="19" y2="17" />
      <line className="axi-clockhand" x1="19" y1="17" x2="22" y2="17" />
    </Icon>
  );
}

/** My Classes — 3 person silhouettes. Group bounces on hover. */
export function MyClassesIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Classes'}>
      <g className="axi-bounce">
        <circle cx="5"  cy="6"  r="2.5" />
        <circle cx="12" cy="5"  r="2.5" />
        <circle cx="19" cy="6"  r="2.5" />
        <line x1="5"  y1="8.5" x2="5"  y2="13" />
        <line x1="3.5" y1="10" x2="6.5" y2="10" />
        <line x1="12" y1="7.5" x2="12" y2="13" />
        <line x1="10.5" y1="10" x2="13.5" y2="10" />
        <line x1="19" y1="8.5" x2="19" y2="13" />
        <line x1="17.5" y1="10" x2="20.5" y2="10" />
      </g>
      <line x1="5"  y1="13" x2="4"  y2="17" strokeOpacity="0.5" />
      <line x1="5"  y1="13" x2="6"  y2="17" strokeOpacity="0.5" />
      <line x1="12" y1="13" x2="11" y2="17" strokeOpacity="0.5" />
      <line x1="12" y1="13" x2="13" y2="17" strokeOpacity="0.5" />
      <line x1="19" y1="13" x2="18" y2="17" strokeOpacity="0.5" />
      <line x1="19" y1="13" x2="20" y2="17" strokeOpacity="0.5" />
    </Icon>
  );
}

/** Trainer Progress — trophy with upward arrow. Trophy shines, arrow rises on hover. */
export function TrainerProgressIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Progress'}>
      <g className="axi-trophy">
        <path d="M6 9H4a1 1 0 0 1-1-1V5h3" />
        <path d="M18 9h2a1 1 0 0 0 1-1V5h-3" />
        <path d="M6 5h12v7a6 6 0 0 1-12 0V5Z" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="8"  y1="22" x2="16" y2="22" />
      </g>
      <g className="axi-arrowup">
        <polyline points="9,4 12,1 15,4" />
        <line x1="12" y1="1" x2="12" y2="5" strokeOpacity="0.6" />
      </g>
    </Icon>
  );
}

/** Progress Notes — document with pen writing. Pen draws on hover. */
export function ProgressNotesIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Progress Notes'}>
      <rect x="4" y="2" width="13" height="18" rx="2" />
      <line x1="7" y1="7"  x2="14" y2="7"  />
      <line x1="7" y1="11" x2="12" y2="11" />
      <line x1="7" y1="15" x2="10" y2="15" />
      <line className="axi-pen" x1="14" y1="13" x2="18" y2="17" strokeWidth="2" />
      <path d="M18 17 L17 20.5 L20.5 19.5 Z" />
      <line className="axi-pen" x1="13.5" y1="12.5" x2="14.5" y2="13.5" />
    </Icon>
  );
}

/** Reports — pie/donut chart. Slice rotates on hover. */
export function ReportsIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Reports'}>
      <circle cx="12" cy="13" r="9" />
      <g className="axi-pie">
        <path d="M12 13 L12 4 A9 9 0 0 1 21 13 Z" strokeOpacity="0.65" />
      </g>
      <line x1="12" y1="13" x2="5"  y2="8.5" strokeOpacity="0.35" />
      <line x1="12" y1="13" x2="9"  y2="4.2" strokeOpacity="0.25" />
    </Icon>
  );
}

/** Trainer Profile — person with star badge. Star spins on hover. */
export function TrainerProfileIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Profile'}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
      <g className="axi-star">
        <path
          d="M18.5 2 L19.4 4.7 L22.2 4.7 L20 6.3 L20.9 9 L18.5 7.4 L16.1 9 L17 6.3 L14.8 4.7 L17.6 4.7Z"
          strokeOpacity="0.7"
        />
      </g>
    </Icon>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMBER  (7 unique icons + shared BellIcon, GearIcon)
// ═══════════════════════════════════════════════════════════════

/** Member Dashboard — Apple Watch-style activity rings. Rings draw in on hover. */
export function MemberDashIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Dashboard'}>
      <circle className="axi-ring1" cx="12" cy="12" r="9"  strokeWidth="2.5" />
      <circle className="axi-ring2" cx="12" cy="12" r="6.5" strokeWidth="2.5" strokeOpacity="0.7" />
      <circle className="axi-ring3" cx="12" cy="12" r="4"  strokeWidth="2.5" strokeOpacity="0.5" />
      <circle cx="12" cy="12" r="1.5" />
    </Icon>
  );
}

/** My Membership — credit card with shimmer. Card flips and shimmer on hover. */
export function MyMembershipIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Membership'}>
      <g className="axi-cardflip">
        <rect x="2"  y="6"  width="20" height="14" rx="2.5" />
        <line x1="2" y1="11" x2="22" y2="11" />
        <rect x="4" y="8" width="5" height="2" rx="0.5" />
        <line x1="5" y1="15" x2="12" y2="15" strokeOpacity="0.5" />
        <line x1="5" y1="18" x2="9"  y2="18" strokeOpacity="0.4" />
      </g>
      <rect className="axi-shimmer" x="5" y="12" width="4" height="5" rx="1" strokeOpacity="0.15" />
    </Icon>
  );
}

/** Member Progress — body figure with upward arrow. Person pops, arrow rises on hover. */
export function MemberProgressIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Progress'}>
      <g className="axi-person">
        <circle cx="9" cy="5"  r="2.5" />
        <line x1="9"  y1="7.5" x2="9"  y2="14" />
        <line x1="6"  y1="10"  x2="12" y2="10" />
        <line x1="9"  y1="14"  x2="6"  y2="20" />
        <line x1="9"  y1="14"  x2="12" y2="20" />
      </g>
      <g className="axi-arrowup">
        <line x1="18" y1="4" x2="18" y2="14" strokeOpacity="0.6" />
        <polyline points="15,7 18,4 21,7" />
        <line x1="15" y1="9"  x2="21" y2="9"  strokeOpacity="0.35" />
        <line x1="15" y1="12" x2="21" y2="12" strokeOpacity="0.25" />
      </g>
    </Icon>
  );
}

/** My Trainer — person silhouette with star. Star spins on hover. */
export function MyTrainerIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Trainer'}>
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
      <g className="axi-star">
        <path d="M20 1 L21 3.5 L23.5 3.5 L21.6 5.1 L22.4 7.5 L20 6 L17.6 7.5 L18.4 5.1 L16.5 3.5 L19 3.5Z" />
      </g>
    </Icon>
  );
}

/** Available Classes — calendar with play button. Play button pulses on hover. */
export function AvailableClassesIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Available Classes'}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3"  y1="9"  x2="21" y2="9"  />
      <line x1="8"  y1="2"  x2="8"  y2="6"  />
      <line x1="16" y1="2"  x2="16" y2="6"  />
      <g className="axi-play">
        <polygon points="10,13 10,19 17,16" strokeLinejoin="round" />
      </g>
    </Icon>
  );
}

/** My Bookings — ticket / stub. Stamp bounce effect on hover. */
export function MyBookingsIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'My Bookings'}>
      <g className="axi-ticket">
        <rect x="2"  y="6"  width="20" height="13" rx="2" />
        <path d="M9 6 L9 19"  strokeDasharray="3 2" />
        <line x1="2"  y1="12.5" x2="9"  y2="12.5" />
        <circle cx="13" cy="12" r="1.5" />
        <line x1="16" y1="10" x2="20" y2="10" strokeOpacity="0.5" />
        <line x1="16" y1="13" x2="20" y2="13" strokeOpacity="0.5" />
        <line x1="16" y1="16" x2="20" y2="16" strokeOpacity="0.5" />
      </g>
    </Icon>
  );
}

/** Member Profile — person silhouette. Pops on hover. */
export function MemberProfileIcon(p: IconProps) {
  return (
    <Icon {...p} label={p.label ?? 'Profile'}>
      <g className="axi-person">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
      </g>
    </Icon>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE MAPS — index by sidebar page key
// ═══════════════════════════════════════════════════════════════

/**
 * Admin sidebar icon map.
 * Key matches your sidebar route/page name (lowercase, no spaces).
 *
 * Usage:
 *   import { ADMIN_ICONS } from './AthlonXIcons'
 *   const Icon = ADMIN_ICONS['dashboard']
 *   <Icon size={20} className="text-gray-400" />
 */
export const ADMIN_ICONS: Record<string, React.FC<IconProps>> = {
  dashboard:     AdminDashIcon,
  members:       MembersIcon,
  trainers:      TrainersIcon,
  staff:         StaffIcon,
  classes:       ClassesIcon,
  equipment:     EquipmentIcon,
  'check-in':    CheckInIcon,
  checkin:       CheckInIcon,
  attendance:    AttendanceIcon,
  financials:    FinancialsIcon,
  tasks:         TasksIcon,
  notifications: BellIcon,
  settings:      GearIcon,
};

/**
 * Trainer sidebar icon map.
 */
export const TRAINER_ICONS: Record<string, React.FC<IconProps>> = {
  dashboard:        TrainerDashIcon,
  'my-members':     MyMembersIcon,
  mymembers:        MyMembersIcon,
  'my-schedule':    MyScheduleIcon,
  myschedule:       MyScheduleIcon,
  'my-classes':     MyClassesIcon,
  myclasses:        MyClassesIcon,
  'my-progress':    TrainerProgressIcon,
  myprogress:       TrainerProgressIcon,
  'progress-notes': ProgressNotesIcon,
  progressnotes:    ProgressNotesIcon,
  reports:          ReportsIcon,
  profile:          TrainerProfileIcon,
  notifications:    BellIcon,
  settings:         GearIcon,
};

/**
 * Member sidebar icon map.
 */
export const MEMBER_ICONS: Record<string, React.FC<IconProps>> = {
  dashboard:           MemberDashIcon,
  'my-membership':     MyMembershipIcon,
  mymembership:        MyMembershipIcon,
  'my-progress':       MemberProgressIcon,
  myprogress:          MemberProgressIcon,
  'my-trainer':        MyTrainerIcon,
  mytrainer:           MyTrainerIcon,
  'available-classes': AvailableClassesIcon,
  availableclasses:    AvailableClassesIcon,
  'my-bookings':       MyBookingsIcon,
  mybookings:          MyBookingsIcon,
  profile:             MemberProfileIcon,
  notifications:       BellIcon,
  settings:            GearIcon,
};
