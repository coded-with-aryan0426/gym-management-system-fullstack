import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KPIStats, Transaction } from '../types/finance';

/* ────────────────────────────────────────────────────── */
/*  CSV Export                                            */
/* ────────────────────────────────────────────────────── */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(item => headers.map(h => {
            let v = item[h];
            if (typeof v === 'string' && v.includes(',')) v = `"${v}"`;
            return v;
        }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/* ────────────────────────────────────────────────────── */
/*  PDF Export — Professional Financial Report            */
/* ────────────────────────────────────────────────────── */

interface PDFExportData {
    stats: KPIStats;
    transactions: Transaction[];
    revenueBreakdown: { label: string; value: number; percentage: number }[];
    expenseBreakdown: { label: string; value: number; percentage: number }[];
    period: string;
    gymName?: string;
    categoryIncomeStats?: { category: string; count: number; total: number }[];
    categoryExpenseStats?: { category: string; count: number; total: number }[];
    pendingTransactions?: any[];
    dailyTrend?: { date: string; revenue: number; expenses: number; profit: number }[];
    topIncomeTransactions?: any[];
    topExpenseTransactions?: any[];
}

/* ── Helpers ─────────────────────────────────────────── */

// jsPDF uses Helvetica which lacks Unicode ₹ glyph → show "Rs." instead
const fmt = (val: number) => {
    const abs = Math.abs(val);
    let str: string;
    if (abs >= 10000000) str = `Rs. ${(val / 10000000).toFixed(2)}Cr`;
    else if (abs >= 100000) str = `Rs. ${(val / 100000).toFixed(2)}L`;
    else str = `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val)}`;
    return str;
};

const fmtFull = (val: number) =>
    `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val)}`;

type RGB = [number, number, number];

const C = {
    // Brand
    navy:       [15, 23, 42]    as RGB,
    navyMid:    [30, 41, 59]    as RGB,
    navyLight:  [51, 65, 85]    as RGB,
    // Accents
    blue:       [59, 130, 246]  as RGB,
    blueDark:   [29, 78, 216]   as RGB,
    bluePale:   [219, 234, 254] as RGB,
    // Green
    green:      [16, 185, 129]  as RGB,
    greenDark:  [5,  150, 105]  as RGB,
    greenDeep:  [22, 101, 52]   as RGB,
    greenPale:  [209, 250, 229] as RGB,
    // Red
    red:        [239, 68,  68]  as RGB,
    redDark:    [220, 38,  38]  as RGB,
    redDeep:    [153, 27,  27]  as RGB,
    redPale:    [254, 226, 226] as RGB,
    // Amber
    amber:      [245, 158, 11]  as RGB,
    amberDeep:  [146, 64,  14]  as RGB,
    amberPale:  [254, 243, 199] as RGB,
    // Purple
    purple:     [139, 92,  246] as RGB,
    purplePale: [237, 233, 254] as RGB,
    // Neutrals
    slate50:    [248, 250, 252] as RGB,
    slate100:   [241, 245, 249] as RGB,
    slate200:   [226, 232, 240] as RGB,
    slate400:   [148, 163, 184] as RGB,
    slate500:   [100, 116, 139] as RGB,
    white:      [255, 255, 255] as RGB,
    black:      [0,   0,   0]   as RGB,
};

// Palette for pie/donut slices
const PIE_COLORS: RGB[] = [
    [59,  130, 246], [16,  185, 129], [245, 158, 11],
    [139, 92,  246], [239, 68,  68],  [14,  165, 233],
    [249, 115, 22],  [168, 85,  247], [20,  184, 166],
    [236, 72,  153],
];

export const exportFinancialPDF = (data: PDFExportData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const W  = doc.internal.pageSize.getWidth();   // 210
    const H  = doc.internal.pageSize.getHeight();  // 297
    const M  = 14;
    const CW = W - M * 2;   // content width = 182
    const RESERVE = 25;      // mm — ensures autoTable has room for header + first rows
    let y    = 0;

    const gymName     = data.gymName || 'GymDesk Pro';
    const periodLabel = data.period === 'day' ? 'Daily' : data.period === 'week' ? 'Weekly' : 'Monthly';
    const reportDate  = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const reportTime  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    /* ── Page guard ────────────────────────────────────── */
    const checkPage = (needed: number) => {
        if (y + needed > H - 18) { doc.addPage(); y = 20; }
    };

    /* ── Section header ────────────────────────────────── */
    const sectionHeader = (title: string, subtitle?: string) => {
        checkPage(22);
        // Left accent bar
        doc.setFillColor(...C.blue);
        doc.roundedRect(M, y, 3.5, subtitle ? 13 : 10, 1, 1, 'F');
        // Title
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.navy);
        doc.text(title, M + 8, y + 7);
        if (subtitle) {
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.slate500);
            doc.text(subtitle, M + 8, y + 12);
        }
        y += subtitle ? 17 : 14;
        // Divider
        doc.setDrawColor(...C.slate200);
        doc.setLineWidth(0.25);
        doc.line(M, y - 2, W - M, y - 2);
    };

    /* ── KPI box ────────────────────────────────────────── */
    const drawKPIBox = (
        x: number, bw: number,
        label: string, value: string, sub: string,
        accent: RGB, bg: RGB, accentDark: RGB
    ) => {
        const bh = 30;
        // Card bg
        doc.setFillColor(...bg);
        doc.roundedRect(x, y, bw, bh, 2.5, 2.5, 'F');
        // Top accent strip
        doc.setFillColor(...accent);
        doc.roundedRect(x, y, bw, 3, 1.5, 1.5, 'F');
        doc.rect(x, y + 1.5, bw, 1.5, 'F'); // fill bottom half to make top strip flush
        // Label
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.slate500);
        doc.text(label.toUpperCase(), x + 6, y + 10);
        // Value
        doc.setFontSize(12.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentDark);
        doc.text(value, x + 6, y + 20);
        // Sub
        if (sub) {
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.slate400);
            doc.text(sub, x + 6, y + 26.5);
        }
    };

    /* ── Mini bar chart (horizontal) ────────────────────── */
    const drawHorizBarChart = (
        items: { label: string; value: number; pct: number }[],
        barColor: RGB, bgColor: RGB,
        startX: number, startY: number, chartW: number, rowH: number
    ) => {
        const maxPct = Math.max(...items.map(i => i.pct), 1);
        items.forEach((item, idx) => {
            const iy = startY + idx * rowH;
            // Label
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.navyLight);
            const labelW = chartW * 0.34;
            const truncLabel = doc.splitTextToSize(item.label, labelW)[0];
            doc.text(truncLabel, startX, iy + rowH / 2 + 1.5);
            // Track
            const barStartX = startX + labelW + 2;
            const barAreaW  = chartW * 0.46;
            doc.setFillColor(...bgColor);
            doc.roundedRect(barStartX, iy + rowH / 2 - 2, barAreaW, 4, 1, 1, 'F');
            // Fill
            const fillW = Math.max((barAreaW * item.pct) / maxPct, 2);
            doc.setFillColor(...barColor);
            doc.roundedRect(barStartX, iy + rowH / 2 - 2, fillW, 4, 1, 1, 'F');
            // Pct label on bar
            if (item.pct > 10) {
                doc.setFontSize(5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...C.white);
                doc.text(`${item.pct}%`, barStartX + 3, iy + rowH / 2 + 1.2);
            }
            // Amount right-aligned
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...C.navyMid);
            doc.text(fmt(item.value), startX + chartW, iy + rowH / 2 + 1.5, { align: 'right' });
        });
    };

    /* ── Donut / Pie chart — segmented ring approach ──── */
    // Renders a clean donut using dense fan-triangulation of the annular ring,
    // which works reliably with jsPDF's triangle primitive.
    const drawDonut = (
        items: { label: string; value: number; percentage: number }[],
        cx: number, cy: number, outerR: number, innerR: number
    ) => {
        if (!items.length) return;
        const total = items.reduce((s, i) => s + i.value, 0);
        if (total === 0) return;

        // Add a thin white gap between segments for clean separation
        const gapAngle = items.length > 1 ? 0.04 : 0;

        let angle = -Math.PI / 2; // start at 12 o'clock
        items.forEach((item, idx) => {
            const slice = (item.value / total) * 2 * Math.PI;
            if (slice <= 0) { angle += slice; return; }
            const color = PIE_COLORS[idx % PIE_COLORS.length];
            const startA = angle + gapAngle / 2;
            const endA   = angle + slice - gapAngle / 2;

            // Triangulate the annular sector using N steps
            const STEPS = Math.min(
                Math.max(Math.ceil((endA - startA) / (Math.PI / 30)), 2),
                8
            );
            const da = (endA - startA) / STEPS;

            doc.setFillColor(...color);
            for (let s = 0; s < STEPS; s++) {
                const a1 = startA + s * da;
                const a2 = startA + (s + 1) * da;
                const ox1 = cx + outerR * Math.cos(a1), oy1 = cy + outerR * Math.sin(a1);
                const ox2 = cx + outerR * Math.cos(a2), oy2 = cy + outerR * Math.sin(a2);
                const ix1 = cx + innerR * Math.cos(a1), iy1 = cy + innerR * Math.sin(a1);
                const ix2 = cx + innerR * Math.cos(a2), iy2 = cy + innerR * Math.sin(a2);
                // Fill the trapezoid with two non-overlapping triangles
                doc.triangle(ox1, oy1, ox2, oy2, ix1, iy1, 'F');
                doc.triangle(ox2, oy2, ix2, iy2, ix1, iy1, 'F');
            }
            angle += slice;
        });

        // White donut hole (clean cutout)
        doc.setFillColor(...C.white);
        doc.circle(cx, cy, innerR - 0.3, 'F');

        // Center text: category count
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.navy);
        doc.text(`${items.length}`, cx, cy - 0.5, { align: 'center' });
        doc.setFontSize(4.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.slate500);
        doc.text('categories', cx, cy + 3.5, { align: 'center' });
    };

    /* ── Line / Area sparkline ──────────────────────────── */
    const drawSparkline = (
        points: number[], lineColor: RGB, fillColor: RGB,
        startX: number, startY: number, chartW: number, chartH: number
    ) => {
        if (points.length < 2) return;
        const minV = Math.min(...points);
        const maxV = Math.max(...points, minV + 1);
        const range = maxV - minV;
        const toX = (i: number) => startX + (i / (points.length - 1)) * chartW;
        const toY = (v: number) => startY + chartH - ((v - minV) / range) * chartH;

        // Fill area
        doc.setFillColor(...fillColor);
        const pathPts: number[][] = [[startX, startY + chartH]];
        points.forEach((v, i) => pathPts.push([toX(i), toY(v)]));
        pathPts.push([startX + chartW, startY + chartH]);
        for (let i = 0; i < pathPts.length - 1; i++) {
            doc.triangle(
                pathPts[0][0], pathPts[0][1],
                pathPts[i][0], pathPts[i][1],
                pathPts[i + 1][0], pathPts[i + 1][1],
                'F'
            );
        }
        // Line
        doc.setDrawColor(...lineColor);
        doc.setLineWidth(0.5);
        for (let i = 0; i < points.length - 1; i++) {
            doc.line(toX(i), toY(points[i]), toX(i + 1), toY(points[i + 1]));
        }
    };

    /* ── Grouped bar chart (revenue vs expenses per period) */
    const drawGroupedBars = (
        labels: string[], series1: number[], series2: number[],
        x: number, startY: number, chartW: number, chartH: number
    ) => {
        if (!labels.length) return;
        const maxVal = Math.max(...series1, ...series2, 1);
        const n = labels.length;

        // Y-axis label area on the left
        const yAxisW = 16;
        const plotX  = x + yAxisW;
        const plotW  = chartW - yAxisW;

        // Draw background grid
        doc.setDrawColor(...C.slate200);
        doc.setLineWidth(0.15);
        [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
            const gy = startY + chartH * (1 - pct);
            doc.line(plotX, gy, plotX + plotW, gy);
            if (pct > 0) {
                doc.setFontSize(4.2);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.slate400);
                doc.text(fmt(maxVal * pct), plotX - 1, gy + 1.2, { align: 'right' });
            }
        });

        // Baseline
        doc.setDrawColor(...C.slate400);
        doc.setLineWidth(0.3);
        doc.line(plotX, startY + chartH, plotX + plotW, startY + chartH);

        // Compute bar geometry
        const groupW = plotW / n;
        // Keep bars reasonably wide but not overlapping
        const totalBarW = Math.min(groupW * 0.55, 10);
        const barW      = totalBarW / 2;
        const barGap    = 0.8;

        labels.forEach((label, i) => {
            const cx    = plotX + i * groupW + groupW / 2; // center of group
            const b1x   = cx - barW - barGap / 2;          // revenue bar x
            const b2x   = cx + barGap / 2;                 // expense bar x

            const v1 = series1[i] || 0;
            const v2 = series2[i] || 0;
            const h1 = Math.max((v1 / maxVal) * chartH, 1.5);
            const h2 = Math.max((v2 / maxVal) * chartH, 1.5);

            // Revenue bar (green)
            doc.setFillColor(...C.green);
            doc.roundedRect(b1x, startY + chartH - h1, barW, h1, 0.6, 0.6, 'F');

            // Expense bar (red)
            doc.setFillColor(...C.red);
            doc.roundedRect(b2x, startY + chartH - h2, barW, h2, 0.6, 0.6, 'F');

            // X label — only draw if enough room (avoid crowding)
            const showEvery = Math.ceil(n / 12);
            if (i % showEvery === 0) {
                doc.setFontSize(4.2);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.slate500);
                const maxLabelW = groupW - 2;
                const shortLabel = doc.splitTextToSize(label, maxLabelW)[0] || label.slice(0, 4);
                doc.text(shortLabel, cx, startY + chartH + 4, { align: 'center' });
            }
        });

        // Legend (bottom left of chart)
        const legY = startY + chartH + 8;
        doc.setFillColor(...C.green);
        doc.roundedRect(plotX, legY, 5, 2.5, 0.5, 0.5, 'F');
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.navyLight);
        doc.text('Revenue', plotX + 6.5, legY + 2);

        doc.setFillColor(...C.red);
        doc.roundedRect(plotX + 28, legY, 5, 2.5, 0.5, 0.5, 'F');
        doc.text('Expenses', plotX + 34.5, legY + 2);
    };

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 1 — COVER PAGE                                               */
    /* ══════════════════════════════════════════════════════════════════ */

    // Full-bleed navy background
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, H, 'F');

    // Decorative accent strip (top)
    doc.setFillColor(...C.blue);
    doc.rect(0, 0, W, 6, 'F');

    // Diagonal accent block (top right)
    doc.setFillColor(29, 78, 216);
    doc.triangle(W - 80, 0, W, 0, W, 90, 'F');
    doc.setFillColor(37, 99, 235);
    doc.triangle(W - 50, 0, W, 0, W, 55, 'F');

    // Bottom accent strip
    doc.setFillColor(...C.blue);
    doc.rect(0, H - 6, W, 6, 'F');

    // Decorative bottom left block
    doc.setFillColor(29, 78, 216);
    doc.triangle(0, H, 0, H - 70, 60, H, 'F');

    // ─── Gym name + logo area ───
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.white);
    doc.text(gymName, M, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate400);
    doc.text('FITNESS & WELLNESS CENTER', M, 60);

    // Divider line
    doc.setDrawColor(...C.blue);
    doc.setLineWidth(0.8);
    doc.line(M, 66, M + 80, 66);

    // ─── Report title ───
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.white);
    doc.text(`${periodLabel} Financial Report`, M, 82);

    // Period badge
    const pLabel = `Period: ${periodLabel}  |  ${reportDate}`;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate400);
    doc.text(pLabel, M, 91);

    // ─── KPI summary boxes on cover ───
    const boxW = (CW - 9) / 4;
    const boxY = 108;
    const coverKPIs = [
        { label: 'Total Revenue',   value: fmt(data.stats.totalRevenue),   sub: `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% vs last`,  color: C.green,  bg: [20, 83, 45]  as RGB, dark: C.greenPale },
        { label: 'Total Expenses',  value: fmt(data.stats.totalExpenses),  sub: `${data.stats.expensesChange >= 0 ? '+' : ''}${data.stats.expensesChange}% vs last`, color: C.red,    bg: [127, 29, 29] as RGB, dark: C.redPale   },
        { label: 'Net Profit',      value: fmt(data.stats.netProfit),      sub: `${data.stats.profitMargin}% margin`,                                                color: C.blue,   bg: [30, 58, 138] as RGB, dark: C.bluePale  },
        { label: 'Pending Dues',    value: fmt(data.stats.pendingPayments),sub: `${data.stats.pendingCount} invoices`,                                               color: C.amber,  bg: [120, 53, 15] as RGB, dark: C.amberPale },
    ];
    coverKPIs.forEach((kpi, i) => {
        const bx = M + i * (boxW + 3);
        doc.setFillColor(...kpi.bg);
        doc.roundedRect(bx, boxY, boxW, 34, 3, 3, 'F');
        doc.setFillColor(...kpi.color);
        doc.roundedRect(bx, boxY, boxW, 3, 1.5, 1.5, 'F');
        doc.rect(bx, boxY + 1.5, boxW, 1.5, 'F');
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...kpi.color);
        doc.text(kpi.label.toUpperCase(), bx + 6, boxY + 10);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...kpi.dark);
        doc.text(kpi.value, bx + 6, boxY + 21);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...kpi.color);
        doc.text(kpi.sub, bx + 6, boxY + 29);
    });

    // ─── Profit verdict ───
    const profitY = boxY + 44;
    const isProfit = data.stats.netProfit >= 0;
    const verdictColor = isProfit ? C.green : C.red;
    const verdictBg: RGB = isProfit ? [6, 78, 59] : [127, 29, 29];
    doc.setFillColor(...verdictBg);
    doc.roundedRect(M, profitY, CW, 18, 3, 3, 'F');
    doc.setFillColor(...verdictColor);
    doc.roundedRect(M, profitY, 4, 18, 1.5, 1.5, 'F');
    doc.rect(M + 2, profitY, 2, 18, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...verdictColor);
    doc.text(isProfit ? 'PROFITABLE PERIOD' : 'LOSS PERIOD', M + 10, profitY + 7);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...(isProfit ? C.greenPale : C.redPale));
    doc.text(
        isProfit
            ? `Net profit of ${fmtFull(data.stats.netProfit)} at ${data.stats.profitMargin}% margin — strong financial position.`
            : `Net loss of ${fmtFull(Math.abs(data.stats.netProfit))} — expenses exceed revenue. Immediate review recommended.`,
        M + 10, profitY + 13
    );

    // ─── Transactions summary ───
    const txCount  = data.transactions.length;
    const incCount = data.transactions.filter(t => t.type === 'INCOME').length;
    const expCount = data.transactions.filter(t => t.type === 'EXPENSE').length;
    const sumY = profitY + 26;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate400);
    doc.text(`${txCount} Total Transactions   |   ${incCount} Income   |   ${expCount} Expense   |   ${data.stats.pendingCount} Pending`, M, sumY);

    // ─── Table of contents ───
    const tocY = sumY + 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate400);
    doc.text('REPORT CONTENTS', M, tocY);
    doc.setDrawColor(...C.navyLight);
    doc.setLineWidth(0.2);
    doc.line(M, tocY + 2, M + 60, tocY + 2);

    const sections = [
        '1.  Executive Summary (KPI Cards)',
        '2.  Profit & Loss Statement',
        '3.  Revenue vs Expense Chart',
        '4.  Revenue Sources Breakdown',
        '5.  Expense Breakdown',
        '6.  Category Analysis',
        '7.  Daily Revenue Trend',
        '8.  Pending Collections',
        '9.  Top Transactions',
        '10. Complete Transaction Ledger',
        '11. Financial Insights & Recommendations',
    ];
    sections.forEach((s, i) => {
        doc.setFontSize(7);
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
        doc.setTextColor(...C.slate400);
        doc.text(s, M, tocY + 8 + i * 6);
    });

    // ─── Footer label ───
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate500);
    doc.text('CONFIDENTIAL  |  Internal Use Only', W / 2, H - 12, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${reportDate} at ${reportTime}`, W / 2, H - 7, { align: 'center' });

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 2 — EXECUTIVE SUMMARY + P&L                                  */
    /* ══════════════════════════════════════════════════════════════════ */
    doc.addPage();
    y = 20;

    /* Section 1: KPI Cards */
    sectionHeader('1. Executive Summary', 'Key performance indicators at a glance');

    const kW = (CW - 9) / 4;
    drawKPIBox(M,              kW, 'Total Revenue',  fmtFull(data.stats.totalRevenue),  `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% vs last period`, C.green,  C.greenPale, C.greenDeep);
    drawKPIBox(M + (kW+3),     kW, 'Total Expenses', fmtFull(data.stats.totalExpenses), `${data.stats.expensesChange >= 0 ? '+' : ''}${data.stats.expensesChange}% vs last period`, C.red,    C.redPale,   C.redDeep);
    drawKPIBox(M + (kW+3)*2,   kW, 'Net Profit',     fmtFull(data.stats.netProfit),     `${data.stats.profitMargin}% profit margin`,                                               C.blue,   C.bluePale,  C.blueDark);
    drawKPIBox(M + (kW+3)*3,   kW, 'Pending Dues',   fmtFull(data.stats.pendingPayments),`${data.stats.pendingCount} outstanding invoices`,                                        C.amber,  C.amberPale, C.amberDeep);
    y += 36;

    /* Section 2: P&L Statement */
    sectionHeader('2. Profit & Loss Statement', 'Detailed income and expense breakdown with visual bars');

    const plRows: (string | number)[][] = [];
    plRows.push(['REVENUE', '', '', '']);
    data.revenueBreakdown.forEach(r => {
        plRows.push([`    ${r.label}`, `${r.percentage}%`, fmtFull(r.value), '']);
    });
    plRows.push(['  Total Revenue', '100%', fmtFull(data.stats.totalRevenue), '']);
    plRows.push(['', '', '', '']);
    plRows.push(['EXPENSES', '', '', '']);
    data.expenseBreakdown.forEach(e => {
        plRows.push([`    ${e.label}`, `${e.percentage}%`, fmtFull(e.value), '']);
    });
    plRows.push(['  Total Expenses', '100%', fmtFull(data.stats.totalExpenses), '']);
    plRows.push(['', '', '', '']);
    plRows.push([data.stats.netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS', `${data.stats.profitMargin}%`, fmtFull(data.stats.netProfit), '']);

    const expensesRowIdx = plRows.findIndex(r => r[0] === 'EXPENSES');

    autoTable(doc, {
        startY: y,
        head: [['Category', 'Share', 'Amount', 'Visual']],
        body: plRows,
        margin: { left: M, right: M },
        theme: 'plain',
        pageBreak: 'avoid',
        styles: { fontSize: 7.5, cellPadding: { top: 2.8, bottom: 2.8, left: 4, right: 4 }, textColor: C.navyLight },
        headStyles: { fillColor: C.navyMid, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: CW * 0.37 },
            1: { cellWidth: CW * 0.11, halign: 'center' },
            2: { cellWidth: CW * 0.24, halign: 'right' },
            3: { cellWidth: CW * 0.28 },
        },
        didParseCell: (hd: any) => {
            const txt = String(hd.cell.raw || '');
            if (txt === 'REVENUE' || txt === 'EXPENSES') {
                hd.cell.styles.fontStyle = 'bold';
                hd.cell.styles.fillColor = C.slate100;
                hd.cell.styles.textColor = C.navy;
                hd.cell.styles.fontSize  = 8;
            }
            if (txt.includes('Total Revenue')) {
                hd.cell.styles.fontStyle = 'bold';
                hd.cell.styles.fillColor = C.greenPale;
                hd.cell.styles.textColor = C.greenDeep;
            }
            if (txt.includes('Total Expenses')) {
                hd.cell.styles.fontStyle = 'bold';
                hd.cell.styles.fillColor = C.redPale;
                hd.cell.styles.textColor = C.redDeep;
            }
            if (txt === 'NET PROFIT' || txt === 'NET LOSS') {
                hd.cell.styles.fontStyle = 'bold';
                hd.cell.styles.fontSize  = 9;
                hd.cell.styles.fillColor = data.stats.netProfit >= 0 ? [209, 250, 229] : C.redPale;
                hd.cell.styles.textColor = data.stats.netProfit >= 0 ? C.greenDeep : C.redDeep;
            }
        },
        didDrawCell: (hd: any) => {
            if (hd.column.index !== 3 || hd.section !== 'body') return;
            const rowTxt = String(hd.row.cells[0]?.raw || '').trim();
            if (['REVENUE', 'EXPENSES', '', 'NET PROFIT', 'NET LOSS'].some(s => rowTxt === s) || rowTxt.includes('Total')) return;
            const amtTxt = String(hd.row.cells[2]?.raw || '');
            const amount = parseFloat(amtTxt.replace(/[^0-9.-]/g, '')) || 0;
            const maxAmt = Math.max(data.stats.totalRevenue, data.stats.totalExpenses, 1);
            const pct    = Math.min((amount / maxAmt) * 100, 100);
            const barW   = (hd.cell.width - 8) * (pct / 100);
            const isExp  = hd.row.index > expensesRowIdx;
            if (barW > 0) {
                // Track
                doc.setFillColor(...C.slate200);
                doc.roundedRect(hd.cell.x + 4, hd.cell.y + hd.cell.height / 2 - 2.5, hd.cell.width - 8, 5, 1.5, 1.5, 'F');
                // Fill
                doc.setFillColor(...(isExp ? C.red : C.green));
                doc.roundedRect(hd.cell.x + 4, hd.cell.y + hd.cell.height / 2 - 2.5, Math.max(barW, 2), 5, 1.5, 1.5, 'F');
                if (pct > 12) {
                    doc.setFontSize(5);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...C.white);
                    doc.text(`${pct.toFixed(0)}%`, hd.cell.x + 6, hd.cell.y + hd.cell.height / 2 + 1.2);
                }
            }
        }
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 3 — REVENUE vs EXPENSE CHART + BREAKDOWNS                   */
    /* ══════════════════════════════════════════════════════════════════ */
    doc.addPage();
    y = 20;

    /* Section 3: Revenue vs Expense grouped bar chart */
    sectionHeader('3. Revenue vs Expense — Period Chart', `${periodLabel} comparison with net profit overlay`);

    if (data.dailyTrend && data.dailyTrend.length > 0) {
        const chartH   = 55;
        const chartX   = M + 18;
        const chartW   = CW - 18;
        const chartYst = y;

        // Limit to last 20 data points for readability
        const trendSlice = data.dailyTrend.slice(-20);
        const revSeries  = trendSlice.map(d => d.revenue);
        const expSeries  = trendSlice.map(d => d.expenses);
        const profSeries = trendSlice.map(d => d.profit);
        const labels     = trendSlice.map(d => {
            const dt = new Date(d.date);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
        });

        // Background
        doc.setFillColor(...C.slate50);
        doc.roundedRect(M, chartYst, CW, chartH + 18, 2, 2, 'F');
        doc.setDrawColor(...C.slate200);
        doc.setLineWidth(0.2);
        doc.roundedRect(M, chartYst, CW, chartH + 18, 2, 2, 'S');

        drawGroupedBars(labels, revSeries, expSeries, chartX, chartYst + 6, chartW, chartH);

        // Profit sparkline overlay
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.blue);
        doc.text('Profit trend', chartX + chartW - 20, chartYst + 10);

        const posProfit = profSeries.map(v => Math.max(v, 0));
        drawSparkline(
            posProfit,
            C.blue, [219, 234, 254],
            chartX, chartYst + 6, chartW, chartH
        );

        y += chartH + 24;

        // Stats below chart
        const sW = (CW - 6) / 3;
        const statItems = [
            { label: 'Peak Revenue Day', value: fmt(Math.max(...revSeries)), color: C.green },
            { label: 'Peak Expense Day',  value: fmt(Math.max(...expSeries)), color: C.red   },
            { label: 'Best Profit Day',   value: fmt(Math.max(...profSeries)), color: C.blue  },
        ];
        statItems.forEach((si, i) => {
            const sx = M + i * (sW + 3);
            doc.setFillColor(...C.slate100);
            doc.roundedRect(sx, y, sW, 12, 1.5, 1.5, 'F');
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.slate500);
            doc.text(si.label, sx + 4, y + 5);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...si.color);
            doc.text(si.value, sx + 4, y + 10.5);
        });
        y += 18;
    } else {
        doc.setFontSize(8);
        doc.setTextColor(...C.slate400);
        doc.text('No daily trend data available for this period.', M, y + 8);
        y += 16;
    }

    /* Section 4 & 5: Revenue + Expense breakdowns side by side with donut */
    checkPage(80);
    sectionHeader('4 & 5. Revenue Sources & Expense Breakdown', 'Category distribution with visual charts');

    const halfW = (CW - 6) / 2;

    // ─── Revenue (left panel) ───
    if (data.revenueBreakdown.length > 0) {
        // Panel bg
        doc.setFillColor(...C.slate50);
        doc.roundedRect(M, y, halfW, 70, 2, 2, 'F');
        doc.setDrawColor(...C.greenPale);
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, halfW, 70, 2, 2, 'S');

        // Header
        doc.setFillColor(...C.greenPale);
        doc.roundedRect(M, y, halfW, 9, 1.5, 1.5, 'F');
        doc.rect(M, y + 5, halfW, 4, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.greenDeep);
        doc.text('REVENUE SOURCES', M + 5, y + 6.5);
        doc.text(fmtFull(data.stats.totalRevenue), M + halfW - 5, y + 6.5, { align: 'right' });

        // Donut (right side of panel)
        const donutCX = M + halfW - 18;
        const donutCY = y + 35;
        drawDonut(data.revenueBreakdown, donutCX, donutCY, 13, 7);

        // Bar list (left side of panel)
        drawHorizBarChart(
            data.revenueBreakdown.map(r => ({ label: r.label, value: r.value, pct: r.percentage })),
            C.green, C.greenPale,
            M + 4, y + 13, halfW - 36, 9
        );
    }

    // ─── Expense (right panel) ───
    if (data.expenseBreakdown.length > 0) {
        const px = M + halfW + 6;
        doc.setFillColor(...C.slate50);
        doc.roundedRect(px, y, halfW, 70, 2, 2, 'F');
        doc.setDrawColor(...C.redPale);
        doc.setLineWidth(0.3);
        doc.roundedRect(px, y, halfW, 70, 2, 2, 'S');

        doc.setFillColor(...C.redPale);
        doc.roundedRect(px, y, halfW, 9, 1.5, 1.5, 'F');
        doc.rect(px, y + 5, halfW, 4, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.redDeep);
        doc.text('EXPENSE BREAKDOWN', px + 5, y + 6.5);
        doc.text(fmtFull(data.stats.totalExpenses), px + halfW - 5, y + 6.5, { align: 'right' });

        const donutCX = px + halfW - 18;
        const donutCY = y + 35;
        drawDonut(data.expenseBreakdown, donutCX, donutCY, 13, 7);

        drawHorizBarChart(
            data.expenseBreakdown.map(e => ({ label: e.label, value: e.value, pct: e.percentage })),
            C.red, C.redPale,
            px + 4, y + 13, halfW - 36, 9
        );
    }
    y += 76;

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 4 — CATEGORY ANALYSIS + DAILY TREND TABLE                   */
    /* ══════════════════════════════════════════════════════════════════ */
    doc.addPage();
    y = 20;

    /* Section 6: Category Analysis */
        if (data.categoryIncomeStats && data.categoryIncomeStats.length > 0) {
          sectionHeader('6. Category Analysis', 'Transaction count and volume by category');

          const catRows: (string | number)[][] = [];
          catRows.push(['INCOME CATEGORIES', '', '', '', '']);

          // Recalculate totals from actual category data (guards against stale KPI totals)
          const actualIncomeTotal = data.categoryIncomeStats.reduce((s, c) => s + (c.total || 0), 0);
          const incBase = Math.max(actualIncomeTotal, data.stats.totalRevenue, 1);

          data.categoryIncomeStats.forEach(c => {
              const amt = c.total || 0;
              const pct = incBase > 0 ? Math.min(((amt / incBase) * 100), 100).toFixed(1) : '0';
              catRows.push([`    ${c.category}`, `${c.count}`, fmtFull(amt), `${pct}%`, '']);
          });
          const totalIncTxns = data.categoryIncomeStats.reduce((s, c) => s + c.count, 0);
          catRows.push(['  Income Total', `${totalIncTxns}`, fmtFull(incBase), '100%', '']);
          catRows.push(['', '', '', '', '']);

          const catExpStart = catRows.length;
          if (data.categoryExpenseStats && data.categoryExpenseStats.length > 0) {
              catRows.push(['EXPENSE CATEGORIES', '', '', '', '']);

              const actualExpenseTotal = data.categoryExpenseStats.reduce((s, c) => s + (c.total || 0), 0);
              const expBase = Math.max(actualExpenseTotal, data.stats.totalExpenses, 1);

              data.categoryExpenseStats.forEach(c => {
                  const amt = c.total || 0;
                  const pct = expBase > 0 ? Math.min(((amt / expBase) * 100), 100).toFixed(1) : '0';
                  catRows.push([`    ${c.category}`, `${c.count}`, fmtFull(amt), `${pct}%`, '']);
              });
              const totalExpTxns = data.categoryExpenseStats.reduce((s, c) => s + c.count, 0);
              catRows.push(['  Expense Total', `${totalExpTxns}`, fmtFull(expBase), '100%', '']);
          }

        autoTable(doc, {
            startY: y,
            head: [['Category', 'Txns', 'Amount', 'Share %', 'Weight Bar']],
            body: catRows,
            margin: { left: M, right: M },
            theme: 'plain',
            pageBreak: 'avoid',
            styles: { fontSize: 7.5, cellPadding: 2.8, textColor: C.navyLight },
            headStyles: { fillColor: C.navyMid, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: {
                0: { cellWidth: CW * 0.32 },
                1: { cellWidth: CW * 0.10, halign: 'center' },
                2: { cellWidth: CW * 0.24, halign: 'right' },
                3: { cellWidth: CW * 0.12, halign: 'center' },
                4: { cellWidth: CW * 0.22 },
            },
            didParseCell: (hd: any) => {
                const txt = String(hd.cell.raw || '');
                if (txt === 'INCOME CATEGORIES') {
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fillColor = C.greenPale;
                    hd.cell.styles.textColor = C.greenDeep; hd.cell.styles.fontSize = 8;
                }
                if (txt === 'EXPENSE CATEGORIES') {
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fillColor = C.redPale;
                    hd.cell.styles.textColor = C.redDeep; hd.cell.styles.fontSize = 8;
                }
                if (txt.includes('Income Total') || txt.includes('Expense Total')) {
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fillColor = C.slate100;
                }
            },
            didDrawCell: (hd: any) => {
                if (hd.column.index !== 4 || hd.section !== 'body') return;
                const rowTxt = String(hd.row.cells[0]?.raw || '').trim();
                if (rowTxt.includes('CATEGORIES') || rowTxt === '' || rowTxt.includes('Total')) return;
                  const pctTxt = String(hd.row.cells[3]?.raw || '0');
                  const pct    = Math.min(parseFloat(pctTxt) || 0, 100);
                  const barW   = Math.min(Math.max((hd.cell.width - 8) * (pct / 100), 1), hd.cell.width - 8);
                  const isExp  = hd.row.index >= catExpStart;
                doc.setFillColor(...C.slate200);
                doc.roundedRect(hd.cell.x + 4, hd.cell.y + hd.cell.height / 2 - 2, hd.cell.width - 8, 4, 1, 1, 'F');
                doc.setFillColor(...(isExp ? C.red : C.green));
                doc.roundedRect(hd.cell.x + 4, hd.cell.y + hd.cell.height / 2 - 2, barW, 4, 1, 1, 'F');
            }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    /* Section 7: Daily Trend Table */
    if (data.dailyTrend && data.dailyTrend.length > 0) {
        checkPage(60);
        sectionHeader('7. Daily Revenue Trend', `${data.dailyTrend.length} days tracked — dual bar per row`);

        autoTable(doc, {
            startY: y,
            head: [['Date', 'Revenue', 'Expenses', 'Net Profit', 'Status', 'Trend']],
            body: data.dailyTrend.map(d => {
                const dateStr = new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
                return [dateStr, fmtFull(d.revenue), fmtFull(d.expenses), fmtFull(d.profit), d.profit >= 0 ? 'Profit' : 'Loss', ''];
            }),
            margin: { left: M, right: M },
            theme: 'striped',
            styles: { fontSize: 6.8, cellPadding: 2.5, textColor: C.navyLight },
            headStyles: { fillColor: C.blue, textColor: C.white, fontStyle: 'bold', fontSize: 6.5 },
            alternateRowStyles: { fillColor: C.slate50 },
            columnStyles: {
                0: { cellWidth: CW * 0.18 },
                1: { cellWidth: CW * 0.16, halign: 'right' },
                2: { cellWidth: CW * 0.16, halign: 'right' },
                3: { cellWidth: CW * 0.17, halign: 'right', fontStyle: 'bold' },
                4: { cellWidth: CW * 0.09, halign: 'center' },
                5: { cellWidth: CW * 0.24 },
            },
            didParseCell: (hd: any) => {
                if (hd.section !== 'body') return;
                if (hd.column.index === 3) {
                    const raw = String(hd.cell.raw || '');
                    const num = parseFloat(raw.replace(/[^0-9.-]/g, '')) * (raw.includes('-') || (hd.row.cells[4]?.raw === 'Loss') ? -1 : 1);
                    hd.cell.styles.textColor = num >= 0 ? C.greenDeep : C.redDeep;
                }
                if (hd.column.index === 4) {
                    const val = String(hd.cell.raw || '');
                    hd.cell.styles.textColor = val === 'Profit' ? C.greenDeep : C.redDeep;
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fontSize = 6;
                }
            },
            didDrawCell: (hd: any) => {
                if (hd.column.index !== 5 || hd.section !== 'body') return;
                const item = data.dailyTrend![hd.row.index];
                if (!item) return;
                const maxRev = Math.max(...data.dailyTrend!.map(d => d.revenue), 1);
                const revW = (hd.cell.width - 6) * (item.revenue / maxRev);
                const expW = (hd.cell.width - 6) * (item.expenses / maxRev);
                const bH = 2.5;
                const by = hd.cell.y + hd.cell.height / 2;
                // Track
                doc.setFillColor(...C.slate200);
                doc.roundedRect(hd.cell.x + 3, by - bH - 0.5, hd.cell.width - 6, bH, 0.8, 0.8, 'F');
                doc.roundedRect(hd.cell.x + 3, by + 0.5, hd.cell.width - 6, bH, 0.8, 0.8, 'F');
                // Revenue
                doc.setFillColor(...C.green);
                doc.roundedRect(hd.cell.x + 3, by - bH - 0.5, Math.max(revW, 1), bH, 0.8, 0.8, 'F');
                // Expenses
                doc.setFillColor(...C.red);
                doc.roundedRect(hd.cell.x + 3, by + 0.5, Math.max(expW, 1), bH, 0.8, 0.8, 'F');
            }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 5 — PENDING COLLECTIONS + TOP TRANSACTIONS                   */
    /* ══════════════════════════════════════════════════════════════════ */
    if ((data.pendingTransactions && data.pendingTransactions.length > 0) ||
        (data.topIncomeTransactions && data.topIncomeTransactions.length > 0)) {
        doc.addPage();
        y = 20;
    }

    /* Section 8: Pending Collections */
    if (data.pendingTransactions && data.pendingTransactions.length > 0) {
        sectionHeader('8. Pending Collections', `${data.pendingTransactions.length} unpaid invoices totaling ${fmtFull(data.stats.pendingPayments)}`);

        const now = new Date();
        const critical = data.pendingTransactions.filter(t => (now.getTime() - new Date(t.dateTime).getTime()) / 86400000 > 14);
        const warning  = data.pendingTransactions.filter(t => { const d = (now.getTime() - new Date(t.dateTime).getTime()) / 86400000; return d > 7 && d <= 14; });
        const recent   = data.pendingTransactions.filter(t => (now.getTime() - new Date(t.dateTime).getTime()) / 86400000 <= 7);

        const urgW = (CW - 6) / 3;
        const urgItems = [
            { label: 'CRITICAL  (>14 days)', count: critical.length, amt: critical.reduce((s: number, t: any) => s + (t.amount || 0), 0), c: C.red,   bg: C.redPale,   dark: C.redDeep   },
            { label: 'WARNING  (7-14 days)', count: warning.length,  amt: warning.reduce((s: number, t: any)  => s + (t.amount || 0), 0), c: C.amber, bg: C.amberPale, dark: C.amberDeep },
            { label: 'RECENT  (<7 days)',    count: recent.length,   amt: recent.reduce((s: number, t: any)   => s + (t.amount || 0), 0), c: C.green, bg: C.greenPale, dark: C.greenDeep },
        ];
        urgItems.forEach((u, i) => {
            const ux = M + i * (urgW + 3);
            doc.setFillColor(...u.bg);
            doc.roundedRect(ux, y, urgW, 18, 2, 2, 'F');
            doc.setFillColor(...u.c);
            doc.roundedRect(ux, y, 3, 18, 1.5, 1.5, 'F');
            doc.rect(ux + 1.5, y, 1.5, 18, 'F');
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...u.c);
            doc.text(u.label, ux + 6, y + 6);
            doc.setFontSize(10);
            doc.setTextColor(...u.dark);
            doc.text(`${u.count}`, ux + 6, y + 13);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.slate500);
            doc.text(fmt(u.amt), ux + urgW - 5, y + 13, { align: 'right' });
            doc.setFontSize(6);
            doc.setTextColor(...C.slate400);
            doc.text('invoices', ux + 6 + 8, y + 13);
        });
        y += 24;

        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Due Date', 'Overdue', 'Amount']],
            body: data.pendingTransactions.map((t: any, i: number) => {
                const d    = new Date(t.dateTime);
                const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
                return [`${i + 1}`, t.description || '-', t.category || '-', d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }), `${days}d`, fmtFull(t.amount)];
            }),
            foot: [['', '', '', '', 'TOTAL DUE', fmtFull(data.stats.pendingPayments)]],
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2.8, lineColor: C.slate200, lineWidth: 0.2, textColor: C.navyLight },
            headStyles: { fillColor: C.amber, textColor: C.white, fontStyle: 'bold', fontSize: 6.5 },
            footStyles: { fillColor: C.amberPale, textColor: C.amberDeep, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: CW * 0.28 },
                2: { cellWidth: CW * 0.16 },
                3: { cellWidth: CW * 0.14, halign: 'center' },
                4: { cellWidth: CW * 0.10, halign: 'center' },
                5: { halign: 'right', fontStyle: 'bold' },
            },
            didParseCell: (hd: any) => {
                if (hd.column.index !== 4 || hd.section !== 'body') return;
                const days = parseInt(String(hd.cell.raw || '0'));
                if (days > 14) { hd.cell.styles.textColor = C.redDeep; hd.cell.styles.fontStyle = 'bold'; }
                else if (days > 7) { hd.cell.styles.textColor = C.amberDeep; hd.cell.styles.fontStyle = 'bold'; }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    /* Section 9: Top Income & Expense transactions */
    if (data.topIncomeTransactions && data.topIncomeTransactions.length > 0) {
        checkPage(50);
        sectionHeader('9. Top Income Transactions', 'Highest value income records this period');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Date', 'Amount']],
            body: data.topIncomeTransactions.map((t: any, i: number) => {
                const d = t.dateTime ? new Date(t.dateTime) : null;
                return [`${i + 1}`, t.description || '-', t.category || '-', d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-', fmtFull(t.amount)];
            }),
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: C.slate200, lineWidth: 0.2, textColor: C.navyLight },
            headStyles: { fillColor: C.greenDark, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                4: { halign: 'right', fontStyle: 'bold', textColor: C.greenDeep },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
    }

    if (data.topExpenseTransactions && data.topExpenseTransactions.length > 0) {
        checkPage(50);
        sectionHeader('9b. Top Expense Transactions', 'Highest value expense records this period');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Date', 'Amount']],
            body: data.topExpenseTransactions.map((t: any, i: number) => {
                const d = t.dateTime ? new Date(t.dateTime) : null;
                return [`${i + 1}`, t.description || '-', t.category || '-', d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-', fmtFull(t.amount)];
            }),
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: C.slate200, lineWidth: 0.2, textColor: C.navyLight },
            headStyles: { fillColor: C.redDark, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                4: { halign: 'right', fontStyle: 'bold', textColor: C.redDeep },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    /* ══════════════════════════════════════════════════════════════════ */
    /*  PAGE 6 — FULL TRANSACTION LEDGER                                  */
    /* ══════════════════════════════════════════════════════════════════ */
    doc.addPage();
    y = 20;

    sectionHeader('10. Complete Transaction Ledger', `Full record of all ${data.transactions.length} transactions this period`);

    if (data.transactions.length > 0) {
        // Summary bar
        doc.setFillColor(...C.slate100);
        doc.roundedRect(M, y, CW, 12, 2, 2, 'F');
        const sumItems = [
            { label: 'Total', value: `${data.transactions.length} txns`, color: C.navyMid },
            { label: 'Income', value: `${data.transactions.filter(t => t.type === 'INCOME').length}`, color: C.greenDeep },
            { label: 'Expense', value: `${data.transactions.filter(t => t.type === 'EXPENSE').length}`, color: C.redDeep },
            { label: 'Completed', value: `${data.transactions.filter(t => t.status === 'Completed').length}`, color: C.greenDeep },
            { label: 'Pending', value: `${data.transactions.filter(t => t.status === 'Pending').length}`, color: C.amberDeep },
            { label: 'Revenue', value: fmtFull(data.stats.totalRevenue), color: C.greenDeep },
            { label: 'Expenses', value: fmtFull(data.stats.totalExpenses), color: C.redDeep },
        ];
        const sw = CW / sumItems.length;
        sumItems.forEach((si, i) => {
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.slate500);
            doc.text(si.label, M + i * sw + sw / 2, y + 4, { align: 'center' });
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...si.color);
            doc.text(si.value, M + i * sw + sw / 2, y + 9.5, { align: 'center' });
        });
        y += 16;

        autoTable(doc, {
            startY: y,
            head: [['#', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Status']],
            body: data.transactions.map((t, i) => {
                const d       = t.dateTime ? new Date(t.dateTime) : null;
                const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
                return [`${i + 1}`, dateStr, t.description || '-', t.category || '-', t.type, fmtFull(t.amount), t.status];
            }),
            margin: { left: M, right: M },
            theme: 'striped',
            styles: { fontSize: 6.2, cellPadding: 2, textColor: C.navyLight },
            headStyles: { fillColor: C.navyMid, textColor: C.white, fontStyle: 'bold', fontSize: 6.2 },
            alternateRowStyles: { fillColor: C.slate50 },
            columnStyles: {
                0: { cellWidth: 8,        halign: 'center' },
                1: { cellWidth: 22 },
                2: { cellWidth: CW * 0.24 },
                3: { cellWidth: CW * 0.14 },
                4: { cellWidth: 18,        halign: 'center' },
                5: { halign: 'right',      fontStyle: 'bold' },
                6: { cellWidth: 20,        halign: 'center' },
            },
            didParseCell: (hd: any) => {
                if (hd.section !== 'body') return;
                if (hd.column.index === 4) {
                    const val = String(hd.cell.raw);
                    hd.cell.styles.textColor = val === 'INCOME' ? C.greenDeep : C.redDeep;
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fontSize = 5.5;
                }
                if (hd.column.index === 5) {
                    const typ = String(hd.row.cells[4]?.raw || '');
                    hd.cell.styles.textColor = typ === 'INCOME' ? C.greenDeep : C.redDeep;
                }
                if (hd.column.index === 6) {
                    const val = String(hd.cell.raw);
                    if (val === 'Completed') hd.cell.styles.textColor = C.greenDeep;
                    else if (val === 'Pending') hd.cell.styles.textColor = C.amberDeep;
                    else if (val === 'Failed')  hd.cell.styles.textColor = C.redDeep;
                    hd.cell.styles.fontStyle = 'bold'; hd.cell.styles.fontSize = 5.5;
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    /* ══════════════════════════════════════════════════════════════════ */
    /*  LAST PAGE — FINANCIAL INSIGHTS & RECOMMENDATIONS                  */
    /* ══════════════════════════════════════════════════════════════════ */
    checkPage(80);
    sectionHeader('11. Financial Insights & Recommendations', 'Auto-generated analysis of your financial health');

    const insights: Array<{ text: string; type: 'good' | 'bad' | 'info' }> = [];

    if (data.stats.profitMargin > 20) {
        insights.push({ type: 'good', text: `Strong profitability: Operating at ${data.stats.profitMargin}% profit margin with ${fmtFull(data.stats.netProfit)} net profit — excellent financial health.` });
    } else if (data.stats.profitMargin > 0) {
        insights.push({ type: 'info', text: `Moderate profitability: ${data.stats.profitMargin}% margin. Consider optimizing expense categories to push profitability above 20%.` });
    } else {
        insights.push({ type: 'bad', text: `Warning: Operating at a ${Math.abs(data.stats.profitMargin)}% loss. Expenses exceed revenue by ${fmtFull(Math.abs(data.stats.netProfit))}. Immediate action required.` });
    }

    if (data.stats.revenueChange > 10) {
        insights.push({ type: 'good', text: `Revenue is growing at ${data.stats.revenueChange}% vs the previous period — strong positive trend. Momentum should be maintained.` });
    } else if (data.stats.revenueChange < -5) {
        insights.push({ type: 'bad', text: `Revenue declined ${Math.abs(data.stats.revenueChange)}% vs previous period. Consider targeted promotions, member retention campaigns, or new service offerings.` });
    } else {
        insights.push({ type: 'info', text: `Revenue is stable (${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% change). Look for opportunities to accelerate growth through new programs or upsells.` });
    }

    if (data.stats.pendingPayments > 0) {
        const pendingPct = data.stats.totalRevenue > 0 ? Math.round((data.stats.pendingPayments / data.stats.totalRevenue) * 100) : 0;
        insights.push({ type: pendingPct > 20 ? 'bad' : 'info', text: `Pending collections: ${fmtFull(data.stats.pendingPayments)} (${pendingPct}% of revenue) from ${data.stats.pendingCount} invoices. Prioritize follow-up on overdue accounts.` });
    } else {
        insights.push({ type: 'good', text: `Outstanding collections: Zero pending dues. Perfect collection efficiency — all payments received on time.` });
    }

    const expRatio = data.stats.totalRevenue > 0 ? Math.round((data.stats.totalExpenses / data.stats.totalRevenue) * 100) : 0;
    insights.push({
        type: expRatio > 80 ? 'bad' : expRatio < 50 ? 'good' : 'info',
        text: `Expense-to-revenue ratio: ${expRatio}%. ${expRatio > 80 ? 'High — review all spending categories and identify areas to reduce costs.' : expRatio < 50 ? 'Well-controlled — operating efficiently with strong margin retention.' : 'Moderate — monitor and target <60% for improved profitability.'}`
    });

    if (data.revenueBreakdown.length > 0) {
        insights.push({ type: 'info', text: `Top revenue source: "${data.revenueBreakdown[0].label}" contributes ${data.revenueBreakdown[0].percentage}% (${fmtFull(data.revenueBreakdown[0].value)}) of total income. Diversification is recommended if >50%.` });
    }
    if (data.expenseBreakdown.length > 0) {
        insights.push({ type: 'info', text: `Largest expense category: "${data.expenseBreakdown[0].label}" at ${data.expenseBreakdown[0].percentage}% (${fmtFull(data.expenseBreakdown[0].value)}) of total spend. Evaluate ROI of this category.` });
    }

    // Score card
    const score = Math.min(100, Math.max(0,
        (data.stats.profitMargin > 0 ? 30 : 0) +
        (data.stats.revenueChange > 0 ? 20 : 0) +
        (data.stats.pendingCount === 0 ? 20 : data.stats.pendingCount < 5 ? 10 : 0) +
        (expRatio < 60 ? 20 : expRatio < 80 ? 10 : 0) +
        (data.stats.profitMargin > 20 ? 10 : 0)
    ));
    const scoreColor: RGB = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;
    const scoreBg: RGB    = score >= 70 ? C.greenPale : score >= 40 ? C.amberPale : C.redPale;
    const scoreLabel      = score >= 70 ? 'HEALTHY' : score >= 40 ? 'MODERATE' : 'AT RISK';

    checkPage(20);
    doc.setFillColor(...scoreBg);
    doc.roundedRect(M, y, CW, 18, 2.5, 2.5, 'F');
    doc.setFillColor(...scoreColor);
    doc.roundedRect(M, y, 4, 18, 2, 2, 'F');
    doc.rect(M + 2, y, 2, 18, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...scoreColor);
    doc.text('FINANCIAL HEALTH SCORE', M + 10, y + 7);
    doc.setFontSize(16);
    doc.setTextColor(...scoreColor);
    doc.text(`${score}/100`, M + 10, y + 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...scoreColor);
    doc.text(scoreLabel, M + 42, y + 15);

    // Score bar
    const sbX = M + 70;
    const sbW = CW - 70 - 10;
    doc.setFillColor(...C.slate200);
    doc.roundedRect(sbX, y + 7, sbW, 6, 2, 2, 'F');
    doc.setFillColor(...scoreColor);
    doc.roundedRect(sbX, y + 7, (sbW * score) / 100, 6, 2, 2, 'F');
    y += 24;

    // Individual insights
    insights.forEach(ins => {
        checkPage(16);
        const dotColor: RGB = ins.type === 'good' ? C.green : ins.type === 'bad' ? C.red : C.blue;
        const bgColor: RGB  = ins.type === 'good' ? C.greenPale : ins.type === 'bad' ? C.redPale : C.bluePale;
        const iconLabel     = ins.type === 'good' ? '+' : ins.type === 'bad' ? '!' : 'i';

        doc.setFillColor(...bgColor);
        doc.roundedRect(M, y, CW, 14, 1.5, 1.5, 'F');
        // Icon circle
        doc.setFillColor(...dotColor);
        doc.circle(M + 6, y + 7, 3.5, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.white);
        doc.text(iconLabel, M + 6, y + 9, { align: 'center' });
        // Text
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.navyLight);
        const lines = doc.splitTextToSize(ins.text, CW - 16);
        doc.text(lines, M + 13, y + 5.5);
        y += lines.length > 1 ? 18 : 14;
    });

    /* Disclaimer */
    checkPage(16);
    y += 4;
    doc.setFillColor(...C.slate100);
    doc.roundedRect(M, y, CW, 12, 1.5, 1.5, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...C.slate400);
    doc.text('DISCLAIMER: This report is auto-generated from transactional data and is intended for internal use only. All figures are in Indian Rupees (INR).', M + 4, y + 4.5);
    doc.text('Please verify with official accounts before making business decisions. Report generated by GymDesk Pro financial management system.', M + 4, y + 9);

    /* ══════════════════════════════════════════════════════════════════ */
    /*  FOOTER ON EVERY PAGE                                              */
    /* ══════════════════════════════════════════════════════════════════ */
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pH = doc.internal.pageSize.getHeight();

        if (i === 1) {
            // Cover page footer already drawn — skip
            continue;
        }

        // Footer bar
        doc.setFillColor(...C.navyMid);
        doc.rect(0, pH - 11, W, 11, 'F');
        doc.setFillColor(...C.blue);
        doc.rect(0, pH - 11, W, 1.2, 'F');

        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.slate400);
        doc.text(`${gymName}  |  ${periodLabel} Financial Report  |  ${reportDate}`, M, pH - 4.5);
        doc.text(`Page ${i} of ${totalPages}`, W - M, pH - 4.5, { align: 'right' });

        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.slate500);
        doc.text('CONFIDENTIAL', W / 2, pH - 4.5, { align: 'center' });

        // Top rule (page 2+)
        doc.setDrawColor(...C.blue);
        doc.setLineWidth(0.4);
        doc.line(0, 0, W, 0);
    }

    const dateSlug = new Date().toISOString().split('T')[0];
    doc.save(`${gymName.replace(/\s+/g, '_')}_Financial_Report_${periodLabel}_${dateSlug}.pdf`);
};
