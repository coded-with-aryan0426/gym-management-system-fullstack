import React, { useState, useEffect, useRef } from 'react';
import { Users, Link, Shield, Key, Database, Download, Share2, Loader2 } from 'lucide-react';

const TABLES = {
  users: {
    title: "USERS",
    color: "from-blue-500 to-blue-700",
    icon: Users,
    attributes: [
      { name: "user_id", type: "PK", bold: true },
      { name: "username", type: "UK", bold: true },
      { name: "password" },
      { name: "full_name" },
      { name: "email" },
      { name: "phone" },
      { name: "auth_provider" },
      { name: "two_factor_enabled" }
    ]
  },
  userRoleMap: {
    title: "USER_ROLE_MAP",
    color: "from-orange-400 to-orange-500",
    icon: Link,
    attributes: [
      { name: "user_id", type: "FK", bold: true },
      { name: "role_id", type: "FK", bold: true }
    ]
  },
  roles: {
    title: "ROLES",
    color: "from-purple-500 to-purple-600",
    icon: Shield,
    attributes: [
      { name: "role_id", type: "PK", bold: true },
      { name: "role_name", type: "UK", bold: true }
    ]
  },
  rolePermissions: {
    title: "ROLE_PERMISSIONS",
    color: "from-orange-400 to-orange-500",
    icon: Link,
    attributes: [
      { name: "role_id", type: "FK", bold: true },
      { name: "permission_id", type: "FK", bold: true }
    ]
  },
  permissions: {
    title: "PERMISSIONS",
    color: "from-emerald-500 to-green-600",
    icon: Key,
    attributes: [
      { name: "permission_id", type: "PK", bold: true },
      { name: "module" },
      { name: "action" }
    ]
  }
};

const TableCard = ({ title, icon: Icon, color, attributes, cardRef }: any) => (
  <div 
    ref={cardRef} 
    className="w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden z-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 duration-300 flex flex-col"
  >
    {/* Header */}
    <div className={`bg-gradient-to-br ${color} p-4 flex items-center gap-3 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-white tracking-wider text-sm">{title}</h3>
    </div>

    {/* Body */}
    <div className="p-2 flex flex-col gap-0.5 bg-slate-50/50 flex-grow">
      {attributes.map((attr: any, i: number) => (
        <div 
          key={i} 
          className={`flex items-center justify-between p-2.5 rounded-xl transition-colors
            ${attr.bold ? 'bg-white shadow-sm border border-slate-100 text-slate-800 font-semibold' : 'text-slate-600 hover:bg-slate-100/80'}
          `}
        >
          <span className="flex items-center gap-2 text-sm">
            {attr.type === 'PK' ? (
              <Key className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <span className="w-3.5 h-3.5"></span> // Spacer to align text
            )}
            {attr.name}
          </span>
          
          {attr.type && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
              ${attr.type === 'PK' ? 'bg-amber-100 text-amber-700' :
                attr.type === 'FK' ? 'bg-indigo-100 text-indigo-700' :
                'bg-fuchsia-100 text-fuchsia-700'}
            `}>
              {attr.type}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default function ERDiagramExport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const userRoleMapRef = useRef<HTMLDivElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);
  const rolePermissionsRef = useRef<HTMLDivElement>(null);
  const permissionsRef = useRef<HTMLDivElement>(null);
  
  const [tick, setTick] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Trigger re-render to calculate line positions after DOM layout
  useEffect(() => {
    const handleResize = () => setTick(t => t + 1);
    window.addEventListener('resize', handleResize);
    const timeout = setTimeout(handleResize, 150); // Initial calculation
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  const getPathCoords = (startElement: HTMLElement | null, endElement: HTMLElement | null) => {
    if (!startElement || !endElement || !containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const startRect = startElement.getBoundingClientRect();
    const endRect = endElement.getBoundingClientRect();

    // Determine direction dynamically for multi-column layout
    const isRight = endRect.left > startRect.right;
    const isLeft = endRect.right < startRect.left;

    let startX, startY, endX, endY, midX, direction;

    if (isRight) {
      startX = startRect.right - containerRect.left;
      startY = startRect.top + startRect.height / 2 - containerRect.top;
      endX = endRect.left - containerRect.left;
      endY = endRect.top + endRect.height / 2 - containerRect.top;
      midX = startX + (endX - startX) / 2;
      direction = 'right';
    } else if (isLeft) {
      startX = startRect.left - containerRect.left;
      startY = startRect.top + startRect.height / 2 - containerRect.top;
      endX = endRect.right - containerRect.left;
      endY = endRect.top + endRect.height / 2 - containerRect.top;
      midX = startX - (startX - endX) / 2;
      direction = 'left';
    } else {
      // Fallback
      startX = startRect.right - containerRect.left;
      startY = startRect.top + startRect.height / 2 - containerRect.top;
      endX = endRect.left - containerRect.left;
      endY = endRect.top + endRect.height / 2 - containerRect.top;
      midX = startX + (endX - startX) / 2;
      direction = 'right';
    }

    return { startX, startY, endX, endY, midX, direction };
  };

  const handleExport = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    
    try {
      // @ts-ignore
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // @ts-ignore
      const canvas = await window.html2canvas(diagramRef.current, {
        backgroundColor: '#f8fafc', // matches slate-50
        scale: 2, // High resolution for crisp text
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = 'User-RBAC-ER-Diagram.png';
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const drawConnection = (startRef: any, endRef: any, type: string, label: string) => {
    const coords = getPathCoords(startRef.current, endRef.current);
    if (!coords) return null;
    const { startX, startY, endX, endY, midX, direction } = coords;

    const strokeColor = "#cbd5e1"; // slate-300
    const markerColor = "#94a3b8"; // slate-400
    
    // Invert markers if routing leftward
    const dirMult = direction === 'left' ? -1 : 1;

    const startMarkerX1 = startX + (8 * dirMult);
    const startMarkerX2 = startX + (14 * dirMult);
    const endMarkerX1 = endX - (8 * dirMult);
    const endMarkerX2 = endX - (14 * dirMult);
    const crowBaseX = endX - (14 * dirMult);
    const crowCircleX = endX - (22 * dirMult);

    return (
      <g>
        <path d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`} 
              fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" transform="translate(0, 2)" />
              
        <path d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`} 
              fill="none" stroke={strokeColor} strokeWidth="2.5" />

        <path d={`M ${startMarkerX1} ${startY - 10} L ${startMarkerX1} ${startY + 10} M ${startMarkerX2} ${startY - 10} L ${startMarkerX2} ${startY + 10}`} 
              stroke={markerColor} strokeWidth="2.5" fill="none" />

        {type === '1:1' ? (
          <path d={`M ${endMarkerX1} ${endY - 10} L ${endMarkerX1} ${endY + 10} M ${endMarkerX2} ${endY - 10} L ${endMarkerX2} ${endY + 10}`} 
                stroke={markerColor} strokeWidth="2.5" fill="none" />
        ) : (
          <g>
            <circle cx={crowCircleX} cy={endY} r="4.5" stroke={markerColor} strokeWidth="2" fill="white" />
            <path d={`M ${endX} ${endY} L ${crowBaseX} ${endY} M ${endX} ${endY - 12} L ${crowBaseX} ${endY} M ${endX} ${endY + 12} L ${crowBaseX} ${endY}`} 
                  stroke={markerColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        <rect x={midX - 45} y={(startY + endY) / 2 - 14} width="90" height="28" rx="14" 
              fill="rgba(255, 255, 255, 0.9)" stroke="#e2e8f0" strokeWidth="1" className="shadow-sm backdrop-blur-sm" />
        <text x={midX} y={(startY + endY) / 2 + 4} fill="#64748b" fontSize="9" fontWeight="800" 
              textAnchor="middle" letterSpacing="1" className="uppercase font-sans">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-200">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">User Management & RBAC</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">ENTERPRISE ER DIAGRAM</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export High-Res PNG'}
          </button>
        </div>
      </div>

      <div ref={diagramRef} className="flex-grow relative overflow-hidden flex items-center justify-center p-8 min-h-[850px]" style={{ width: '210mm', height: '297mm', margin: '0 auto' }}>
        <div className="absolute inset-0 z-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div ref={containerRef} className="relative w-full max-w-[1300px] h-full flex items-center justify-center gap-24 px-8 z-10">
          
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {drawConnection(usersRef, userRoleMapRef, '1:N', 'Assigned')}
            {drawConnection(rolesRef, userRoleMapRef, '1:N', 'Has Role')}
            {drawConnection(rolesRef, rolePermissionsRef, '1:N', 'Granted')}
            {drawConnection(permissionsRef, rolePermissionsRef, '1:N', 'Includes')}
          </svg>

          <div className="flex flex-col justify-center h-full z-20">
            <TableCard cardRef={usersRef} {...TABLES.users} />
          </div>

          <div className="flex flex-col justify-center gap-24 h-full py-8 z-20">
            <TableCard cardRef={userRoleMapRef} {...TABLES.userRoleMap} />
            <TableCard cardRef={rolePermissionsRef} {...TABLES.rolePermissions} />
          </div>

          <div className="flex flex-col justify-center gap-24 h-full py-8 z-20">
            <TableCard cardRef={rolesRef} {...TABLES.roles} />
            <TableCard cardRef={permissionsRef} {...TABLES.permissions} />
          </div>

        </div>
      </div>
    </div>
  );
}
