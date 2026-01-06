import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

export default function GlassButton({ children, onClick, className = "" }: GlassButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`relative px-6 py-3 rounded-full font-medium text-white overflow-hidden group ${className}`}
            style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>

            {/* Shiny gradient overlay */}
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 bg-white/5 blur-md" />
        </motion.button>
    );
}
