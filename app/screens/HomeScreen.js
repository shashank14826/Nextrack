import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

const HomeScreen = () => {
  const { userInfo, logout, isLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    // No need to unset loggingOut as component will unmount after logout
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{userInfo?.name || 'User'}</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{userInfo?.email || 'email@example.com'}</Text>
            
            {userInfo?.phoneNumber && (
              <Text style={styles.profilePhone}>{userInfo.phoneNumber}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userInfo?.email || 'email@example.com'}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{userInfo?.phoneNumber || 'Not provided'}</Text>
        </View>
        
        {/* Add more user details here */}
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut || isLoading}
      >
        {loggingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4361ee'
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)'
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  profileInfo: {
    marginLeft: 15
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 3
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoLabel: {
    fontSize: 16,
    color: '#666'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default HomeScreen; 