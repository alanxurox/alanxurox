// Settings screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useSettingsStore } from '../store/settingsStore';
import { useCheckInStore } from '../store/checkinStore';
import { useContactsStore } from '../store/contactsStore';
import { formatTime } from '../utils/date.utils';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  APP_NAME,
  PRIVACY_URL,
  TERMS_URL,
} from '../utils/constants';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const {
    reminderTime,
    alertThreshold,
    vacationMode,
    personalMessage,
    notificationsEnabled,
    updateReminderTime,
    updateAlertThreshold,
    toggleVacationMode,
    updatePersonalMessage,
    toggleNotifications,
  } = useSettingsStore();

  const { resetCheckIns } = useCheckInStore();
  const { contacts, resetContacts } = useContactsStore();

  const [editingMessage, setEditingMessage] = useState(false);
  const [messageText, setMessageText] = useState(personalMessage);

  const handleSaveMessage = () => {
    updatePersonalMessage(messageText);
    setEditingMessage(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all your data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetCheckIns();
            resetContacts();
            Alert.alert('Success', 'All data has been reset');
          },
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
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Check-In Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-In Settings</Text>

          {/* Vacation Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vacation Mode</Text>
              <Text style={styles.settingDescription}>
                Pause check-in reminders and alerts
              </Text>
            </View>
            <Switch
              value={vacationMode}
              onValueChange={toggleVacationMode}
              trackColor={{ false: COLORS.gray, true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* Alert Threshold */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Alert After</Text>
              <Text style={styles.settingDescription}>
                Send alert after {alertThreshold}{' '}
                {alertThreshold === 1 ? 'day' : 'days'} of missed check-ins
              </Text>
            </View>
          </View>

          {/* Reminder Time */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                {formatTime(reminderTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive daily check-in reminders
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.gray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Personal Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Message</Text>
          <Text style={styles.sectionDescription}>
            This message will be included when your emergency contacts are
            notified.
          </Text>

          {editingMessage ? (
            <View>
              <Input
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Enter a personal message..."
                multiline
                numberOfLines={4}
                containerStyle={styles.messageInput}
              />
              <View style={styles.messageButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setMessageText(personalMessage);
                    setEditingMessage(false);
                  }}
                  style={styles.messageButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveMessage}
                  style={styles.messageButton}
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>
                  {personalMessage || 'No message set'}
                </Text>
              </View>
              <Button
                title="Edit Message"
                variant="outline"
                onPress={() => setEditingMessage(true)}
              />
            </View>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionDescription}>
            {contacts.length === 0
              ? 'No contacts added yet'
              : `${contacts.length} ${
                  contacts.length === 1 ? 'contact' : 'contacts'
                } added`}
          </Text>
          <Button
            title="Manage Contacts"
            variant="outline"
            onPress={() => navigation.navigate('Contacts')}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.versionText}>{APP_NAME} v1.0.0</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Button
            title="Reset All Data"
            variant="outline"
            onPress={handleResetData}
            style={styles.dangerButton}
            textStyle={styles.dangerText}
          />
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.white,
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
  content: {
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
  },
  messageBox: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    minHeight: 80,
  },
  messageText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  messageInput: {
    marginBottom: SPACING.sm,
  },
  messageButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  messageButton: {
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  linkText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
  },
  linkIcon: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.gray,
  },
  versionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.5,
  },
  dangerButton: {
    borderColor: COLORS.error,
  },
  dangerText: {
    color: COLORS.error,
  },
});
