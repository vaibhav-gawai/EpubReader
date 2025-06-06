import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookHeart, Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const { currentTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <LinearGradient
        colors={[currentTheme.primary + '20', currentTheme.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: currentTheme.accent + '20' }]}>
              <BookHeart size={32} color={currentTheme.accent} />
            </View>
            <Text style={[styles.title, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
              Sign in to continue your reading journey
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                <Mail size={20} color={currentTheme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: currentTheme.text, fontFamily: 'CrimsonText-Regular' }]}
                  placeholder="Email address"
                  placeholderTextColor={currentTheme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                <Lock size={20} color={currentTheme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: currentTheme.text, fontFamily: 'CrimsonText-Regular' }]}
                  placeholder="Password"
                  placeholderTextColor={currentTheme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: currentTheme.accent }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, { fontFamily: 'CrimsonText-Regular' }]}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
              {!isLoading && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
              <Text style={[styles.dividerText, { color: currentTheme.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, { borderColor: currentTheme.border }]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[styles.registerButtonText, { color: currentTheme.accent, fontFamily: 'CrimsonText-Regular' }]}>
                Create New Account
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});