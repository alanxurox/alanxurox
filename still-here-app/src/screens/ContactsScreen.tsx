// Emergency contacts management screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { ContactCard } from '../components/ContactCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useContactsStore } from '../store/contactsStore';
import {
  ContactRelationship,
  RELATIONSHIP_LABELS,
} from '../types/contact.types';
import { isValidEmail, isValidName } from '../utils/validation.utils';
import { COLORS, FONT_SIZES, SPACING } from '../utils/constants';

interface ContactsScreenProps {
  navigation: any;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  navigation,
}) => {
  const { contacts, addContact, deleteContact } = useContactsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: ContactRelationship.FAMILY,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidName(formData.name)) {
      newErrors.name = 'Please enter a valid name';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddContact = async () => {
    if (!validateForm()) return;

    await addContact(
      formData.name,
      formData.email,
      formData.relationship,
      formData.phone || undefined
    );

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: ContactRelationship.FAMILY,
    });
    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string, name: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContact(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Add 1-3 people who should be notified if you miss your daily check-ins.
        </Text>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onDelete={() => handleDeleteContact(item.id, item.name)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No emergency contacts yet</Text>
            <Text style={styles.emptySubtext}>
              Add someone who can check on you
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      {contacts.length < 3 && (
        <View style={styles.addButtonContainer}>
          <Button
            title="+ Add Emergency Contact"
            onPress={() => setShowAddModal(true)}
          />
        </View>
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <Input
              label="Name *"
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="Email *"
              placeholder="Enter email"
              value={formData.email}
              onChangeText={(text) =>
                setFormData({ ...formData, email: text })
              }
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone (Optional)"
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData({ ...formData, phone: text })
              }
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Relationship</Text>
            <View style={styles.relationshipButtons}>
              {Object.values(ContactRelationship).map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.relationshipButton,
                    formData.relationship === rel &&
                      styles.relationshipButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, relationship: rel })
                  }
                >
                  <Text
                    style={[
                      styles.relationshipButtonText,
                      formData.relationship === rel &&
                        styles.relationshipButtonTextActive,
                    ]}
                  >
                    {RELATIONSHIP_LABELS[rel]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Add Contact"
              onPress={handleAddContact}
              style={styles.submitButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backIcon: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  info: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
  },
  infoText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  list: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    opacity: 0.6,
  },
  addButtonContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '30',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  relationshipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  relationshipButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  relationshipButtonText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  relationshipButtonTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});
