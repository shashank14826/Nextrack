import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  // Clear error when component unmounts or navigates away
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    const result = await forgotPassword(email);
    if (result.success) {
      setResetSent(true);
      setTempPassword(result.tempPassword);
      setSuccessMessage(result.message);
    }
  };

  return (
    <View style={styles.container}>
      {!resetSent ? (
        <>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subTitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Password Reset Sent</Text>
          <Text style={styles.successText}>{successMessage}</Text>
          
          <View style={styles.tempPasswordContainer}>
            <Text style={styles.tempPasswordLabel}>Your temporary password:</Text>
            <Text style={styles.tempPassword}>{tempPassword}</Text>
            <Text style={styles.note}>
              Note: In a real app, this would be sent to your email instead of showing here.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity 
        style={styles.backLink}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backLinkText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center'
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  successText: {
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16
  },
  inputContainer: {
    marginBottom: 20
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  button: {
    backgroundColor: '#4361ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  backLink: {
    marginTop: 30,
    alignItems: 'center'
  },
  backLinkText: {
    color: '#4361ee',
    fontSize: 16
  },
  tempPasswordContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  tempPasswordLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333'
  },
  tempPassword: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4361ee',
    marginBottom: 15
  },
  note: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center'
  }
});

export default ForgotPasswordScreen; 