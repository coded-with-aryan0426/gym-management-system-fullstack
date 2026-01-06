import type { ReactNode } from "react";
import TiltCard from "./TiltCard";
import AnimatedNumber from "./AnimatedNumber";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardMetricCardProps {
    title: string;
    value: number;
    change?: number; // percentage change
    prefix?: string;
    suffix?: string;
    icon?: ReactNode;
    formatValue?: (value: number) => string;
    delay?: number;
    fullWidth?: boolean;
}

export default function DashboardMetricCard({
    title,
    value,
    change,
    prefix = "",
    suffix = "",
    icon,
    formatValue,
    delay = 0,
    fullWidth = false,
}: DashboardMetricCardProps) {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className={`${fullWidth ? "col-span-full md:col-span-2 lg:col-span-4" : "col-span-1"}`} style={{ animationDelay: `${delay}s` }}>
            <TiltCard className="h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.05]">

                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-white/50 uppercase tracking-wider font-mono">
                                {title}
                            </span>
                            <div className="flex items-baseline gap-1">
                                {prefix && <span className="text-2xl text-white/60 font-light">{prefix}</span>}
                                <AnimatedNumber
                                    value={value}
                                    className="text-4xl font-bold text-white tracking-tight"
                                    format={formatValue}
                                />
                                {suffix && <span className="text-xl text-white/60">{suffix}</span>}
                            </div>
                        </div>

                        {icon && (
                            <div className="rounded-xl bg-white/5 p-3 text-white/80 ring-1 ring-white/10">
                                {icon}
                            </div>
                        )}
                    </div>

                    {/* Footer / Change */}
                    {change !== undefined && (
                        <div className="mt-4 flex items-center gap-2">
                            <div
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isPositive
                                    ? "text-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/20"
                                    : "text-rose-400 bg-rose-400/10 ring-1 ring-rose-400/20"
                                    }`}
                            >
                                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(change)}%
                            </div>
                            <span className="text-xs text-white/30">vs last month</span>
                        </div>
                    )}

                    {/* Decorative Gradient Blob */}
                    <div
                        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl transition-opacity opacity-50 group-hover:opacity-100"
                    />
                </div>
            </TiltCard>
        </div>
    );
}
