// Main home screen with check-in button
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CheckInButton } from '../components/CheckInButton';
import { useCheckInStore } from '../store/checkinStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCheckInDate, formatTime } from '../utils/date.utils';
import { COLORS, FONT_SIZES, SPACING, APP_NAME } from '../utils/constants';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { lastCheckIn, streak, recordCheckIn } = useCheckInStore();
  const { reminderTime, vacationMode } = useSettingsStore();

  const handleCheckIn = async () => {
    await recordCheckIn();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Vacation Mode Banner */}
        {vacationMode && (
          <View style={styles.vacationBanner}>
            <Text style={styles.vacationText}>
              🏖️ Vacation Mode Active - Check-ins paused
            </Text>
          </View>
        )}

        {/* Check-In Button */}
        <View style={styles.buttonContainer}>
          <CheckInButton
            onPress={handleCheckIn}
            disabled={vacationMode}
            lastCheckIn={lastCheckIn}
          />
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {lastCheckIn && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Last Check-In</Text>
              <Text style={styles.statValue}>
                {formatCheckInDate(lastCheckIn)}
              </Text>
            </View>
          )}

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statValue}>
              {streak} {streak === 1 ? 'day' : 'days'} 🔥
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Next Reminder</Text>
            <Text style={styles.statValue}>
              {vacationMode ? 'Paused' : `Tomorrow at ${formatTime(reminderTime)}`}
            </Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Check in daily so we know you're okay. If you miss 2 days, we'll
            notify your emergency contacts.
          </Text>
        </View>

        {/* Emergency Contacts Link */}
        <TouchableOpacity
          style={styles.contactsLink}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.contactsLinkText}>
            📋 Manage Emergency Contacts
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  settingsIcon: {
    fontSize: FONT_SIZES.xlarge,
  },
  vacationBanner: {
    backgroundColor: COLORS.accent + '30',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  vacationText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  stats: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoBox: {
    backgroundColor: COLORS.primary + '20',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  infoText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  contactsLink: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  contactsLinkText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.white,
  },
});
