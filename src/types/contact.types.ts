// Emergency contact types

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  relationship: ContactRelationship;
  createdAt: Date;
}

export enum ContactRelationship {
  FAMILY = 'family',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  COLLEAGUE = 'colleague',
  OTHER = 'other',
}

export const RELATIONSHIP_LABELS: Record<ContactRelationship, string> = {
  [ContactRelationship.FAMILY]: 'Family',
  [ContactRelationship.FRIEND]: 'Friend',
  [ContactRelationship.NEIGHBOR]: 'Neighbor',
  [ContactRelationship.COLLEAGUE]: 'Colleague',
  [ContactRelationship.OTHER]: 'Other',
};
