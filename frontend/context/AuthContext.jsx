import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

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
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return null;
      }

      if (data) {
        // Transform snake_case to camelCase for frontend
        const transformedData = {
          ...data,
          githubUrl: data.github_url,
          linkedinUrl: data.linkedin_url,
          portfolioUrl: data.portfolio_url,
          // Map work_experience from DB to experience for frontend
          experience: data.work_experience || [],
          // Keep education as is (already correct)
          education: data.education || [],
          // Keep skills as is
          skills: data.skills || []
        };
        setUser(transformedData);
        return transformedData;
      }
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Set session and user immediately
      setSession(data.session);

      // Try to fetch profile with timeout
      let profile = null;
      try {
        const profilePromise = fetchUserProfile(data.user.id);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );
        profile = await Promise.race([profilePromise, timeoutPromise]);
      } catch (profileError) {
        console.warn('Could not fetch profile, using auth user data:', profileError);
        // Set basic user data from auth
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0]
        });
      }

      setShowAuthModal(false);
      return { success: true, user: profile || data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      // Create basic user object from auth data with empty fields to trigger onboarding
      const basicUser = {
        id: data.user.id,
        email: email,
        name: name,
        bio: null,
        skills: [],
        location: null,
        role: null,
        experience: null,
        needsOnboarding: true // Explicit flag for onboarding
      };

      // Set session and user immediately (even if email confirmation is required)
      setSession(data.session);
      setUser(basicUser);

      // Check if email confirmation is required
      if (!data.session) {
        // Email confirmation is required - but still return user for onboarding
        console.log('Email confirmation required, but returning user for onboarding:', basicUser);
        setShowAuthModal(false);
        return {
          success: true,
          user: basicUser,
          requiresEmailConfirmation: true,
          message: 'Please check your email to confirm your account.'
        };
      }

      // Try to create profile in background (don't wait for it)
      setTimeout(async () => {
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            // Create profile if it doesn't exist
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: email,
                name: name
              });
          }

          // Fetch the complete profile
          await fetchUserProfile(data.user.id);
        } catch (profileError) {
          console.warn('Background profile creation failed:', profileError);
        }
      }, 100);

      setShowAuthModal(false);
      console.log('Signup successful, returning user for onboarding:', basicUser);
      return { success: true, user: basicUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Get current user directly from Supabase (most reliable method)
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Fallback to session if getUser fails
      let userId, userEmail;
      if (currentUser) {
        userId = currentUser.id;
        userEmail = currentUser.email;
      } else {
        // Try to get from session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        userId = currentUser?.id || session?.user?.id || currentSession?.user?.id;
        userEmail = currentUser?.email || session?.user?.email || currentSession?.user?.email;
      }

      if (!userId) {
        // Last attempt: wait a bit and retry (for race conditions after signup)
        await new Promise(resolve => setTimeout(resolve, 300));
        const { data: { user: retryUser } } = await supabase.auth.getUser();
        if (retryUser) {
          userId = retryUser.id;
          userEmail = retryUser.email;
        }
      }

      if (!userId) {
        console.error('No user ID found. User:', user, 'Session:', session, 'Current User:', currentUser);
        return { success: false, error: 'No user logged in' };
      }

      // Prepare data for Supabase (convert camelCase to snake_case)
      const dbData = {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        title: profileData.title,
        role: profileData.role,
        experience: profileData.experience,
        github_url: profileData.githubUrl,
        linkedin_url: profileData.linkedinUrl,
        portfolio_url: profileData.portfolioUrl,
        skills: profileData.skills || [],
        education: profileData.education || [],
        work_experience: profileData.experience || [], // Map experience to work_experience for DB
      };

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(dbData)
          .eq('id', userId)
          .select()
          .single();
      } else {
        // Insert new profile if it doesn't exist
        result = await supabase
          .from('profiles')
          .insert({ ...dbData, id: userId, email: userEmail })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Transform snake_case to camelCase for frontend
      const transformedData = {
        ...result.data,
        githubUrl: result.data.github_url,
        linkedinUrl: result.data.linkedin_url,
        portfolioUrl: result.data.portfolio_url,
        // Map work_experience from DB to experience for frontend
        experience: result.data.work_experience || [],
        // Keep education as is (already correct)
        education: result.data.education || [],
        // Keep skills as is
        skills: result.data.skills || []
      };

      setUser(transformedData);
      return { success: true, user: transformedData };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    signup,
    updateProfile,
    resetPassword,
    signInWithGoogle,
    signInWithMicrosoft,
    fetchUserProfile,
    loading,
    isAuthenticated: !!user && !!session,
    showAuthModal,
    setShowAuthModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};