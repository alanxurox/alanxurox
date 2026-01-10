// Contact card component for displaying emergency contacts
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { EmergencyContact, RELATIONSHIP_LABELS } from '../types/contact.types';
import { COLORS, FONT_SIZES, SPACING } from '../utils/constants';

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.relationship}>
            {RELATIONSHIP_LABELS[contact.relationship]}
          </Text>
          <Text style={styles.email}>{contact.email}</Text>
          {contact.phone && (
            <Text style={styles.phone}>{contact.phone}</Text>
          )}
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={[styles.actionText, styles.deleteText]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  relationship: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
  },
  phone: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  deleteButton: {
    backgroundColor: COLORS.error + '20',
  },
  actionText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteText: {
    color: COLORS.error,
  },
});
