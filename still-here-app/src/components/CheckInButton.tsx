// Main check-in button component
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../utils/constants';

interface CheckInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  lastCheckIn?: Date | null;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  onPress,
  disabled = false,
  lastCheckIn,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [successAnim] = useState(new Animated.Value(0));

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show success animation
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const isToday = lastCheckIn && new Date().toDateString() === lastCheckIn.toDateString();

  return (
    <View style={styles.container}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            isToday && styles.buttonCheckedIn,
            disabled && styles.buttonDisabled,
          ]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isToday ? '✓ Checked In!' : 'Still Here'}
          </Text>
          {!isToday && <Text style={styles.subtitle}>Tap to check in</Text>}
        </TouchableOpacity>
      </Animated.View>

      {/* Success checkmark overlay */}
      <Animated.View
        style={[
          styles.successOverlay,
          {
            opacity: successAnim,
            transform: [
              {
                scale: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.successIcon}>✓</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonCheckedIn: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  successOverlay: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 120,
    color: COLORS.white,
  },
});
