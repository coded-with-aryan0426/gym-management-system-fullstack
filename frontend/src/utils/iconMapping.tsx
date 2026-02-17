import React from 'react';

// ============================================================================
// GYM EQUIPMENT ICON SYSTEM (3D ASSETS)
// Maps equipment names/categories to high-quality 3D rendered icons
// ============================================================================

// Base path for 3D icons
const ICON_BASE_PATH = '/assets/icons/3d';

// Icon Filenames
const ICONS = {
    // Core
    DUMBBELL: `${ICON_BASE_PATH}/dumbbell.png`,
    TREADMILL: `${ICON_BASE_PATH}/treadmill.png`,
    KETTLEBELL: `${ICON_BASE_PATH}/kettlebell.png`,
    YOGA_MAT: `${ICON_BASE_PATH}/yoga-mat.png`,
    MASSAGE_GUN: `${ICON_BASE_PATH}/massage-gun.png`,
    GYM_BAG: `${ICON_BASE_PATH}/gym-bag.png`,

    // Cardio Machines
    BIKE: `${ICON_BASE_PATH}/bike.png`,
    ELLIPTICAL: `${ICON_BASE_PATH}/elliptical.png`,
    ROWER: `${ICON_BASE_PATH}/rower.png`,
    STAIRMASTER: `${ICON_BASE_PATH}/stairmaster.png`,

    // Strength
    BARBELL: `${ICON_BASE_PATH}/barbell.png`,
    BENCH: `${ICON_BASE_PATH}/bench.png`,
    POWER_RACK: `${ICON_BASE_PATH}/power-rack.png`,
    CABLE_MACHINE: `${ICON_BASE_PATH}/cable-machine.png`,
    SMITH_MACHINE: `${ICON_BASE_PATH}/smith-machine.png`,
    LEG_PRESS: `${ICON_BASE_PATH}/leg-press.png`,
    LAT_PULLDOWN: `${ICON_BASE_PATH}/lat-pulldown.png`,
    LEG_EXTENSION: `${ICON_BASE_PATH}/leg-extension.png`,
    PEC_DECK: `${ICON_BASE_PATH}/pec-deck.png`,
    WEIGHT_PLATE: `${ICON_BASE_PATH}/weight-plate.png`,

    // Functional
    BATTLE_ROPE: `${ICON_BASE_PATH}/battle-rope.png`,
    PLYO_BOX: `${ICON_BASE_PATH}/plyo-box.png`,
    MEDICINE_BALL: `${ICON_BASE_PATH}/medicine-ball.png`,
    SWISS_BALL: `${ICON_BASE_PATH}/swiss-ball.png`,
    TRX: `${ICON_BASE_PATH}/trx.png`,

    // Wellness
    FOAM_ROLLER: `${ICON_BASE_PATH}/foam-roller.png`,
    SAUNA: `${ICON_BASE_PATH}/sauna.png`,

    // Other
    LOCKERS: `${ICON_BASE_PATH}/lockers.png`,
};

// Component to render 3D icons with fallback
const Icon3D = ({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) => (
    <img
        src={src}
        alt={alt}
        className="object-contain transition-transform duration-300 group-hover:scale-110"
        style={{ width: size, height: size }}
        loading="lazy"
        onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
    />
);

// Fallback SVG for when no image matches or image fails to load
const DefaultEquipmentIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hidden">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

// Icon mapping configuration
interface IconConfig {
    iconSrc: string;
    keywords: string[];
}

const EQUIPMENT_ICON_MAP: IconConfig[] = [
    // CARDIO
    {
        iconSrc: ICONS.TREADMILL,
        keywords: ['treadmill', 'run', 'walk']
    },
    {
        iconSrc: ICONS.STAIRMASTER,
        keywords: ['stair', 'climber', 'stepper', 'ladder']
    },
    {
        iconSrc: ICONS.BIKE,
        keywords: ['bike', 'cycle', 'spin', 'peloton', 'assault', 'fan', 'air bike']
    },
    {
        iconSrc: ICONS.ELLIPTICAL,
        keywords: ['elliptical', 'cross trainer', 'arc', 'glider']
    },
    {
        iconSrc: ICONS.ROWER,
        keywords: ['rower', 'rowing', 'erg', 'concept2']
    },

    // STRENGTH - FREE WEIGHTS
    {
        iconSrc: ICONS.DUMBBELL,
        keywords: ['dumbbell', 'db', 'hand weight']
    },
    {
        iconSrc: ICONS.BARBELL,
        keywords: ['barbell', 'olympic bar', 'ez bar', 'trap bar', 'hex bar']
    },
    {
        iconSrc: ICONS.WEIGHT_PLATE,
        keywords: ['plate', 'bumper', 'disc']
    },
    {
        iconSrc: ICONS.KETTLEBELL,
        keywords: ['kettlebell', 'kb']
    },

    // STRENGTH - MACHINES & RACKS
    {
        iconSrc: ICONS.BENCH,
        keywords: ['bench', 'chest press', 'incline', 'decline']
    },
    {
        iconSrc: ICONS.POWER_RACK,
        keywords: ['rack', 'cage', 'rig', 'stand', 'pull up']
    },
    {
        iconSrc: ICONS.SMITH_MACHINE,
        keywords: ['smith machine', 'smith']
    },
    {
        iconSrc: ICONS.CABLE_MACHINE,
        keywords: ['cable', 'pulley', 'functional trainer', 'crossover']
    },
    {
        iconSrc: ICONS.LAT_PULLDOWN,
        keywords: ['lat pulldown', 'pulldown']
    },
    {
        iconSrc: ICONS.LEG_PRESS,
        keywords: ['leg press', 'hack squat', 'calf']
    },
    {
        iconSrc: ICONS.LEG_EXTENSION,
        keywords: ['leg extension', 'extension']
    },
    {
        iconSrc: ICONS.PEC_DECK,
        keywords: ['pec deck', 'fly', 'butterfly']
    },

    // FUNCTIONAL
    {
        iconSrc: ICONS.BATTLE_ROPE,
        keywords: ['rope', 'battle']
    },
    {
        iconSrc: ICONS.PLYO_BOX,
        keywords: ['plyo', 'box', 'jump']
    },
    {
        iconSrc: ICONS.MEDICINE_BALL,
        keywords: ['medicine ball', 'med ball', 'slam ball', 'wall ball']
    },
    {
        iconSrc: ICONS.SWISS_BALL,
        keywords: ['swiss ball', 'stability ball', 'yoga ball']
    },
    {
        iconSrc: ICONS.TRX,
        keywords: ['trx', 'suspension', 'straps']
    },

    // WELLNESS
    {
        iconSrc: ICONS.YOGA_MAT,
        keywords: ['yoga', 'mat', 'pilates', 'stretch', 'floor']
    },
    {
        iconSrc: ICONS.FOAM_ROLLER,
        keywords: ['foam roller', 'roller', 'triggerpoint']
    },
    {
        iconSrc: ICONS.MASSAGE_GUN,
        keywords: ['massage', 'gun', 'hypervolt', 'theragun', 'recovery']
    },
    {
        iconSrc: ICONS.SAUNA,
        keywords: ['sauna', 'steam', 'infrared', 'heat']
    },

    // OTHER
    {
        iconSrc: ICONS.LOCKERS,
        keywords: ['locker']
    },
    {
        iconSrc: ICONS.GYM_BAG,
        keywords: ['bag', 'accessory', 'bottle', 'towel', 'other']
    }
];

// Category fallback mapping
const CATEGORY_ICON_MAP: Record<string, string> = {
    'STRENGTH': ICONS.DUMBBELL,
    'CARDIO': ICONS.TREADMILL,
    'FUNCTIONAL': ICONS.KETTLEBELL,
    'YOGA': ICONS.YOGA_MAT,
    'RECOVERY': ICONS.MASSAGE_GUN,
    'OTHER': ICONS.GYM_BAG
};

/**
 * Get the appropriate equipment icon based on name and category
 */
export const getEquipmentIcon = (
    category: string,
    name: string,
    size: number = 56
): React.ReactElement => {
    const lowerName = name.toLowerCase();

    // Find specific match by keywords
    for (const config of EQUIPMENT_ICON_MAP) {
        for (const keyword of config.keywords) {
            if (lowerName.includes(keyword)) {
                return (
                    <>
                        <Icon3D src={config.iconSrc} alt={name} size={size} />
                        <DefaultEquipmentIcon size={size / 2} />
                    </>
                );
            }
        }
    }

    // Category fallback
    const categoryIconSrc = CATEGORY_ICON_MAP[category.toUpperCase()];
    if (categoryIconSrc) {
        return (
            <>
                <Icon3D src={categoryIconSrc} alt={category} size={size} />
                <DefaultEquipmentIcon size={size / 2} />
            </>
        );
    }

    // Default fallback
    return (
        <>
            <Icon3D src={ICONS.GYM_BAG} alt="Equipment" size={size} />
            <DefaultEquipmentIcon size={size / 2} />
        </>
    );
};

/**
 * Get all equipment keywords for autocomplete
 */
export const getAllEquipmentKeywords = (): string[] => {
    const keywords: string[] = [];
    for (const config of EQUIPMENT_ICON_MAP) {
        keywords.push(...config.keywords);
    }
    return [...new Set(keywords)].sort();
};

/**
 * Check if equipment has specific icon mapping
 */
export const hasSpecificIconMapping = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    for (const config of EQUIPMENT_ICON_MAP) {
        for (const keyword of config.keywords) {
            if (lowerName.includes(keyword)) {
                return true;
            }
        }
    }
    return false;
};
