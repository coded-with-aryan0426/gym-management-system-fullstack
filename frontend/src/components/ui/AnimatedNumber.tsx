import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    className?: string;
    format?: (value: number) => string;
}

export default function AnimatedNumber({ value, className = "", format }: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { stiffness: 50, damping: 15 });
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, value, isInView]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // Round to avoid decimals during transition if standard number
                // If money, we might want decimals, but usually these dashboards are ints or simple floats
                const rounded = Math.round(latest);
                ref.current.textContent = format ? format(latest) : rounded.toLocaleString();
            }
        });
    }, [springValue, format]);

    return <span ref={ref} className={className}>{format ? format(0) : 0}</span>;
}
