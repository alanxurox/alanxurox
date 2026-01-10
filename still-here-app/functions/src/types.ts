// TypeScript types for Cloud Functions

export interface User {
  email: string;
  createdAt: FirebaseFirestore.Timestamp;
  isPaid: boolean;
  lastCheckIn: FirebaseFirestore.Timestamp | null;
  streak: number;
  settings: UserSettings;
}

export interface UserSettings {
  reminderTime: string; // "09:00"
  alertThreshold: number; // days (default: 2)
  vacationMode: boolean;
  personalMessage: string;
  notificationsEnabled: boolean;
}

export interface EmergencyContact {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  relationship: ContactRelationship;
  createdAt: FirebaseFirestore.Timestamp;
}

export enum ContactRelationship {
  FAMILY = 'family',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  COLLEAGUE = 'colleague',
  OTHER = 'other'
}

export interface CheckIn {
  userId: string;
  timestamp: FirebaseFirestore.Timestamp;
  method: CheckInMethod;
}

export enum CheckInMethod {
  APP = 'app',
  WIDGET = 'widget',
  WATCH = 'watch'
}

export interface Alert {
  userId: string;
  sentAt: FirebaseFirestore.Timestamp;
  contactsNotified: string[]; // contactIds
  reason: AlertReason;
  resolved: boolean;
  resolvedAt?: FirebaseFirestore.Timestamp;
  resolvedBy?: string;
}

export enum AlertReason {
  MISSED_CHECKIN = 'missed_checkin',
  MANUAL_TRIGGER = 'manual_trigger'
}

export interface EmailAlertParams {
  contactName: string;
  contactEmail: string;
  userName: string;
  lastCheckInDate: Date | null;
  personalMessage?: string;
  userEmail?: string;
  userPhone?: string;
}
