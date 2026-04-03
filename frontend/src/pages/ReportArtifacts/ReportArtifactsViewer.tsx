import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode2,
  FileImage,
  FileText,
  GitBranch,
  Globe,
  HelpCircle,
  Key,
  LayoutDashboard,
  Loader2,
  Lock,
  LogIn,
  Network,
  Play,
  Tag,
  UserPlus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

declare global {
  interface Window {
    html2canvas?: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  }
}

const C1 = 120;
const C2 = 300;
const C3 = 500;
const C4 = 720;
const C5 = 940;
const C6 = 1200;

const Y_LOOP_1 = 100;
const Y_LOOP_2 = 160;
const Y_TOP = 240;
const Y_S2 = 340;
const Y_MID = 440;
const Y_LANE = 510;
const Y_S4 = 540;
const Y_BOT = 640;
const Y_DASH = 740;

type NodeType = 'terminal' | 'decision' | 'process';

type DiagramNode = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  type: NodeType;
  bg: string;
  border: string;
  text: string;
};

type Point = { x: number; y: number };
type Bounds = { x: number; y: number; t: number; b: number; l: number; r: number };

type FlowStep = {
  title: string;
  detail: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const NODES: Record<string, DiagramNode> = {
  start: { id: 'start', label: 'Start', icon: Play, x: C1, y: Y_MID, type: 'terminal', bg: 'bg-slate-800', border: 'border-slate-900', text: 'text-white' },
  method: { id: 'method', label: 'Method', icon: GitBranch, x: C2, y: Y_MID, type: 'decision', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  form: { id: 'form', label: 'Fill Form', icon: FileText, x: C3, y: Y_TOP, type: 'process', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  oauth: { id: 'oauth', label: 'OAuth', icon: Globe, x: C3, y: Y_BOT, type: 'process', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  valid: { id: 'valid', label: 'Valid?', icon: HelpCircle, x: C4, y: Y_TOP, type: 'decision', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  linked: { id: 'linked', label: 'Linked?', icon: HelpCircle, x: C4, y: Y_BOT, type: 'decision', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  exists: { id: 'exists', label: 'Exists?', icon: HelpCircle, x: C5, y: Y_TOP, type: 'decision', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  login: { id: 'login', label: 'Login', icon: LogIn, x: C5, y: Y_BOT, type: 'process', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  hash: { id: 'hash', label: 'Hash Password', icon: Lock, x: C6, y: Y_TOP, type: 'process', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  create: { id: 'create', label: 'Create User', icon: UserPlus, x: C6, y: Y_S2, type: 'process', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  assign: { id: 'assign', label: 'Assign Role', icon: Tag, x: C6, y: Y_MID, type: 'process', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  jwt: { id: 'jwt', label: 'Generate JWT', icon: Key, x: C6, y: Y_S4, type: 'process', bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
  dash: { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, x: C6, y: Y_DASH, type: 'terminal', bg: 'bg-slate-800', border: 'border-slate-900', text: 'text-white' },
};

const reportFlow: FlowStep[] = [
  {
    title: 'Markdown chapters',
    detail: 'Each report section starts as a separate `.md` file under the report folder.',
    path: 'docs/build_artifacts/report/*.md',
    icon: FileText,
    accent: 'from-blue-500/20 to-indigo-500/10 text-blue-700 border-blue-200',
  },
  {
    title: 'Combined build layer',
    detail: 'The build merges content and generates diagram images for the final document pipeline.',
    path: 'docs/build_artifacts/.report_build/combined_report.md',
    icon: FileImage,
    accent: 'from-violet-500/20 to-fuchsia-500/10 text-violet-700 border-violet-200',
  },
  {
    title: 'LaTeX formatting',
    detail: 'Structured academic formatting is generated as a `.tex` file for high-quality export.',
    path: 'docs/build_artifacts/report/GymManagementSystem_Internship_Report.tex',
    icon: FileCode2,
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-700 border-amber-200',
  },
  {
    title: 'Final PDF report',
    detail: 'LaTeX compilation creates the final internship report PDF and auxiliary files.',
    path: 'docs/build_artifacts/report/GymManagementSystem_Internship_Report.pdf',
    icon: CheckCircle2,
    accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-700 border-emerald-200',
  },
];

function FlowCard({ step, index }: { step: FlowStep; index: number }) {
  const Icon = step.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`inline-flex rounded-2xl border bg-gradient-to-br p-3 ${step.accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Step {index + 1}</div>
          <h3 className="mt-1 text-base font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
        </div>
      </div>
      <code className="mt-4 block overflow-hidden text-ellipsis rounded-2xl bg-slate-100 px-3 py-2.5 text-xs text-slate-700">
        {step.path}
      </code>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
      <p className="text-sm leading-7 text-slate-600">{children}</p>
    </div>
  );
}

export default function ReportArtifactsViewer() {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const [zoomInput, setZoomInput] = useState('100%');

  useEffect(() => {
    setZoomInput(`${Math.round(scale * 100)}%`);
  }, [scale]);

  const handleZoomIn = () => setScale((value) => Math.min(value + 0.1, 2.5));
  const handleZoomOut = () => setScale((value) => Math.max(value - 0.1, 0.4));

  const applyZoomInput = () => {
    const parsed = parseInt(zoomInput.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(parsed)) {
      setScale(Math.max(20, Math.min(parsed, 250)) / 100);
      return;
    }
    setZoomInput(`${Math.round(scale * 100)}%`);
  };

  const getBounds = (nodeId: string): Bounds | null => {
    const node = NODES[nodeId];
    if (!node) return null;

    let width = 150;
    let height = 52;

    if (node.type === 'terminal') {
      width = 130;
      height = 48;
    }

    if (node.type === 'decision') {
      width = 100;
      height = 100;
    }

    return {
      x: node.x,
      y: node.y,
      t: node.y - height / 2,
      b: node.y + height / 2,
      l: node.x - width / 2,
      r: node.x + width / 2,
    };
  };

  const drawRoundedPath = (points: Point[], radius = 16) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length - 1; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const next = points[index + 1];

      const dx1 = current.x - previous.x;
      const dy1 = current.y - previous.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;

      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const localRadius = Math.min(radius, len1 / 2, len2 / 2);

      const currentA = { x: current.x - (dx1 / len1) * localRadius, y: current.y - (dy1 / len1) * localRadius };
      const currentB = { x: current.x + (dx2 / len2) * localRadius, y: current.y + (dy2 / len2) * localRadius };

      path += ` L ${currentA.x} ${currentA.y} Q ${current.x} ${current.y} ${currentB.x} ${currentB.y}`;
    }

    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    return path;
  };

  const captureDiagram = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (!window.html2canvas) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load html2canvas'));
          document.head.appendChild(script);
        });
      }

      if (!diagramRef.current || !window.html2canvas) {
        return null;
      }

      const canvas = await window.html2canvas(diagramRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Capture failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenInNewTab = async () => {
    const imageData = await captureDiagram();
    if (!imageData) return;

    const newTab = window.open('', '_blank');
    if (!newTab) return;

    newTab.document.write(`
      <html>
        <head><title>Registration Flow Architecture</title></head>
        <body style="margin:0; background:#e2e8f0; display:flex; justify-content:center; padding:40px;">
          <img src="${imageData}" style="box-shadow:0 24px 80px rgba(15,23,42,0.18); border-radius:18px; max-width:100%;" />
        </body>
      </html>
    `);
    newTab.document.close();
  };

  const handleExport = async () => {
    const imageData = await captureDiagram();
    if (!imageData) return;

    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'User-Registration-Logic.png';
    link.click();
  };

  const renderData = (() => {
    const gap = 8;
    const lines: JSX.Element[] = [];
    const labels: JSX.Element[] = [];

    const draw = (path: string, key: string) => (
      <path key={key} d={path} fill="none" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" strokeLinejoin="round" />
    );

    const renderLabel = (x: number, y: number, text: string, key: string) => (
      <div key={`lbl-${key}`} className="absolute z-40 -translate-x-1/2 -translate-y-1/2 transform" style={{ left: x, top: y }}>
        <div className="rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 shadow-sm backdrop-blur-sm">
          {text}
        </div>
      </div>
    );

    const bounds: Record<string, Bounds> = {};
    Object.keys(NODES).forEach((key) => {
      const value = getBounds(key);
      if (value) bounds[key] = value;
    });

    lines.push(draw(drawRoundedPath([{ x: bounds.start.r, y: Y_MID }, { x: bounds.method.l - gap, y: Y_MID }]), 'l1'));
    lines.push(draw(drawRoundedPath([{ x: bounds.method.x, y: bounds.method.t }, { x: bounds.method.x, y: Y_TOP }, { x: bounds.form.l - gap, y: Y_TOP }]), 'l2'));
    labels.push(renderLabel(bounds.method.x + (bounds.form.l - bounds.method.x) / 2, Y_TOP, 'Email', 'email'));
    lines.push(draw(drawRoundedPath([{ x: bounds.method.x, y: bounds.method.b }, { x: bounds.method.x, y: Y_BOT }, { x: bounds.oauth.l - gap, y: Y_BOT }]), 'l3'));
    labels.push(renderLabel(bounds.method.x + (bounds.oauth.l - bounds.method.x) / 2, Y_BOT, 'Google / FB', 'oauth'));
    lines.push(draw(drawRoundedPath([{ x: bounds.form.r, y: Y_TOP }, { x: bounds.valid.l - gap, y: Y_TOP }]), 'l4'));
    lines.push(draw(drawRoundedPath([{ x: bounds.valid.r, y: Y_TOP }, { x: bounds.exists.l - gap, y: Y_TOP }]), 'l5'));
    labels.push(renderLabel(bounds.valid.r + (bounds.exists.l - bounds.valid.r) / 2, Y_TOP, 'Yes', 'valid-yes'));
    lines.push(draw(drawRoundedPath([{ x: bounds.valid.x, y: bounds.valid.t }, { x: bounds.valid.x, y: Y_LOOP_2 }, { x: bounds.form.x - 20, y: Y_LOOP_2 }, { x: bounds.form.x - 20, y: bounds.form.t - gap }]), 'l6'));
    labels.push(renderLabel((bounds.valid.x + bounds.form.x - 20) / 2, Y_LOOP_2, 'No', 'valid-no'));
    lines.push(draw(drawRoundedPath([{ x: bounds.exists.x, y: bounds.exists.t }, { x: bounds.exists.x, y: Y_LOOP_1 }, { x: bounds.form.x + 20, y: Y_LOOP_1 }, { x: bounds.form.x + 20, y: bounds.form.t - gap }]), 'l7'));
    labels.push(renderLabel((bounds.exists.x + bounds.form.x + 20) / 2, Y_LOOP_1, 'Yes', 'exists-yes'));
    lines.push(draw(drawRoundedPath([{ x: bounds.exists.r, y: Y_TOP }, { x: bounds.hash.l - gap, y: Y_TOP }]), 'l8'));
    labels.push(renderLabel(bounds.exists.r + (bounds.hash.l - bounds.exists.r) / 2, Y_TOP, 'No', 'exists-no'));
    lines.push(draw(drawRoundedPath([{ x: bounds.oauth.r, y: Y_BOT }, { x: bounds.linked.l - gap, y: Y_BOT }]), 'l9'));
    lines.push(draw(drawRoundedPath([{ x: bounds.linked.r, y: Y_BOT }, { x: bounds.login.l - gap, y: Y_BOT }]), 'l10'));
    labels.push(renderLabel(bounds.linked.r + (bounds.login.l - bounds.linked.r) / 2, Y_BOT, 'Yes', 'linked-yes'));
    lines.push(draw(drawRoundedPath([{ x: bounds.linked.x, y: bounds.linked.t }, { x: bounds.linked.x, y: Y_LANE }, { x: 1100, y: Y_LANE }, { x: 1100, y: Y_TOP + 12 }, { x: bounds.hash.l - gap, y: Y_TOP + 12 }]), 'l11'));
    labels.push(renderLabel(bounds.linked.x + (1100 - bounds.linked.x) / 2, Y_LANE, 'No', 'linked-no'));
    lines.push(draw(drawRoundedPath([{ x: bounds.hash.x, y: bounds.hash.b }, { x: bounds.create.x, y: bounds.create.t - gap }]), 'l12'));
    lines.push(draw(drawRoundedPath([{ x: bounds.create.x, y: bounds.create.b }, { x: bounds.assign.x, y: bounds.assign.t - gap }]), 'l13'));
    lines.push(draw(drawRoundedPath([{ x: bounds.assign.x, y: bounds.assign.b }, { x: bounds.jwt.x, y: bounds.jwt.t - gap }]), 'l14'));
    lines.push(draw(drawRoundedPath([{ x: bounds.login.r, y: Y_BOT }, { x: 1100, y: Y_BOT }, { x: 1100, y: Y_S4 }, { x: bounds.jwt.l - gap, y: Y_S4 }]), 'l15'));
    lines.push(draw(drawRoundedPath([{ x: bounds.jwt.x, y: bounds.jwt.b }, { x: bounds.dash.x, y: bounds.dash.t - gap }]), 'l16'));

    return { lines, labels };
  })();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">
                <Network className="h-4 w-4" /> Report Flow
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Markdown to PDF workflow</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Simple view of how the files in `docs/build_artifacts/report` move from Markdown source files to the final PDF report.
              </p>
            </div>

            <div className="grid gap-3 sm:min-w-[260px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Source</div>
                <div className="mt-1 text-sm font-bold text-slate-900">Markdown files</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Output</div>
                <div className="mt-1 text-sm font-bold text-slate-900">PDF report</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {reportFlow.map((step, index) => (
              <FlowCard key={step.title} step={step} index={index} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">How it works</div>
              <div className="mt-4 space-y-3">
                <Bullet>Markdown chapter files are stored in `docs/build_artifacts/report`.</Bullet>
                <Bullet>The build prepares `docs/build_artifacts/.report_build/combined_report.md` and diagram PNG files.</Bullet>
                <Bullet>The content is formatted into `docs/build_artifacts/report/GymManagementSystem_Internship_Report.tex`.</Bullet>
                <Bullet>LaTeX compilation generates `docs/build_artifacts/report/GymManagementSystem_Internship_Report.pdf`.</Bullet>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Main files</div>
              <div className="mt-4 grid gap-3">
                <code className="rounded-2xl bg-white px-3 py-3 text-xs text-slate-700">docs/build_artifacts/report</code>
                <code className="rounded-2xl bg-white px-3 py-3 text-xs text-slate-700">docs/build_artifacts/.report_build/combined_report.md</code>
                <code className="rounded-2xl bg-white px-3 py-3 text-xs text-slate-700">docs/build_artifacts/report/GymManagementSystem_Internship_Report.tex</code>
                <code className="rounded-2xl bg-white px-3 py-3 text-xs text-slate-700">docs/build_artifacts/report/GymManagementSystem_Internship_Report.pdf</code>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
                  Interactive Diagram
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">User registration flow</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Simple interactive view of your provided flowchart with zoom, preview, and PNG export.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
                  <button onClick={handleZoomOut} className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={zoomInput}
                    onChange={(event) => setZoomInput(event.target.value)}
                    onBlur={applyZoomInput}
                    onKeyDown={(event) => event.key === 'Enter' && applyZoomInput()}
                    className="w-14 rounded-xl bg-transparent px-2 py-1 text-center font-mono text-xs font-bold text-slate-700 outline-none"
                  />
                  <button onClick={handleZoomIn} className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <button onClick={handleOpenInNewTab} disabled={isProcessing} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50">
                  <ExternalLink className="h-4 w-4" /> Preview
                </button>

                <button onClick={handleExport} disabled={isProcessing} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-70">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isProcessing ? 'Processing...' : 'Export PNG'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4 sm:p-6">
            <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-inner backdrop-blur-sm sm:p-5">
              <div className="relative overflow-auto rounded-[24px] border border-slate-200 bg-slate-100 p-4 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_45%)]" />
                <div className="relative flex min-w-max justify-center">
                  <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }} className="transition-transform duration-200">
                    <div ref={diagramRef} className="relative h-[850px] w-[1350px] overflow-hidden rounded-[26px] border border-slate-300 bg-slate-50 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
                      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                      <div className="absolute left-8 top-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-md">
                        <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-500/30">
                          <Network className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-sm font-extrabold uppercase leading-tight tracking-[0.18em] text-slate-800">AthlonX Logic Architecture</h3>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">User Registration Flow</p>
                        </div>
                      </div>

                      <svg className="absolute left-0 top-0 z-10 h-full w-full overflow-visible pointer-events-none">
                        <defs>
                          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse">
                            <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
                          </marker>
                        </defs>
                        {renderData.lines}
                      </svg>

                      {renderData.labels}

                      {Object.values(NODES).map((node) => {
                        if (node.type === 'decision') {
                          return (
                            <div key={node.id} className="absolute z-30 flex items-center justify-center" style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)', width: '100px', height: '100px' }}>
                              <div className={`flex h-[90px] w-[90px] rotate-45 items-center justify-center border-2 ${node.bg} ${node.border} shadow-md`}>
                                <div className="flex h-full w-full -rotate-45 flex-col items-center justify-center gap-1">
                                  <node.icon className={`h-4 w-4 ${node.text} opacity-90`} />
                                  <span className={`px-1 text-center text-[11px] font-bold leading-tight tracking-wide ${node.text}`}>{node.label}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const styleClasses = node.type === 'terminal'
                          ? `${node.bg} ${node.text} h-[48px] w-[130px] rounded-full border-[3px] ${node.border} shadow-slate-900/20`
                          : `${node.bg} ${node.text} h-[52px] w-[150px] rounded-xl border-2 ${node.border} shadow-sm`;

                        return (
                          <div key={node.id} className={`absolute z-30 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center gap-2 ${styleClasses}`} style={{ left: node.x, top: node.y }}>
                            <node.icon className={`h-4 w-4 ${node.text} opacity-90`} />
                            <span className="text-[12px] font-extrabold uppercase leading-tight tracking-wide">{node.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
