import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  /* Demo users disabled
  const demoUsers = [];
  */

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('solvearn_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    // Store profile data if it's a new user or has extended profile info
    const storedUser = await storeUserProfile(userData);
    setUser(storedUser);
    localStorage.setItem('solvearn_user', JSON.stringify(storedUser));
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('solvearn_user');
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        const newUser = result.data;
        await login(newUser);
        return { success: true, user: newUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Update locally first for immediate UI feedback
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('solvearn_user', JSON.stringify(updatedUser));

      // Sync with backend if user has an ID
      if (user?.id) {
        const response = await fetch(`/api/users/${user.id}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (response.ok) {
          const result = await response.json();
          const backendUser = result.data;
          setUser(backendUser);
          localStorage.setItem('solvearn_user', JSON.stringify(backendUser));
          return { success: true, user: backendUser };
        } else {
          console.error('Failed to sync profile with backend');
          return { success: true, user: updatedUser }; // Still return success for local update
        }
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Store new user profile data on signup/signin
  const storeUserProfile = async (userData) => {
    try {
      if (userData.id) {
        // If user has ID, sync with backend
        const response = await fetch(`/api/users/${userData.id}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const result = await response.json();
          return result.data;
        }
      }
      return userData;
    } catch (error) {
      console.error('Error storing user profile:', error);
      return userData; // Return original data if backend fails
    }
  };
  
  // Demo login disabled
  // const loginAsDemoUser = (userId) => {}

  const value = {
    user,
    login,
    logout,
    signup,
    updateProfile,
    storeUserProfile,
    loading,
    isAuthenticated: !!user,
    // demoUsers,
    // loginAsDemoUser,
    showAuthModal,
    setShowAuthModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};