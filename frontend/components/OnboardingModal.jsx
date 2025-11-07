import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './OnboardingModal.css';

function OnboardingModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    skills: [],
    experience: '',
    bio: '',
    location: '',
    interests: []
  });
  const { updateProfile } = useAuth();

  const steps = [
    {
      title: 'What describes you best?',
      component: 'role'
    },
    {
      title: 'What are your skills?',
      component: 'skills'
    },
    {
      title: 'Tell us about your experience',
      component: 'experience'
    },
    {
      title: 'Complete your profile',
      component: 'profile'
    }
  ];

  const roles = [
    { id: 'founder', label: 'The Founder', description: 'I have startup ideas and want to build a team' },
    { id: 'professional', label: 'The Professional', description: 'I want to join exciting projects and contribute my skills' },
    { id: 'investor', label: 'The Investor', description: 'I\'m looking for promising startups to invest in' },
    { id: 'student', label: 'The Student', description: 'I want to learn and gain experience through projects' }
  ];

  const skillOptions = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design',
    'Product Management', 'Marketing', 'Sales', 'Data Science', 'Machine Learning',
    'Mobile Development', 'DevOps', 'Blockchain', 'AI/ML', 'Backend Development',
    'Frontend Development', 'Full Stack', 'Digital Marketing', 'Content Writing'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateProfile(formData);
    onClose();
  };

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'role':
        return (
          <div className="role-selection">
            {roles.map(role => (
              <div
                key={role.id}
                className={`role-card ${formData.role === role.id ? 'selected' : ''}`}
                onClick={() => handleInputChange('role', role.id)}
              >
                <h3>{role.label}</h3>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="skills-selection">
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  className={`skill-btn ${formData.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="skills-note">Select all skills that apply to you</p>
          </div>
        );

      case 'experience':
        return (
          <div className="experience-selection">
            <div className="form-group">
              <label>Years of Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years (Beginner)</option>
                <option value="2-3">2-3 years (Intermediate)</option>
                <option value="4-6">4-6 years (Experienced)</option>
                <option value="7+">7+ years (Expert)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g., Mumbai, India"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="profile-completion">
            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Tell us about yourself, your interests, and what you're looking for..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
              />
            </div>
            <div className="profile-summary">
              <h4>Profile Summary</h4>
              <div className="summary-item">
                <strong>Role:</strong> {roles.find(r => r.id === formData.role)?.label}
              </div>
              <div className="summary-item">
                <strong>Skills:</strong> {formData.skills.join(', ')}
              </div>
              <div className="summary-item">
                <strong>Experience:</strong> {formData.experience}
              </div>
              <div className="summary-item">
                <strong>Location:</strong> {formData.location}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.role;
      case 1: return formData.skills.length > 0;
      case 2: return formData.experience && formData.location;
      case 3: return formData.bio;
      default: return false;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="onboarding-modal">
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="onboarding-content">
          <div className="step-header">
            <h3>{steps[currentStep].title}</h3>
            <span className="step-counter">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="step-content">
            {renderStepContent()}
          </div>

          <div className="step-actions">
            {currentStep > 0 && (
              <button className="prev-btn" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Previous
              </button>
            )}
            <button 
              className="next-btn" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;