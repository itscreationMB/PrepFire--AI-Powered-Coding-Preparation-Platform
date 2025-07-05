const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profile: {
    bio: {
      type: String,
      maxlength: 500
    },
    location: String,
    website: String,
    github: String,
    linkedin: String,
    twitter: String,
    company: String,
    jobTitle: String,
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    preferredLanguages: [{
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'swift', 'kotlin']
    }],
    interests: [String],
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  statistics: {
    totalProblems: {
      type: Number,
      default: 0
    },
    solvedProblems: {
      type: Number,
      default: 0
    },
    attemptedProblems: {
      type: Number,
      default: 0
    },
    easyProblems: {
      type: Number,
      default: 0
    },
    mediumProblems: {
      type: Number,
      default: 0
    },
    hardProblems: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTime: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    }
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: null
    }
  },
  progress: {
    categories: [{
      name: {
        type: String,
        required: true
      },
      solved: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      },
      accuracy: {
        type: Number,
        default: 0
      },
      averageTime: {
        type: Number,
        default: 0
      }
    }],
    weeklyProgress: [{
      week: {
        type: Date,
        required: true
      },
      problemsSolved: {
        type: Number,
        default: 0
      },
      timeSpent: {
        type: Number,
        default: 0
      },
      accuracy: {
        type: Number,
        default: 0
      }
    }],
    monthlyProgress: [{
      month: {
        type: Date,
        required: true
      },
      problemsSolved: {
        type: Number,
        default: 0
      },
      timeSpent: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: 0
      }
    }]
  },
  achievements: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['solving', 'streak', 'speed', 'accuracy', 'learning', 'social'],
      default: 'solving'
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    codeTheme: {
      type: String,
      enum: ['vs-dark', 'vs-light', 'monokai', 'github'],
      default: 'vs-dark'
    },
    fontSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 24
    },
    autoRun: {
      type: Boolean,
      default: false
    },
    showHints: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      weeklyReport: {
        type: Boolean,
        default: true
      },
      achievements: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      statsVisible: {
        type: Boolean,
        default: true
      },
      activityVisible: {
        type: Boolean,
        default: true
      }
    }
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  attemptedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  favoriteProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  contests: [{
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    rank: Number,
    score: Number
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.virtual('accuracyPercentage').get(function() {
  if (this.statistics.totalSubmissions === 0) return 0;
  return Math.round((this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100);
});

userSchema.virtual('completionRate').get(function() {
  if (this.statistics.totalProblems === 0) return 0;
  return Math.round((this.statistics.solvedProblems / this.statistics.totalProblems) * 100);
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function(next) {
  if (this.statistics.totalSubmissions > 0) {
    this.statistics.accuracy = Math.round(
      (this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100
    );
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.streak.lastActiveDate;
  
  if (!lastActive) {
    this.streak.current = 1;
    this.streak.lastActiveDate = today;
  } else {
    const daysDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 1) {
      this.streak.current += 1;
      this.streak.lastActiveDate = today;
    } else if (daysDifference > 1) {
      this.streak.current = 1;
      this.streak.lastActiveDate = today;
    }
  }
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
};

userSchema.methods.addPoints = function(points) {
  this.statistics.points += points;
  const newLevel = Math.floor(this.statistics.points / 1000) + 1;
  this.statistics.level = newLevel;
};

userSchema.methods.updateCategoryProgress = function(categoryName, solved, accuracy, time) {
  const category = this.progress.categories.find(cat => cat.name === categoryName);
  
  if (category) {
    category.solved = solved;
    category.accuracy = accuracy;
    category.averageTime = time;
  } else {
    this.progress.categories.push({
      name: categoryName,
      solved: solved,
      accuracy: accuracy,
      averageTime: time
    });
  }
};

userSchema.methods.addAchievement = function(achievementData) {
  const exists = this.achievements.some(achievement => achievement.id === achievementData.id);
  if (!exists) {
    this.achievements.push(achievementData);
  }
};

userSchema.methods.getRecommendations = function() {
  const weakCategories = this.progress.categories
    .filter(cat => cat.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  
  return {
    categories: weakCategories.map(cat => cat.name),
    difficulty: this.statistics.accuracy > 80 ? 'medium' : 'easy',
    focus: 'accuracy'
  };
};

// Indexes - removed duplicate email index since unique: true already creates an index
userSchema.index({ 'statistics.rank': 1 });
userSchema.index({ 'statistics.points': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, lastActiveAt: -1 });

module.exports = mongoose.model('User', userSchema);