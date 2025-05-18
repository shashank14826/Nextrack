import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style = {},
  textStyle = {},
  variant = 'primary'
}) => {
  const getButtonStyle = () => {
    if (variant === 'danger') {
      return styles.dangerButton;
    } else if (variant === 'secondary') {
      return styles.secondaryButton;
    } else if (variant === 'outline') {
      return styles.outlineButton;
    }
    return styles.primaryButton;
  };
  
  const getTextStyle = () => {
    if (variant === 'outline') {
      return styles.outlineButtonText;
    } else if (variant === 'secondary') {
      return styles.secondaryButtonText;
    }
    return styles.buttonText;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled || isLoading ? styles.disabledButton : {},
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4361ee' : '#fff'} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  primaryButton: {
    backgroundColor: '#4361ee'
  },
  secondaryButton: {
    backgroundColor: '#a0a0a0'
  },
  dangerButton: {
    backgroundColor: '#ff4d4d'
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4361ee'
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  outlineButtonText: {
    color: '#4361ee',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default Button; 