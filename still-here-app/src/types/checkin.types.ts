// Check-in types

export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  method: CheckInMethod;
}

export enum CheckInMethod {
  APP = 'app',
  WIDGET = 'widget',
  WATCH = 'watch',
}

export interface Alert {
  id: string;
  userId: string;
  sentAt: Date;
  contactsNotified: string[]; // contactIds
  reason: AlertReason;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum AlertReason {
  MISSED_CHECKIN = 'missed_checkin',
  MANUAL_TRIGGER = 'manual_trigger',
}
