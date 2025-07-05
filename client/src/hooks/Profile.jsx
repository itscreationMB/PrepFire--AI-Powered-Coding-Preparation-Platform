import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setFormData({
            name: data.data.user.name,
            email: data.data.user.email,
            bio: data.data.user.profile?.bio || '',
            location: data.data.user.profile?.location || '',
            website: data.data.user.profile?.website || '',
            github: data.data.user.profile?.github || '',
            linkedin: data.data.user.profile?.linkedin || '',
            company: data.data.user.profile?.company || '',
            jobTitle: data.data.user.profile?.jobTitle || '',
            experience: data.data.user.profile?.experience || 'beginner'
          });
          setAchievements(data.data.user.achievements || []);
          setStatistics(data.data.user.statistics);
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } else {
        throw new Error('Failed to fetch user data from server');
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
      setError(error.message);

      // Mock user data
      const mockUser = {
        _id: '1',
        name: 'Coders',
        email: 'john.doe@example.com',
        avatar: null,
        role: 'user',
        isVerified: true,
        profile: {
          bio: 'Passionate software developer with 3+ years of experience in full-stack development.',
          location: 'San Francisco, CA',
          website: 'https://johndoe.dev',
          github: 'johndoe',
          linkedin: 'johndoe',
          company: 'TechCorp Inc.',
          jobTitle: 'Software Engineer',
          experience: 'intermediate',
          preferredLanguages: ['javascript', 'python', 'java'],
          interests: ['web development', 'machine learning', 'algorithms']
        },
        statistics: {
          totalProblems: 150,
          solvedProblems: 89,
          easyProblems: 45,
          mediumProblems: 32,
          hardProblems: 12,
          totalSubmissions: 234,
          acceptedSubmissions: 89,
          accuracy: 92,
          points: 1250,
          level: 8,
          rank: 1247
        },
        streak: {
          current: 15,
          longest: 28
        },
        achievements: [
          {
            id: 'first_solve',
            name: 'First Steps',
            description: 'Solved your first problem',
            icon: '🎯',
            category: 'solving',
            unlockedAt: new Date('2024-01-15')
          },
          {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Solved 5 problems in one day',
            icon: '⚡',
            category: 'speed',
            unlockedAt: new Date('2024-02-20')
          },
          {
            id: 'streak_master',
            name: 'Streak Master',
            description: 'Maintained a 7-day solving streak',
            icon: '🔥',
            category: 'streak',
            unlockedAt: new Date('2024-03-10')
          }
        ],
        createdAt: new Date('2024-01-10'),
        preferences: {
          theme: 'dark',
          language: 'en',
          codeTheme: 'vs-dark',
          fontSize: 14,
          notifications: {
            email: true,
            push: false,
            weeklyReport: true,
            achievements: true
          }
        }
      };

      setUser(mockUser);
      setFormData({
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.profile.bio,
        location: mockUser.profile.location,
        website: mockUser.profile.website,
        github: mockUser.profile.github,
        linkedin: mockUser.profile.linkedin,
        company: mockUser.profile.company,
        jobTitle: mockUser.profile.jobTitle,
        experience: mockUser.profile.experience
      });
      setAchievements(mockUser.achievements);
      setStatistics(mockUser.statistics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.profile-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.profile-card',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' }
      );

      gsap.fromTo('.achievement-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power2.out' }
      );
    }
  }, [loading, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            profile: {
              bio: formData.bio,
              location: formData.location,
              website: formData.website,
              github: formData.github,
              linkedin: formData.linkedin,
              company: formData.company,
              jobTitle: formData.jobTitle,
              experience: formData.experience
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(prev => ({
            ...prev,
            name: formData.name,
            profile: {
              ...prev.profile,
              bio: formData.bio,
              location: formData.location,
              website: formData.website,
              github: formData.github,
              linkedin: formData.linkedin,
              company: formData.company,
              jobTitle: formData.jobTitle,
              experience: formData.experience
            }
          }));
          setIsEditing(false);
          alert('Profile updated successfully!');
        } else {
          throw new Error(data.message || 'Failed to update profile');
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/change-password`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          alert('Password changed successfully!');
        } else {
          throw new Error(data.message || 'Failed to change password');
        }
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getExperienceColor = (experience) => {
    switch(experience) {
      case 'beginner': return 'from-green-400 to-green-500';
      case 'intermediate': return 'from-yellow-400 to-yellow-500';
      case 'advanced': return 'from-orange-400 to-orange-500';
      case 'expert': return 'from-red-400 to-red-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-400">Unable to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="profile-header mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            My Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your account and track your coding journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error} (Showing sample data)</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 inline-flex">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'statistics', label: 'Statistics', icon: '📊' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                <p className="text-gray-300 mb-2">{user.email}</p>
                <p className="text-gray-400 mb-4">{user.profile?.jobTitle || 'Software Developer'}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getExperienceColor(user.profile?.experience || 'beginner')} text-white`}>
                    {(user.profile?.experience || 'beginner').charAt(0).toUpperCase() + (user.profile?.experience || 'beginner').slice(1)}
                  </span>
                  {user.isVerified && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-400 mb-6">
                  Joined {formatJoinDate(user.createdAt)}
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {isEditing ? 'Edit Profile Information' : 'Profile Information'}
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      ) : (
                        <p className="text-gray-300 py-3">{user.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Email</label>
                      <p className="text-gray-300 py-3">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-300 py-3">{user.profile?.bio || 'No bio available'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="e.g., San Francisco, CA"
                        />
                      ) : (
                        <p className="text-gray-300 py-3">{user.profile?.location || 'Not specified'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Company</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="e.g., TechCorp Inc."
                        />
                      ) : (
                        <p className="text-gray-300 py-3">{user.profile?.company || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Job Title</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="e.g., Software Engineer"
                        />
                      ) : (
                        <p className="text-gray-300 py-3">{user.profile?.jobTitle || 'Not specified'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Experience Level</label>
                      {isEditing ? (
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      ) : (
                        <p className="text-gray-300 py-3 capitalize">{user.profile?.experience || 'beginner'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">GitHub</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="GitHub username"
                        />
                      ) : (
                        <p className="text-gray-300 py-3">
                          {user.profile?.github ? (
                            <a href={`https://github.com/${user.profile.github}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                              @{user.profile.github}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">LinkedIn</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="LinkedIn username"
                        />
                      ) : (
                        <p className="text-gray-300 py-3">
                          {user.profile?.linkedin ? (
                            <a href={`https://linkedin.com/in/${user.profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                              {user.profile.linkedin}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="https://your-website.com"
                      />
                    ) : (
                      <p className="text-gray-300 py-3">
                        {user.profile?.website ? (
                          <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                            {user.profile.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4 pt-6 border-t border-white/10">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && statistics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">{statistics.solvedProblems}</div>
                <div className="text-gray-400">Problems Solved</div>
              </div>
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{statistics.accuracy}%</div>
                <div className="text-gray-400">Accuracy Rate</div>
              </div>
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{statistics.points}</div>
                <div className="text-gray-400">Total Points</div>
              </div>
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">#{statistics.rank}</div>
                <div className="text-gray-400">Global Rank</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Problem Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">Easy Problems</span>
                    <span className="text-white font-semibold">{statistics.easyProblems}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(statistics.easyProblems / 100) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400">Medium Problems</span>
                    <span className="text-white font-semibold">{statistics.mediumProblems}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(statistics.mediumProblems / 80) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-400">Hard Problems</span>
                    <span className="text-white font-semibold">{statistics.hardProblems}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(statistics.hardProblems / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Streak Information</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-400 mb-2">🔥</div>
                    <div className="text-3xl font-bold text-white mb-2">{user.streak?.current || 0}</div>
                    <div className="text-gray-400">Current Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-300 mb-2">{user.streak?.longest || 0}</div>
                    <div className="text-gray-400">Longest Streak</div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-orange-300 text-sm text-center">
                      Keep solving problems daily to maintain your streak!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
              <h2 className="text-3xl font-bold text-white mb-4">🏆 Achievements</h2>
              <p className="text-gray-300">
                You've unlocked {achievements.length} achievement{achievements.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={achievement.id} className="achievement-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-5xl mb-4">{achievement.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{achievement.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        achievement.category === 'solving' ? 'bg-blue-500/20 text-blue-400' :
                        achievement.category === 'streak' ? 'bg-orange-500/20 text-orange-400' :
                        achievement.category === 'speed' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {achievement.category}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {achievements.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-2">No achievements yet</h3>
                <p className="text-gray-400 mb-6">Start solving problems to unlock achievements!</p>
                <button
                  onClick={() => window.location.href = '/practice'}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  Start Practicing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Change Password</h3>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-white font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>

            <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                  { key: 'weeklyReport', label: 'Weekly Report', description: 'Weekly progress summary' },
                  { key: 'achievements', label: 'Achievement Alerts', description: 'Notifications for new achievements' }
                ].map(notification => (
                  <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <h4 className="text-white font-medium">{notification.label}</h4>
                      <p className="text-gray-400 text-sm">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={user.preferences?.notifications?.[notification.key] || false}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-red-400 mb-6">Danger Zone</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h4 className="text-red-400 font-medium mb-2">Delete Account</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        alert('Account deletion is not implemented in this demo.');
                      }
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;