// Settings state management with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types/user.types';
import { DEFAULT_REMINDER_TIME, DEFAULT_ALERT_THRESHOLD } from '../utils/constants';

interface SettingsState extends UserSettings {
  // Actions
  updateReminderTime: (time: string) => void;
  updateAlertThreshold: (days: number) => void;
  toggleVacationMode: () => void;
  updatePersonalMessage: (message: string) => void;
  toggleNotifications: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  reminderTime: DEFAULT_REMINDER_TIME,
  alertThreshold: DEFAULT_ALERT_THRESHOLD,
  vacationMode: false,
  personalMessage: '',
  notificationsEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateReminderTime: (time: string) => {
        set({ reminderTime: time });
        // TODO: Reschedule notifications
      },

      updateAlertThreshold: (days: number) => {
        set({ alertThreshold: days });
        // TODO: Update in Firebase
      },

      toggleVacationMode: () => {
        set((state) => ({ vacationMode: !state.vacationMode }));
        // TODO: Update in Firebase
      },

      updatePersonalMessage: (message: string) => {
        set({ personalMessage: message });
        // TODO: Update in Firebase
      },

      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
        // TODO: Update notification permissions
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
