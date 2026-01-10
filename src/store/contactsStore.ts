// Emergency contacts state management with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact, ContactRelationship } from '../types/contact.types';
import { generateId } from '../utils/validation.utils';

interface ContactsState {
  contacts: EmergencyContact[];
  isLoading: boolean;

  // Actions
  addContact: (
    name: string,
    email: string,
    relationship: ContactRelationship,
    phone?: string
  ) => Promise<void>;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  loadContacts: (contacts: EmergencyContact[]) => void;
  resetContacts: () => void;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      isLoading: false,

      addContact: async (
        name: string,
        email: string,
        relationship: ContactRelationship,
        phone?: string
      ) => {
        const newContact: EmergencyContact = {
          id: generateId(),
          userId: 'current-user', // Will be replaced with actual auth
          name,
          email,
          phone,
          relationship,
          createdAt: new Date(),
        };

        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));

        // TODO: Sync to Firebase
        // await syncContactToFirebase(newContact);
      },

      updateContact: async (id: string, updates: Partial<EmergencyContact>) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...updates } : contact
          ),
        }));

        // TODO: Sync to Firebase
      },

      deleteContact: async (id: string) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        }));

        // TODO: Sync to Firebase
      },

      loadContacts: (contacts: EmergencyContact[]) => {
        // Convert timestamps from strings back to Dates if needed
        const parsedContacts = contacts.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        }));

        set({ contacts: parsedContacts });
      },

      resetContacts: () => {
        set({ contacts: [] });
      },
    }),
    {
      name: 'contacts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
