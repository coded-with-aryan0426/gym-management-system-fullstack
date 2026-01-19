import { getStorageKey } from '../contexts/AuthContext';

const API_URL = 'http://localhost:8081/api/trainer/settings';

export interface ProfileSettings {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    bookings: boolean;
    reminders: boolean;
    marketing: boolean;
    sound: boolean;
    vibration: boolean;
}

export interface PrivacySettings {
    profileVisible: boolean;
    activityStatus: boolean;
    analytics: boolean;
    locationServices: boolean;
}

export interface AppearanceSettings {
    theme: string;
    accentColor: string;
}

export interface RegionalSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
}

export interface TrainerSettingsDTO {
    profile: ProfileSettings;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    appearance: AppearanceSettings;
    regional: RegionalSettings;
}

const getHeaders = () => {
    const token = localStorage.getItem(getStorageKey('token'));
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getTrainerSettings = async (): Promise<TrainerSettingsDTO> => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch trainer settings');
    }

    return response.json();
};

export const updateTrainerSettings = async (settings: TrainerSettingsDTO): Promise<TrainerSettingsDTO> => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings),
    });

    if (!response.ok) {
        throw new Error('Failed to update trainer settings');
    }

    return response.json();
};
