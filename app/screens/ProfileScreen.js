import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useThemeToggle } from '../context/ThemeContext';

const ProfileScreen = () => {
  const { userInfo, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useThemeToggle();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
              {userInfo?.name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
              {userInfo?.email || 'email@example.com'}
            </Text>
            
            {userInfo?.phoneNumber && (
              <Text style={[styles.profilePhone, { color: theme.colors.onSurfaceVariant }]}>
                {userInfo.phoneNumber}
              </Text>
            )}
          </View>
        </View>
        
        <Divider style={{ backgroundColor: theme.colors.outline }} />
        
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Account Settings
        </Text>
        
        <List.Section>
          <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
            Preferences
          </List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle dark mode theme"
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider style={{ backgroundColor: theme.colors.outline }} />
          
          <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
            Account Information
          </List.Subheader>
          <List.Item
            title="Email"
            description={userInfo?.email}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
          />
          <Divider style={{ backgroundColor: theme.colors.outline }} />
          <List.Item
            title="Sign Out"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={handleLogout}
          />
        </List.Section>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 10,
    margin: 20,
    marginTop: 20,
    padding: 20,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 3,
  },
  profilePhone: {
    fontSize: 14,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default ProfileScreen; 