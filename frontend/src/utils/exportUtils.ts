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

/* Helpers */
const fmt = (val: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(val);

type RGB = [number, number, number];
const BRAND = {
    primary: [15, 23, 42] as RGB,
    accent: [59, 130, 246] as RGB,
    emerald: [16, 185, 129] as RGB,
    red: [239, 68, 68] as RGB,
    amber: [245, 158, 11] as RGB,
    slate100: [241, 245, 249] as RGB,
    slate50: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    dark: [30, 41, 59] as RGB,
    text: [51, 65, 85] as RGB,
    textLight: [100, 116, 139] as RGB,
    emeraldBg: [240, 253, 244] as RGB,
    redBg: [254, 242, 242] as RGB,
    amberBg: [255, 251, 235] as RGB,
    blueBg: [239, 246, 255] as RGB
};

export const exportFinancialPDF = (data: PDFExportData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 14;
    const CW = W - M * 2;
    let y = 0;

    const gymName = data.gymName || 'GymDesk Pro';
    const periodLabel = data.period === 'day' ? 'Daily' : data.period === 'week' ? 'Weekly' : 'Monthly';
    const reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const reportTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const checkPage = (needed: number) => {
        if (y + needed > H - 20) { doc.addPage(); y = 16; }
    };

    const sectionHeader = (title: string, subtitle?: string) => {
        checkPage(20);
        doc.setFillColor(...BRAND.accent);
        doc.rect(M, y, 3, 12, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.primary);
        doc.text(title, M + 7, y + 5);
        if (subtitle) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...BRAND.textLight);
            doc.text(subtitle, M + 7, y + 10);
        }
        y += 16;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(M, y - 2, W - M, y - 2);
    };

    const drawKPIBox = (x: number, w: number, label: string, value: string, change: string, accentColor: RGB, bgColor: RGB) => {
        doc.setFillColor(...bgColor);
        doc.roundedRect(x, y, w, 28, 2, 2, 'F');
        doc.setFillColor(...accentColor);
        doc.rect(x, y, 2.5, 28, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.textLight);
        doc.text(label.toUpperCase(), x + 7, y + 7);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.primary);
        doc.text(value, x + 7, y + 17);
        if (change) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentColor);
            doc.text(change, x + 7, y + 24);
        }
    };

    /* ═══════════════════════════════════════════════════ */
    /*  HEADER                                            */
    /* ═══════════════════════════════════════════════════ */
    doc.setFillColor(...BRAND.primary);
    doc.rect(0, 0, W, 48, 'F');
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, W, 6, 'F');

    doc.setTextColor(...BRAND.white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(gymName, M, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`${periodLabel} Financial Report`, M, 28);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${reportDate} at ${reportTime}`, M, 35);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', M, 43);

    const netLabel = data.stats.netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS';
    const netColor = data.stats.netProfit >= 0 ? BRAND.emerald : BRAND.red;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text(netLabel, W - M, 16, { align: 'right' });
    doc.setFontSize(18);
    doc.setTextColor(...netColor);
    doc.text(fmt(data.stats.netProfit), W - M, 28, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${data.stats.profitMargin}% margin`, W - M, 35, { align: 'right' });

    const txCount = data.transactions.length;
    const incCount = data.transactions.filter(t => t.type === 'INCOME').length;
    const expCount = data.transactions.filter(t => t.type === 'EXPENSE').length;
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${txCount} transactions (${incCount} income, ${expCount} expense)`, W - M, 43, { align: 'right' });

    y = 56;

    /* ═══════════════════════════════════════════════════ */
    /*  KPI SUMMARY                                       */
    /* ═══════════════════════════════════════════════════ */
    sectionHeader('Executive Summary', 'Key performance indicators for this period');

    const boxW = (CW - 9) / 4;
    drawKPIBox(M, boxW, 'Total Revenue', fmt(data.stats.totalRevenue), `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% vs last`, BRAND.emerald, BRAND.emeraldBg);
    drawKPIBox(M + boxW + 3, boxW, 'Total Expenses', fmt(data.stats.totalExpenses), `${data.stats.expensesChange >= 0 ? '+' : ''}${data.stats.expensesChange}% vs last`, BRAND.red, BRAND.redBg);
    drawKPIBox(M + (boxW + 3) * 2, boxW, 'Net Profit', fmt(data.stats.netProfit), `${data.stats.profitMargin}% margin`, BRAND.accent, BRAND.blueBg);
    drawKPIBox(M + (boxW + 3) * 3, boxW, 'Pending Dues', fmt(data.stats.pendingPayments), `${data.stats.pendingCount} invoices`, BRAND.amber, BRAND.amberBg);
    y += 34;

    /* ═══════════════════════════════════════════════════ */
    /*  P&L STATEMENT                                     */
    /* ═══════════════════════════════════════════════════ */
    sectionHeader('Profit & Loss Statement', 'Detailed income and expense breakdown');

    const plRows: (string | number)[][] = [];
    plRows.push(['REVENUE', '', '', '']);
    data.revenueBreakdown.forEach(r => {
        plRows.push([`    ${r.label}`, `${r.percentage}%`, fmt(r.value), '']);
    });
    plRows.push(['  Total Revenue', '100%', fmt(data.stats.totalRevenue), '']);
    plRows.push(['', '', '', '']);
    plRows.push(['EXPENSES', '', '', '']);
    data.expenseBreakdown.forEach(e => {
        plRows.push([`    ${e.label}`, `${e.percentage}%`, fmt(e.value), '']);
    });
    plRows.push(['  Total Expenses', '100%', fmt(data.stats.totalExpenses), '']);
    plRows.push(['', '', '', '']);
    plRows.push([data.stats.netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS', `${data.stats.profitMargin}%`, fmt(data.stats.netProfit), '']);

    const expensesRowIdx = plRows.findIndex(r => r[0] === 'EXPENSES');

    autoTable(doc, {
        startY: y,
        head: [['Category', 'Share', 'Amount', 'Visual']],
        body: plRows,
        margin: { left: M, right: M },
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 }, textColor: BRAND.text },
        headStyles: { fillColor: BRAND.slate100, textColor: BRAND.dark, fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: CW * 0.38 },
            1: { cellWidth: CW * 0.12, halign: 'center' },
            2: { cellWidth: CW * 0.22, halign: 'right' },
            3: { cellWidth: CW * 0.28 },
        },
        didParseCell: (hookData: any) => {
            const text = String(hookData.cell.raw || '');
            if (text === 'REVENUE' || text === 'EXPENSES') {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fillColor = BRAND.slate50;
                hookData.cell.styles.textColor = BRAND.primary;
                hookData.cell.styles.fontSize = 8;
            }
            if (text.includes('Total Revenue')) {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fillColor = BRAND.emeraldBg;
                hookData.cell.styles.textColor = [22, 101, 52];
            }
            if (text.includes('Total Expenses')) {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fillColor = BRAND.redBg;
                hookData.cell.styles.textColor = [153, 27, 27];
            }
            if (text === 'NET PROFIT' || text === 'NET LOSS') {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fontSize = 9;
                hookData.cell.styles.fillColor = data.stats.netProfit >= 0 ? [220, 252, 231] : [254, 226, 226];
                hookData.cell.styles.textColor = data.stats.netProfit >= 0 ? [5, 46, 22] : [127, 29, 29];
            }
        },
        didDrawCell: (hookData: any) => {
            if (hookData.column.index === 3 && hookData.section === 'body') {
                const rowText = String(hookData.row.cells[0]?.raw || '').trim();
                if (rowText.includes('REVENUE') || rowText.includes('EXPENSES') || rowText === '' || rowText.includes('Total') || rowText.includes('NET')) return;
                const amountText = String(hookData.row.cells[2]?.raw || '');
                const amount = parseFloat(amountText.replace(/[^0-9.-]/g, '')) || 0;
                const maxAmount = Math.max(data.stats.totalRevenue, data.stats.totalExpenses, 1);
                const pct = Math.min((amount / maxAmount) * 100, 100);
                const barW = (hookData.cell.width - 8) * (pct / 100);
                const isExpense = hookData.row.index > expensesRowIdx;
                if (barW > 0) {
                    doc.setFillColor(...(isExpense ? BRAND.red : BRAND.emerald));
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2, Math.max(barW, 2), 4, 1, 1, 'F');
                }
            }
        }
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    /* ═══════════════════════════════════════════════════ */
    /*  REVENUE SOURCES                                   */
    /* ═══════════════════════════════════════════════════ */
    if (data.revenueBreakdown.length > 0) {
        checkPage(60);
        sectionHeader('Revenue Sources', `${data.revenueBreakdown.length} categories generating ${fmt(data.stats.totalRevenue)}`);

        autoTable(doc, {
            startY: y,
            head: [['#', 'Source', 'Amount', 'Share', 'Distribution']],
            body: data.revenueBreakdown.map((r, i) => [`${i + 1}`, r.label, fmt(r.value), `${r.percentage}%`, '']),
            foot: [['', 'Total', fmt(data.stats.totalRevenue), '100%', '']],
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2, textColor: BRAND.text },
            headStyles: { fillColor: [5, 150, 105], textColor: BRAND.white, fontStyle: 'bold', fontSize: 7 },
            footStyles: { fillColor: BRAND.emeraldBg, textColor: [22, 101, 52], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: CW * 0.28 },
                2: { cellWidth: CW * 0.22, halign: 'right', fontStyle: 'bold' },
                3: { cellWidth: CW * 0.12, halign: 'center' },
                4: { cellWidth: CW - 10 - CW * 0.28 - CW * 0.22 - CW * 0.12 },
            },
            didDrawCell: (hookData: any) => {
                if (hookData.column.index === 4 && hookData.section === 'body') {
                    const pct = data.revenueBreakdown[hookData.row.index]?.percentage || 0;
                    const barWidth = Math.max((hookData.cell.width - 8) * (pct / 100), 2);
                    doc.setFillColor(226, 232, 240);
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2.5, hookData.cell.width - 8, 5, 1.5, 1.5, 'F');
                    doc.setFillColor(16, 185, 129);
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2.5, barWidth, 5, 1.5, 1.5, 'F');
                    if (pct > 15) {
                        doc.setFontSize(5.5);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(255, 255, 255);
                        doc.text(`${pct}%`, hookData.cell.x + 6, hookData.cell.y + hookData.cell.height / 2 + 1);
                    }
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  EXPENSE BREAKDOWN                                 */
    /* ═══════════════════════════════════════════════════ */
    if (data.expenseBreakdown.length > 0) {
        checkPage(60);
        sectionHeader('Expense Breakdown', `${data.expenseBreakdown.length} categories totaling ${fmt(data.stats.totalExpenses)}`);

        autoTable(doc, {
            startY: y,
            head: [['#', 'Category', 'Amount', 'Share', 'Distribution']],
            body: data.expenseBreakdown.map((e, i) => [`${i + 1}`, e.label, fmt(e.value), `${e.percentage}%`, '']),
            foot: [['', 'Total', fmt(data.stats.totalExpenses), '100%', '']],
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2, textColor: BRAND.text },
            headStyles: { fillColor: [220, 38, 38], textColor: BRAND.white, fontStyle: 'bold', fontSize: 7 },
            footStyles: { fillColor: BRAND.redBg, textColor: [153, 27, 27], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: CW * 0.28 },
                2: { cellWidth: CW * 0.22, halign: 'right', fontStyle: 'bold' },
                3: { cellWidth: CW * 0.12, halign: 'center' },
                4: { cellWidth: CW - 10 - CW * 0.28 - CW * 0.22 - CW * 0.12 },
            },
            didDrawCell: (hookData: any) => {
                if (hookData.column.index === 4 && hookData.section === 'body') {
                    const pct = data.expenseBreakdown[hookData.row.index]?.percentage || 0;
                    const barWidth = Math.max((hookData.cell.width - 8) * (pct / 100), 2);
                    doc.setFillColor(226, 232, 240);
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2.5, hookData.cell.width - 8, 5, 1.5, 1.5, 'F');
                    doc.setFillColor(239, 68, 68);
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2.5, barWidth, 5, 1.5, 1.5, 'F');
                    if (pct > 15) {
                        doc.setFontSize(5.5);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(255, 255, 255);
                        doc.text(`${pct}%`, hookData.cell.x + 6, hookData.cell.y + hookData.cell.height / 2 + 1);
                    }
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  CATEGORY ANALYSIS                                 */
    /* ═══════════════════════════════════════════════════ */
    if (data.categoryIncomeStats && data.categoryIncomeStats.length > 0) {
        checkPage(60);
        sectionHeader('Category Analysis', 'Transaction count and volume by category');

        const catRows: (string | number)[][] = [];
        catRows.push(['INCOME CATEGORIES', '', '', '', '']);
        data.categoryIncomeStats.forEach((c) => {
            const pct = data.stats.totalRevenue > 0 ? ((c.total / data.stats.totalRevenue) * 100).toFixed(1) : '0';
            catRows.push([`    ${c.category}`, `${c.count}`, fmt(c.total), `${pct}%`, '']);
        });
        const totalIncTxns = data.categoryIncomeStats.reduce((s, c) => s + c.count, 0);
        catRows.push(['  Income Total', `${totalIncTxns}`, fmt(data.stats.totalRevenue), '100%', '']);
        catRows.push(['', '', '', '', '']);

        const catExpenseStart = catRows.length;
        if (data.categoryExpenseStats && data.categoryExpenseStats.length > 0) {
            catRows.push(['EXPENSE CATEGORIES', '', '', '', '']);
            data.categoryExpenseStats.forEach((c) => {
                const pct = data.stats.totalExpenses > 0 ? ((c.total / data.stats.totalExpenses) * 100).toFixed(1) : '0';
                catRows.push([`    ${c.category}`, `${c.count}`, fmt(c.total), `${pct}%`, '']);
            });
            const totalExpTxns = data.categoryExpenseStats.reduce((s, c) => s + c.count, 0);
            catRows.push(['  Expense Total', `${totalExpTxns}`, fmt(data.stats.totalExpenses), '100%', '']);
        }

        autoTable(doc, {
            startY: y,
            head: [['Category', 'Txns', 'Amount', 'Share', 'Weight']],
            body: catRows,
            margin: { left: M, right: M },
            theme: 'plain',
            styles: { fontSize: 7.5, cellPadding: 2.5, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: {
                0: { cellWidth: CW * 0.32 },
                1: { cellWidth: CW * 0.10, halign: 'center' },
                2: { cellWidth: CW * 0.22, halign: 'right' },
                3: { cellWidth: CW * 0.12, halign: 'center' },
                4: { cellWidth: CW * 0.24 },
            },
            didParseCell: (hookData: any) => {
                const text = String(hookData.cell.raw || '');
                if (text === 'INCOME CATEGORIES') {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = BRAND.emeraldBg;
                    hookData.cell.styles.textColor = [5, 46, 22];
                    hookData.cell.styles.fontSize = 8;
                }
                if (text === 'EXPENSE CATEGORIES') {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = BRAND.redBg;
                    hookData.cell.styles.textColor = [127, 29, 29];
                    hookData.cell.styles.fontSize = 8;
                }
                if (text.includes('Income Total') || text.includes('Expense Total')) {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = BRAND.slate100;
                }
            },
            didDrawCell: (hookData: any) => {
                if (hookData.column.index === 4 && hookData.section === 'body') {
                    const rowText = String(hookData.row.cells[0]?.raw || '').trim();
                    if (rowText.includes('CATEGORIES') || rowText === '' || rowText.includes('Total')) return;
                    const pctText = String(hookData.row.cells[3]?.raw || '0');
                    const pct = parseFloat(pctText) || 0;
                    const barW = Math.max((hookData.cell.width - 8) * (pct / 100), 1);
                    const isExp = hookData.row.index >= catExpenseStart;
                    doc.setFillColor(226, 232, 240);
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2, hookData.cell.width - 8, 4, 1, 1, 'F');
                    doc.setFillColor(...(isExp ? BRAND.red : BRAND.emerald));
                    doc.roundedRect(hookData.cell.x + 4, hookData.cell.y + hookData.cell.height / 2 - 2, barW, 4, 1, 1, 'F');
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  DAILY REVENUE TREND                               */
    /* ═══════════════════════════════════════════════════ */
    if (data.dailyTrend && data.dailyTrend.length > 0) {
        checkPage(60);
        sectionHeader('Daily Revenue Trend', `${data.dailyTrend.length} days tracked this period`);

        autoTable(doc, {
            startY: y,
            head: [['Date', 'Revenue', 'Expenses', 'Profit/Loss', 'Status', 'Bar']],
            body: data.dailyTrend.map(d => {
                const dateStr = new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
                return [dateStr, fmt(d.revenue), fmt(d.expenses), fmt(d.profit), d.profit >= 0 ? 'Profit' : 'Loss', ''];
            }),
            margin: { left: M, right: M },
            theme: 'striped',
            styles: { fontSize: 7, cellPadding: 2.5, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.accent, textColor: BRAND.white, fontStyle: 'bold', fontSize: 6.5 },
            alternateRowStyles: { fillColor: BRAND.slate50 },
            columnStyles: {
                0: { cellWidth: CW * 0.18 },
                1: { cellWidth: CW * 0.16, halign: 'right' },
                2: { cellWidth: CW * 0.16, halign: 'right' },
                3: { cellWidth: CW * 0.16, halign: 'right', fontStyle: 'bold' },
                4: { cellWidth: CW * 0.10, halign: 'center' },
                5: { cellWidth: CW * 0.24 },
            },
            didParseCell: (hookData: any) => {
                if (hookData.section !== 'body') return;
                if (hookData.column.index === 3) {
                    const val = String(hookData.cell.raw || '');
                    const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
                    hookData.cell.styles.textColor = num >= 0 ? [22, 101, 52] : [153, 27, 27];
                }
                if (hookData.column.index === 4) {
                    const val = String(hookData.cell.raw || '');
                    hookData.cell.styles.textColor = val === 'Profit' ? [22, 101, 52] : [153, 27, 27];
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fontSize = 6;
                }
            },
            didDrawCell: (hookData: any) => {
                if (hookData.column.index === 5 && hookData.section === 'body') {
                    const trendItem = data.dailyTrend![hookData.row.index];
                    if (!trendItem) return;
                    const maxRev = Math.max(...data.dailyTrend!.map(d => d.revenue), 1);
                    const revW = (hookData.cell.width - 6) * (trendItem.revenue / maxRev);
                    const expW = (hookData.cell.width - 6) * (trendItem.expenses / maxRev);
                    const barH = 2.5;
                    const baseY = hookData.cell.y + hookData.cell.height / 2;
                    if (revW > 0) {
                        doc.setFillColor(16, 185, 129);
                        doc.roundedRect(hookData.cell.x + 3, baseY - barH - 0.5, Math.max(revW, 1), barH, 0.8, 0.8, 'F');
                    }
                    if (expW > 0) {
                        doc.setFillColor(239, 68, 68);
                        doc.roundedRect(hookData.cell.x + 3, baseY + 0.5, Math.max(expW, 1), barH, 0.8, 0.8, 'F');
                    }
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  PENDING COLLECTIONS                               */
    /* ═══════════════════════════════════════════════════ */
    if (data.pendingTransactions && data.pendingTransactions.length > 0) {
        checkPage(50);
        sectionHeader('Pending Collections', `${data.pendingTransactions.length} unpaid invoices totaling ${fmt(data.stats.pendingPayments)}`);

        const now = new Date();
        const critical = data.pendingTransactions.filter(t => (now.getTime() - new Date(t.dateTime).getTime()) / 86400000 > 14);
        const warning = data.pendingTransactions.filter(t => { const d = (now.getTime() - new Date(t.dateTime).getTime()) / 86400000; return d > 7 && d <= 14; });
        const recent = data.pendingTransactions.filter(t => (now.getTime() - new Date(t.dateTime).getTime()) / 86400000 <= 7);

        const urgBoxW = (CW - 6) / 3;
        const urgData = [
            { label: 'CRITICAL (>14d)', count: critical.length, amount: critical.reduce((s: number, t: any) => s + (t.amount || 0), 0), color: BRAND.red, bg: BRAND.redBg },
            { label: 'WARNING (7-14d)', count: warning.length, amount: warning.reduce((s: number, t: any) => s + (t.amount || 0), 0), color: BRAND.amber, bg: BRAND.amberBg },
            { label: 'RECENT (<7d)', count: recent.length, amount: recent.reduce((s: number, t: any) => s + (t.amount || 0), 0), color: BRAND.emerald, bg: BRAND.emeraldBg },
        ];

        urgData.forEach((u, i) => {
            const x = M + i * (urgBoxW + 3);
            doc.setFillColor(...u.bg);
            doc.roundedRect(x, y, urgBoxW, 16, 1.5, 1.5, 'F');
            doc.setFillColor(...u.color);
            doc.rect(x, y, 2, 16, 'F');
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...u.color);
            doc.text(u.label, x + 5, y + 5);
            doc.setFontSize(9);
            doc.setTextColor(...BRAND.primary);
            doc.text(`${u.count} invoices`, x + 5, y + 11);
            doc.setFontSize(7);
            doc.setTextColor(...BRAND.textLight);
            doc.text(fmt(u.amount), x + urgBoxW - 4, y + 11, { align: 'right' });
        });
        y += 22;

        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Date', 'Overdue', 'Amount']],
            body: data.pendingTransactions.map((t: any, i: number) => {
                const d = new Date(t.dateTime);
                const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
                return [`${i + 1}`, t.description || '-', t.category || '-', d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), `${days}d`, fmt(t.amount)];
            }),
            foot: [['', '', '', '', 'Total', fmt(data.stats.pendingPayments)]],
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2.5, lineColor: [226, 232, 240], lineWidth: 0.2, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.amber, textColor: BRAND.white, fontStyle: 'bold', fontSize: 6.5 },
            footStyles: { fillColor: BRAND.amberBg, textColor: [146, 64, 14], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: CW * 0.28 },
                2: { cellWidth: CW * 0.16 },
                3: { cellWidth: CW * 0.14, halign: 'center' },
                4: { cellWidth: CW * 0.14, halign: 'center' },
                5: { halign: 'right', fontStyle: 'bold' },
            },
            didParseCell: (hookData: any) => {
                if (hookData.column.index === 4 && hookData.section === 'body') {
                    const days = parseInt(String(hookData.cell.raw || '0'));
                    if (days > 14) { hookData.cell.styles.textColor = [153, 27, 27]; hookData.cell.styles.fontStyle = 'bold'; }
                    else if (days > 7) { hookData.cell.styles.textColor = [146, 64, 14]; hookData.cell.styles.fontStyle = 'bold'; }
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  TOP TRANSACTIONS                                  */
    /* ═══════════════════════════════════════════════════ */
    if (data.topIncomeTransactions && data.topIncomeTransactions.length > 0) {
        checkPage(50);
        sectionHeader('Top Income Transactions', 'Highest value income records this period');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Date', 'Amount']],
            body: data.topIncomeTransactions.map((t: any, i: number) => {
                const d = t.dateTime ? new Date(t.dateTime) : null;
                return [`${i + 1}`, t.description || '-', t.category || '-', d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-', fmt(t.amount)];
            }),
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.emerald, textColor: BRAND.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold', textColor: [22, 101, 52] } },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
    }

    if (data.topExpenseTransactions && data.topExpenseTransactions.length > 0) {
        checkPage(50);
        sectionHeader('Top Expense Transactions', 'Highest value expense records this period');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Description', 'Category', 'Date', 'Amount']],
            body: data.topExpenseTransactions.map((t: any, i: number) => {
                const d = t.dateTime ? new Date(t.dateTime) : null;
                return [`${i + 1}`, t.description || '-', t.category || '-', d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-', fmt(t.amount)];
            }),
            margin: { left: M, right: M },
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.red, textColor: BRAND.white, fontStyle: 'bold', fontSize: 7 },
            columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold', textColor: [153, 27, 27] } },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  TRANSACTION LEDGER                                */
    /* ═══════════════════════════════════════════════════ */
    checkPage(40);
    sectionHeader('Transaction Ledger', `Complete record of ${data.transactions.length} transactions`);

    if (data.transactions.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['#', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Status']],
            body: data.transactions.map((t, i) => {
                const d = t.dateTime ? new Date(t.dateTime) : null;
                const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
                return [`${i + 1}`, dateStr, t.description || '-', t.category || '-', t.type, fmt(t.amount), t.status];
            }),
            margin: { left: M, right: M },
            theme: 'striped',
            styles: { fontSize: 6.5, cellPadding: 2, textColor: BRAND.text },
            headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: 'bold', fontSize: 6.5 },
            alternateRowStyles: { fillColor: BRAND.slate50 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 22 },
                2: { cellWidth: CW * 0.24 },
                3: { cellWidth: CW * 0.14 },
                4: { cellWidth: 18, halign: 'center' },
                5: { halign: 'right', fontStyle: 'bold' },
                6: { cellWidth: 18, halign: 'center' },
            },
            didParseCell: (hookData: any) => {
                if (hookData.section !== 'body') return;
                if (hookData.column.index === 4) {
                    const val = String(hookData.cell.raw);
                    hookData.cell.styles.textColor = val === 'INCOME' ? [22, 101, 52] : [153, 27, 27];
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fontSize = 5.5;
                }
                if (hookData.column.index === 5) {
                    const typeVal = String(hookData.row.cells[4]?.raw || '');
                    hookData.cell.styles.textColor = typeVal === 'INCOME' ? [22, 101, 52] : [153, 27, 27];
                }
                if (hookData.column.index === 6) {
                    const val = String(hookData.cell.raw);
                    if (val === 'Completed') hookData.cell.styles.textColor = [22, 101, 52];
                    else if (val === 'Pending') hookData.cell.styles.textColor = [146, 64, 14];
                    else if (val === 'Failed') hookData.cell.styles.textColor = [153, 27, 27];
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fontSize = 5.5;
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    /* ═══════════════════════════════════════════════════ */
    /*  FINANCIAL INSIGHTS                                */
    /* ═══════════════════════════════════════════════════ */
    checkPage(50);
    sectionHeader('Financial Insights', 'Auto-generated analysis of your financial health');

    const insights: string[] = [];
    if (data.stats.profitMargin > 20) {
        insights.push(`Strong profitability: Your gym is operating at ${data.stats.profitMargin}% profit margin with ${fmt(data.stats.netProfit)} net profit.`);
    } else if (data.stats.profitMargin > 0) {
        insights.push(`Moderate profitability: ${data.stats.profitMargin}% margin. Consider optimizing expenses to increase profits.`);
    } else {
        insights.push(`Warning: Operating at a ${Math.abs(data.stats.profitMargin)}% loss. Expenses exceed revenue by ${fmt(Math.abs(data.stats.netProfit))}.`);
    }

    if (data.stats.revenueChange > 10) {
        insights.push(`Revenue is growing at ${data.stats.revenueChange}% compared to the previous period - positive trend.`);
    } else if (data.stats.revenueChange < -5) {
        insights.push(`Revenue declined ${Math.abs(data.stats.revenueChange)}% vs previous period. Consider promotions or member outreach.`);
    }

    if (data.stats.pendingPayments > 0) {
        const pendingPct = data.stats.totalRevenue > 0 ? Math.round((data.stats.pendingPayments / data.stats.totalRevenue) * 100) : 0;
        insights.push(`Pending collections: ${fmt(data.stats.pendingPayments)} (${pendingPct}% of revenue) from ${data.stats.pendingCount} invoices need follow-up.`);
    } else {
        insights.push(`All payments collected - no outstanding dues. Excellent collection efficiency.`);
    }

    const expRatio = data.stats.totalRevenue > 0 ? Math.round((data.stats.totalExpenses / data.stats.totalRevenue) * 100) : 0;
    insights.push(`Expense-to-revenue ratio: ${expRatio}%. ${expRatio > 80 ? 'High - review spending.' : expRatio < 50 ? 'Well controlled.' : 'Moderate level.'}`);

    if (data.revenueBreakdown.length > 0) {
        insights.push(`Top revenue source: ${data.revenueBreakdown[0].label} contributing ${data.revenueBreakdown[0].percentage}% (${fmt(data.revenueBreakdown[0].value)}) of total income.`);
    }
    if (data.expenseBreakdown.length > 0) {
        insights.push(`Largest expense: ${data.expenseBreakdown[0].label} at ${data.expenseBreakdown[0].percentage}% (${fmt(data.expenseBreakdown[0].value)}) of total spend.`);
    }

    insights.forEach((ins) => {
        checkPage(14);
        const isGood = ins.includes('Strong') || ins.includes('growing') || ins.includes('Excellent') || ins.includes('Well controlled');
        const isBad = ins.includes('Warning') || ins.includes('declined') || ins.includes('High -');
        const dotColor = isGood ? BRAND.emerald : isBad ? BRAND.red : BRAND.accent;
        doc.setFillColor(...dotColor);
        doc.circle(M + 3, y + 2, 1.5, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.text);
        const lines = doc.splitTextToSize(ins, CW - 12);
        doc.text(lines, M + 8, y + 3);
        y += lines.length * 4 + 4;
    });

    /* ═══════════════════════════════════════════════════ */
    /*  FOOTER ON EVERY PAGE                              */
    /* ═══════════════════════════════════════════════════ */
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pH = doc.internal.pageSize.getHeight();
        doc.setFillColor(...BRAND.primary);
        doc.rect(0, pH - 12, W, 12, 'F');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${gymName}  |  ${periodLabel} Financial Report  |  ${reportDate}`, M, pH - 5);
        doc.text(`Page ${i} of ${pageCount}`, W - M, pH - 5, { align: 'right' });
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('CONFIDENTIAL', W / 2, pH - 5, { align: 'center' });
        if (i > 1) {
            doc.setDrawColor(...BRAND.accent);
            doc.setLineWidth(0.5);
            doc.line(0, 0, W, 0);
        }
    }

    const dateSlug = new Date().toISOString().split('T')[0];
    doc.save(`${gymName.replace(/\s+/g, '_')}_Financial_Report_${periodLabel}_${dateSlug}.pdf`);
};
