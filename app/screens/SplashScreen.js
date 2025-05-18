import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AuthApp</Text>
      <ActivityIndicator size="large" color="#4361ee" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4361ee'
  },
  loader: {
    marginTop: 20
  }
});

export default SplashScreen; 