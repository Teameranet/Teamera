import { useState, useEffect } from 'react';
import { useRealtimeProfile } from '../hooks/useRealtimeProfile';
import UserAvatar from './UserAvatar';
import './ProfileModal.css';
import { X, Github, Linkedin, Globe, Twitter, Instagram, Phone, Mail } from 'lucide-react';

/**
 * ProfileModal Component
 * 
 * Displays a modal with detailed information about a user
 * including their avatar, about section, experience, education, and skills
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with profile details
 * @param {Function} props.onClose - Function to close the modal
 * @returns {JSX.Element} ProfileModal component
 */
function ProfileModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('about');
  const [profileData, setProfileData] = useState(user);

  // Update profile data when user prop changes
  useEffect(() => {
    setProfileData(user);
  }, [user]);

  // Subscribe to real-time updates for this profile
  useRealtimeProfile(user?.id, (updatedProfile) => {
    setProfileData(updatedProfile);
  });

  // Map user role to display title (match Profile page behavior)
  const getRoleDisplayTitle = (role) => {
    const roleMap = {
      'founder': 'The Founder',
      'professional': 'The Professional',
      'investor': 'The Investor',
      'student': 'The Student'
    };
    return roleMap[role] || role || 'Developer';
  };

  // If no user is provided, return null
  if (!profileData) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Header with user avatar and basic info */}
        <div className="profile-header">
          <UserAvatar user={profileData} size="large" className="profile-avatar" />
          <div className="profile-basic-info">
            <h2>{profileData.name}</h2>
            <p className="profile-title">{profileData.title || getRoleDisplayTitle(profileData.role)}</p>
            {profileData.location && <p className="profile-location">{profileData.location}</p>}
          </div>
        </div>

        {/* Profile navigation tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`profile-tab ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`profile-tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
          <button
            className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
        </div>

        {/* Profile content based on active tab */}
        <div className="profile-content">
          {activeTab === 'about' && (
            <div className="profile-about">
              <h3>About</h3>
              <p>{profileData.bio || 'No bio information available.'}</p>

              {/* Contact information */}
              <div className="contact-info">
                <h4>Contact</h4>
                
                {/* Basic contact info */}
                {profileData.email && (
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{profileData.email}</span>
                  </div>
                )}
                

                {/* Social media links */}
                {(profileData.github_url || profileData.linkedin_url || profileData.portfolio_url) && (
                  <div className="social-media-section">
                    <h5>Social Media</h5>
                    <div className="social-links-grid">
                      {profileData.github_url && (
                        <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Github size={20} />
                          <span>GitHub</span>
                        </a>
                      )}
                      {profileData.linkedin_url && (
                        <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Linkedin size={20} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {profileData.portfolio_url && (
                        <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Globe size={20} />
                          <span>Portfolio</span>
                        </a>
                      )}
                      
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="profile-experience">
              <h3>Experience</h3>
              {(() => {
                const experiences = Array.isArray(profileData.work_experience) ? profileData.work_experience : 
                                 Array.isArray(profileData.experience) ? profileData.experience : [];
                return experiences.length > 0 ? (
                <div className="experience-list">
                  {experiences.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <h4>{exp.title}</h4>
                      <p className="company-name">{exp.company}</p>
                      <p className="experience-duration">{exp.duration || exp.period}</p>
                      {exp.description && <p className="experience-description">{exp.description}</p>}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="experience-technologies">
                          <strong>Technologies:</strong> {exp.technologies.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No experience information available.</p>
              );
              })()}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="profile-education">
              <h3>Education</h3>
              {(() => {
                const education = Array.isArray(profileData.education) ? profileData.education : [];
                return education.length > 0 ? (
                <div className="education-list">
                  {education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <h4>{edu.degree}</h4>
                      <p className="institution-name">{edu.institution}</p>
                      <p className="education-duration">{edu.duration || edu.period}</p>
                      {(edu.description || edu.details) && (
                        <p className="education-description">{edu.description || edu.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No education information available.</p>
              );
              })()}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="profile-skills">
              <h3>Skills</h3>
              {(() => {
                const skills = Array.isArray(profileData.skills) ? profileData.skills : [];
                return skills.length > 0 ? (
                <div className="skills-list">
                  {skills.map((skill, index) => {
                    // Handle both string skills and object skills
                    if (typeof skill === 'string') {
                      return <span key={index} className="skill-tag">{skill}</span>;
                    } else if (skill && skill.name) {
                      return <span key={index} className="skill-tag">{skill.name}</span>;
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p>No skills information available.</p>
              );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal; 