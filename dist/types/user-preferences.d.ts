export interface NotificationPreference {
    browser: boolean;
    email?: boolean;
    emailAddress?: string;
}
export interface UserPreferences {
    notifications: {
        enabled: boolean;
        preferences: NotificationPreference;
    };
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
}
