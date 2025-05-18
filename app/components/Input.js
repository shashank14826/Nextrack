import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  style = {},
  inputStyle = {},
  labelStyle = {},
  required = false
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : {}, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  inputError: {
    borderColor: '#ff4d4d'
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 5
  },
  required: {
    color: '#ff4d4d'
  }
});

export default Input; 