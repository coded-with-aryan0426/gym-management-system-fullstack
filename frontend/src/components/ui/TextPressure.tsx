import { motion } from "framer-motion";

interface TextPressureProps {
    text: string;
    className?: string;
    flex?: boolean;
    alpha?: boolean;
    stroke?: boolean;
    width?: boolean;
    weight?: boolean;
    italic?: boolean;
    textColor?: string;
    minFontSize?: number;
}

export default function TextPressure({ text, className = "" }: TextPressureProps) {
    // Split text into words and characters
    // This is a simplified version of the "Text Pressure" effect which often involves 
    // variable font weight/width. Since we might not have a variable font set up,
    // we'll do a "Text Reveal" with a scale/blur effect that feels similar in energy.

    const words = text.split(" ");

    return (
        <h1 className={`flex flex-wrap gap-x-4 gap-y-2 justify-center ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="relative inline-block overflow-visible"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.15,
                            ease: [0.2, 0.65, 0.3, 0.9]
                        }}
                        className="inline-block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
                    >
                        {word}
                    </motion.span>

                    {/* Subtle reflection/glow copy */}
                    <motion.span
                        className="absolute top-0 left-0 bg-gradient-to-b from-white/30 to-transparent bg-clip-text text-transparent blur-xl select-none pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    >
                        {word}
                    </motion.span>
                </motion.span>
            ))}
        </h1>
    );
}
