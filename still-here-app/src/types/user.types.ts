// User types and interfaces

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  isPaid: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  reminderTime: string; // "09:00"
  alertThreshold: number; // days (default: 2)
  vacationMode: boolean;
  personalMessage: string;
  notificationsEnabled: boolean;
}
