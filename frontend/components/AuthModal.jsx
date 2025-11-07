import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomInput from './CustomInput';
import './AuthModal.css';

function AuthModal({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: Date.now(),
        name: formData.fullName || formData.email.split('@')[0],
        email: formData.email,
        role: 'user',
        avatar: '/api/placeholder/40/40',
        // For existing users, simulate having profile data
        bio: isLogin ? 'Experienced developer passionate about building innovative solutions' : '',
        skills: isLogin ? ['React', 'Node.js', 'JavaScript'] : [],
        experience: isLogin ? '2-3' : '',
        location: isLogin ? 'Mumbai, India' : ''
      };

      login(userData);
      setLoading(false);
      onSuccess(userData);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      const userData = {
        id: Date.now(),
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        provider: 'google',
        // Simulate existing user with complete profile
        bio: 'Full-stack developer with 5 years of experience in building scalable web applications',
        skills: ['React', 'Node.js', 'Python', 'UI/UX Design'],
        experience: '4-6',
        location: 'Bangalore, India'
      };

      login(userData);
      setLoading(false);
      onSuccess(userData);
    }, 1000);
  };

  const handleMicrosoftAuth = () => {
    setLoading(true);
    // Simulate Microsoft OAuth
    setTimeout(() => {
      const userData = {
        id: Date.now(),
        name: 'Jane Smith',
        email: 'jane.smith@outlook.com',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        provider: 'microsoft',
        // Simulate existing user with complete profile
        bio: 'Product manager and entrepreneur focused on healthcare technology solutions',
        skills: ['Product Management', 'Marketing', 'Data Science'],
        experience: '7+',
        location: 'Delhi, India'
      };

      login(userData);
      setLoading(false);
      onSuccess(userData);
    }, 1000);
  };

  // Demo user login disabled

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? 'Welcome Back' : 'Join Squad.net'}</h2>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-content">
          {/* Demo Users Section removed */}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <CustomInput
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  disabled={loading}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  }
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <CustomInput
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <CustomInput
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <CustomInput
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  disabled={loading}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  }
                />
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
            )}

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-auth">
              <button
                className="social-btn google-btn"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                className="social-btn microsoft-btn"
                onClick={handleMicrosoftAuth}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="9" height="9" fill="#f25022" />
                  <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
                  <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
                  <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
                </svg>
                Continue with Microsoft
              </button>
            </div>

            {!isLogin && (
              <div className="checkbox-group terms-checkbox">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="agreeToTerms">
                  By creating an account, you agree to our <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="privacy-link">Privacy Policy</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || (!isLogin && !formData.agreeToTerms)}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;