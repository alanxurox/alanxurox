// Check-in state management with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckIn, CheckInMethod } from '../types/checkin.types';
import { calculateStreak } from '../utils/date.utils';
import { generateId } from '../utils/validation.utils';

interface CheckInState {
  lastCheckIn: Date | null;
  streak: number;
  checkIns: CheckIn[];
  isLoading: boolean;

  // Actions
  recordCheckIn: (method?: CheckInMethod) => Promise<void>;
  loadCheckIns: (checkIns: CheckIn[]) => void;
  refreshStreak: () => void;
  resetCheckIns: () => void;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      lastCheckIn: null,
      streak: 0,
      checkIns: [],
      isLoading: false,

      recordCheckIn: async (method: CheckInMethod = CheckInMethod.APP) => {
        const now = new Date();

        const newCheckIn: CheckIn = {
          id: generateId(),
          userId: 'current-user', // Will be replaced with actual auth
          timestamp: now,
          method,
        };

        // Update local state
        set((state) => ({
          lastCheckIn: now,
          checkIns: [newCheckIn, ...state.checkIns],
        }));

        // Recalculate streak
        get().refreshStreak();

        // TODO: Sync to Firebase
        // await syncCheckInToFirebase(newCheckIn);
      },

      loadCheckIns: (checkIns: CheckIn[]) => {
        // Convert timestamps from strings back to Dates if needed
        const parsedCheckIns = checkIns.map((c) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }));

        set({
          checkIns: parsedCheckIns,
          lastCheckIn: parsedCheckIns[0]?.timestamp || null,
        });

        get().refreshStreak();
      },

      refreshStreak: () => {
        const checkIns = get().checkIns;
        const dates = checkIns.map((c) => c.timestamp);
        const streak = calculateStreak(dates);
        set({ streak });
      },

      resetCheckIns: () => {
        set({
          lastCheckIn: null,
          streak: 0,
          checkIns: [],
        });
      },
    }),
    {
      name: 'checkin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
