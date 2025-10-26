import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { emailService } from '../services/emailService';
import { otpService } from '../services/otpService';
import { supabase } from '../integrations/supabase/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => boolean;
  isOTPVerified: (email: string) => boolean;
  loading: boolean;
  error: string | null;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Create context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

 const login = async (email: string, password: string): Promise<void> => {
  setLoading(true);
  clearError();

  try {
    // 1️⃣ Check Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 2️⃣ Fetch user profile info from DB
    const uid = data.user?.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    // 3️⃣ Build local user
    const mockUser = {
      id: uid || 'local-' + Date.now(),
      email,
      firstName: profile?.first_name || email.split('@')[0],
      lastName: profile?.last_name || '',
      name: profile?.full_name || email.split('@')[0],
    };

    localStorage.setItem('authToken', 'supabase-session');
    localStorage.setItem('userData', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);
  } catch (err: any) {
    setError(err.message || 'Login failed. Please try again.');
    throw err;
  } finally {
    setLoading(false);
  }
};


const signup = async (userData: SignupData): Promise<void> => {
  setLoading(true);
  clearError();

  try {
    // ✅ 1. Verify OTP first (Azure)
    if (!otpService.isOTPVerified(userData.email)) {
      throw new Error('Please verify your email with OTP first');
    }

    // ✅ 2. Create Supabase Auth user (email/password)
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined, // don’t send verification link
      },
    });
    if (signUpErr) throw signUpErr;

    let uid = signUpData.user?.id;

    // ✅ 3. Force immediate login (in case Supabase didn’t auto-log in)
    if (!uid) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });
      if (signInErr) throw signInErr;
      uid = signInData.user?.id;
    }

    if (!uid) throw new Error('User ID missing after signup');

    // ✅ 4. Insert into profiles (your FK schema)
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: uid,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      full_name: `${userData.firstName} ${userData.lastName}`,
    });
    if (profileErr) throw profileErr;

    // ✅ 5. Save locally
    const mockUser = {
      id: uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
    };

    localStorage.setItem('authToken', 'supabase-session');
    localStorage.setItem('userData', JSON.stringify(mockUser));
    setIsAuthenticated(true);
    setUser(mockUser);

    otpService.removeOTP(userData.email);
  } catch (err: any) {
    setError(err.message || 'Signup failed. Please try again.');
    throw err;
  } finally {
    setLoading(false);
  }
};



  const sendOTP = async (email: string): Promise<void> => {
    setLoading(true);
    clearError();
    
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const otp = otpService.generateOTP();
      otpService.storeOTP(email, otp);
      
      await emailService.sendOTP(email, otp);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = (email: string, otp: string): boolean => {
    return otpService.verifyOTP(email, otp);
  };

  const isOTPVerified = (email: string): boolean => {
    return otpService.isOTPVerified(email);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
    isOTPVerified,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Also export useAuthContext as alias for backward compatibility
export const useAuthContext = useAuth;