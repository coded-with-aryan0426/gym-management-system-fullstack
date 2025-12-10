import type React from "react"

interface AthlonXLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 16, text: 14 },
  md: { icon: 20, text: 16 },
  lg: { icon: 32, text: 24 },
  xl: { icon: 48, text: 32 },
}

export const AthlonXLogo: React.FC<AthlonXLogoProps> = ({ 
  size = "md", 
  showText = true,
  className = ""
}) => {
  const { icon, text } = sizes[size]
  
  return (
    <div 
      className={className}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: size === "xl" ? 16 : size === "lg" ? 12 : 8 
      }}
    >
      <div style={{
        width: icon + 12,
        height: icon + 12,
        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        borderRadius: size === "xl" ? 12 : size === "lg" ? 10 : 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
      }}>
        <svg 
          width={icon} 
          height={icon} 
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
        </svg>
      </div>
      {showText && (
        <span style={{
          fontSize: text,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.5px"
        }}>
          AthlonX
        </span>
      )}
    </div>
  )
}

export default AthlonXLogo
