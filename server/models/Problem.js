const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  weight: { type: Number, default: 1 },
  explanation: String
});

const solutionSchema = new mongoose.Schema({
  language: { type: String, required: true, enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'] },
  code: { type: String, required: true },
  timeComplexity: String,
  spaceComplexity: String,
  approach: String,
  isOptimal: { type: Boolean, default: false }
});

const hintSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  content: { type: String, required: true },
  difficulty: { type: String, enum: ['gentle', 'medium', 'strong'], default: 'gentle' }
});

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true, enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'] },
  status: { type: String, enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'pending'], default: 'pending' },
  runtime: Number,
  memory: Number,
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  errorMessage: String,
  executionDetails: { output: String, stderr: String, exitCode: Number },
  submittedAt: { type: Date, default: Date.now },
  judgedAt: Date,
  points: { type: Number, default: 0 }
}, { timestamps: true });

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  category: { type: String, required: true, enum: ['array', 'string', 'linkedlist', 'tree', 'graph', 'dp', 'greedy', 'backtracking', 'sorting', 'searching', 'math', 'bit-manipulation', 'two-pointers', 'sliding-window', 'stack', 'queue', 'heap', 'trie', 'union-find', 'design', 'simulation'] },
  subcategory: String,
  tags: [{ type: String, lowercase: true }],
  companies: [{ name: String, frequency: { type: Number, min: 1, max: 5, default: 1 } }],
  topicTags: [{ type: String, enum: ['algorithms', 'data-structures', 'system-design', 'sql', 'concurrency', 'shell'] }],
  constraints: [String],
  examples: [{ input: String, output: String, explanation: String }],
  testCases: [testCaseSchema],
  solutions: [solutionSchema],
  hints: [hintSchema],
  editorial: {
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approaches: [{ title: String, description: String, timeComplexity: String, spaceComplexity: String, code: String, language: String }],
    relatedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
  },
  statistics: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    averageRuntime: Number,
    averageMemory: Number,
    solvedBy: { type: Number, default: 0 },
    attemptedBy: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    difficulty_votes: { easy: { type: Number, default: 0 }, medium: { type: Number, default: 0 }, hard: { type: Number, default: 0 } }
  },
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, enum: ['original', 'leetcode', 'hackerrank', 'codeforces', 'ai-generated'], default: 'original' },
    originalUrl: String,
    aiGenerated: { prompt: String, model: String, temperature: Number, generatedAt: Date },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  },
  visibility: { type: String, enum: ['public', 'private', 'premium'], default: 'public' },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  estimatedTime: { type: Number, default: 30 },
  points: { easy: { type: Number, default: 10 }, medium: { type: Number, default: 20 }, hard: { type: Number, default: 30 } },
  discussion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }],
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

problemSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'problemId'
});

problemSchema.virtual('acceptancePercentage').get(function () {
  if (this.statistics.totalSubmissions === 0) return 0;
  return Math.round((this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100);
});

problemSchema.virtual('difficultyScore').get(function () {
  const scores = { easy: 1, medium: 2, hard: 3 };
  return scores[this.difficulty] || 1;
});

problemSchema.virtual('popularityScore').get(function () {
  return (this.statistics.likes - this.statistics.dislikes) + (this.statistics.solvedBy * 0.1);
});

problemSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (this.statistics.totalSubmissions > 0) {
    this.statistics.acceptanceRate = Math.round((this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100);
  }
  next();
});

problemSchema.methods.updateStatistics = function (submission) {
  this.statistics.totalSubmissions += 1;
  if (submission.status === 'accepted') {
    this.statistics.acceptedSubmissions += 1;
    this.statistics.solvedBy += 1;
  }
  if (submission.runtime) {
    const currentAvg = this.statistics.averageRuntime || 0;
    const totalSubmissions = this.statistics.totalSubmissions;
    this.statistics.averageRuntime = (currentAvg * (totalSubmissions - 1) + submission.runtime) / totalSubmissions;
  }
  if (submission.memory) {
    const currentAvg = this.statistics.averageMemory || 0;
    const totalSubmissions = this.statistics.totalSubmissions;
    this.statistics.averageMemory = (currentAvg * (totalSubmissions - 1) + submission.memory) / totalSubmissions;
  }
  this.statistics.acceptanceRate = Math.round((this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100);
};

problemSchema.methods.addLike = function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.statistics.likes += 1;
    const dislikeIndex = this.dislikedBy.indexOf(userId);
    if (dislikeIndex > -1) {
      this.dislikedBy.splice(dislikeIndex, 1);
      this.statistics.dislikes -= 1;
    }
  }
};

problemSchema.methods.addDislike = function (userId) {
  if (!this.dislikedBy.includes(userId)) {
    this.dislikedBy.push(userId);
    this.statistics.dislikes += 1;
    const likeIndex = this.likedBy.indexOf(userId);
    if (likeIndex > -1) {
      this.likedBy.splice(likeIndex, 1);
      this.statistics.likes -= 1;
    }
  }
};

problemSchema.methods.getPointsForDifficulty = function () {
  return this.points[this.difficulty] || 10;
};

problemSchema.methods.isBookmarkedBy = function (userId) {
  return this.bookmarkedBy.includes(userId);
};

problemSchema.methods.toggleBookmark = function (userId) {
  const index = this.bookmarkedBy.indexOf(userId);
  if (index > -1) {
    this.bookmarkedBy.splice(index, 1);
    return false;
  } else {
    this.bookmarkedBy.push(userId);
    return true;
  }
};

problemSchema.statics.getByDifficulty = function (difficulty) {
  return this.find({ difficulty, isActive: true });
};

problemSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true });
};

problemSchema.statics.getFeatured = function () {
  return this.find({ featured: true, isActive: true });
};

problemSchema.statics.getRecommendations = function (user) {
  const userCategories = user.progress.categories.filter(cat => cat.accuracy < 70).map(cat => cat.name);
  const difficulty = user.statistics.accuracy > 80 ? 'medium' : 'easy';
  return this.find({ category: { $in: userCategories }, difficulty, isActive: true, _id: { $nin: user.solvedProblems } }).limit(10);
};

submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });
problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ 'statistics.acceptanceRate': 1 });
problemSchema.index({ 'statistics.solvedBy': -1 });
problemSchema.index({ featured: 1, isActive: 1 });
problemSchema.index({ premium: 1 });

const Problem = mongoose.model('Problem', problemSchema);
const Submission = mongoose.model('Submission', submissionSchema);

module.exports = { Problem, Submission };