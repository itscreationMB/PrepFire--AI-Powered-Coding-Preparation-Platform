const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User = require('./models/User');
    const { Problem, Submission } = require('./models/Problem');

    await User.createIndexes();
    await Problem.createIndexes();
    await Submission.createIndexes();

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const setupDatabase = async () => {
  await connectDB();
  await createIndexes();
};

const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

const dropDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.connection.dropDatabase();
      console.log('Database dropped');
    } else {
      throw new Error('Cannot drop database in production');
    }
  } catch (error) {
    console.error('Error dropping database:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    const User = require('./models/User');
    const { Problem } = require('./models/Problem');

    const adminUser = await User.findOne({ email: 'admin@prepfire.com' });
    if (!adminUser) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@prepfire.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin user created');
    }

    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      const sampleProblems = [
        {
          title: 'Two Sum',
          slug: 'two-sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'easy',
          category: 'array',
          tags: ['array', 'hash-table'],
          examples: [{
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }],
          testCases: [
            {
              input: '[2,7,11,15]\n9',
              expectedOutput: '[0,1]',
              isHidden: false
            },
            {
              input: '[3,2,4]\n6',
              expectedOutput: '[1,2]',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Try using a hash map to store the numbers you have seen.',
            difficulty: 'gentle'
          }],
          solutions: [{
            language: 'javascript',
            code: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            approach: 'Hash Table'
          }],
          estimatedTime: 15,
          isActive: true,
          statistics: {
            solvedBy: 1234,
            attemptedBy: 2500,
            likes: 890,
            dislikes: 45,
            acceptanceRate: 85
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Add Two Numbers',
          slug: 'add-two-numbers',
          description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
          difficulty: 'medium',
          category: 'linkedlist',
          tags: ['linked-list', 'math', 'recursion'],
          examples: [{
            input: 'l1 = [2,4,3], l2 = [5,6,4]',
            output: '[7,0,8]',
            explanation: '342 + 465 = 807.'
          }],
          testCases: [
            {
              input: '[2,4,3]\n[5,6,4]',
              expectedOutput: '[7,0,8]',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Remember to handle the carry from addition.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 25,
          isActive: true,
          statistics: {
            solvedBy: 892,
            attemptedBy: 1654,
            likes: 567,
            dislikes: 23,
            acceptanceRate: 67
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Longest Substring Without Repeating Characters',
          slug: 'longest-substring-without-repeating-characters',
          description: 'Given a string s, find the length of the longest substring without repeating characters.',
          difficulty: 'medium',
          category: 'string',
          tags: ['string', 'sliding-window', 'hash-table'],
          examples: [{
            input: 's = "abcabcbb"',
            output: '3',
            explanation: 'The answer is "abc", with the length of 3.'
          }],
          testCases: [
            {
              input: '"abcabcbb"',
              expectedOutput: '3',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Use sliding window technique with a hash set.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 30,
          isActive: true,
          statistics: {
            solvedBy: 1654,
            attemptedBy: 2890,
            likes: 1234,
            dislikes: 67,
            acceptanceRate: 73
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Valid Parentheses',
          slug: 'valid-parentheses',
          description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
          difficulty: 'easy',
          category: 'stack',
          tags: ['stack', 'string'],
          examples: [{
            input: 's = "()"',
            output: 'true',
            explanation: 'The string has valid parentheses.'
          }],
          testCases: [
            {
              input: '"()"',
              expectedOutput: 'true',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Use a stack to keep track of opening brackets.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 10,
          isActive: true,
          statistics: {
            solvedBy: 3421,
            attemptedBy: 4200,
            likes: 2134,
            dislikes: 34,
            acceptanceRate: 91
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Median of Two Sorted Arrays',
          slug: 'median-of-two-sorted-arrays',
          description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
          difficulty: 'hard',
          category: 'array',
          tags: ['array', 'binary-search', 'divide-and-conquer'],
          examples: [{
            input: 'nums1 = [1,3], nums2 = [2]',
            output: '2.00000',
            explanation: 'merged array = [1,2,3] and median is 2.'
          }],
          testCases: [
            {
              input: '[1,3]\n[2]',
              expectedOutput: '2.00000',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Try to find a solution with O(log(min(m,n))) time complexity.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 45,
          isActive: true,
          statistics: {
            solvedBy: 567,
            attemptedBy: 1892,
            likes: 345,
            dislikes: 156,
            acceptanceRate: 45
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Reverse Integer',
          slug: 'reverse-integer',
          description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
          difficulty: 'medium',
          category: 'math',
          tags: ['math'],
          examples: [{
            input: 'x = 123',
            output: '321',
            explanation: 'The reversed integer is 321.'
          }],
          testCases: [
            {
              input: '123',
              expectedOutput: '321',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Check for integer overflow.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 20,
          isActive: true,
          statistics: {
            solvedBy: 2134,
            attemptedBy: 3567,
            likes: 892,
            dislikes: 234,
            acceptanceRate: 68
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Binary Tree Inorder Traversal',
          slug: 'binary-tree-inorder-traversal',
          description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
          difficulty: 'easy',
          category: 'tree',
          tags: ['stack', 'tree', 'depth-first-search', 'binary-tree'],
          examples: [{
            input: 'root = [1,null,2,3]',
            output: '[1,3,2]',
            explanation: 'Inorder traversal visits left, root, right.'
          }],
          testCases: [
            {
              input: '[1,null,2,3]',
              expectedOutput: '[1,3,2]',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Try both recursive and iterative solutions.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 15,
          isActive: true,
          statistics: {
            solvedBy: 2789,
            attemptedBy: 3456,
            likes: 1567,
            dislikes: 67,
            acceptanceRate: 87
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        },
        {
          title: 'Maximum Subarray',
          slug: 'maximum-subarray',
          description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
          difficulty: 'medium',
          category: 'dp',
          tags: ['array', 'divide-and-conquer', 'dynamic-programming'],
          examples: [{
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: '[4,-1,2,1] has the largest sum = 6.'
          }],
          testCases: [
            {
              input: '[-2,1,-3,4,-1,2,1,-5,4]',
              expectedOutput: '6',
              isHidden: false
            }
          ],
          hints: [{
            order: 1,
            content: 'Consider Kadane\'s algorithm.',
            difficulty: 'gentle'
          }],
          solutions: [],
          estimatedTime: 25,
          isActive: true,
          statistics: {
            solvedBy: 1890,
            attemptedBy: 2567,
            likes: 1234,
            dislikes: 89,
            acceptanceRate: 76
          },
          bookmarkedBy: [],
          likedBy: [],
          dislikedBy: []
        }
      ];

      await Problem.insertMany(sampleProblems);
      console.log(`Created ${sampleProblems.length} sample problems`);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const backupDatabase = async (collectionName = null) => {
  try {
    const collections = collectionName ? [collectionName] : ['users', 'problems', 'submissions'];
    const backup = {};

    for (const collection of collections) {
      const Model = mongoose.model(collection);
      backup[collection] = await Model.find({}).lean();
    }

    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    console.log(`Database backup created: ${filename}`);
    
    return filepath;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

const restoreDatabase = async (backupPath) => {
  try {
    const fs = require('fs');
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    for (const [collectionName, data] of Object.entries(backup)) {
      const Model = mongoose.model(collectionName);
      await Model.deleteMany({});
      await Model.insertMany(data);
      console.log(`Restored ${data.length} documents to ${collectionName}`);
    }

    console.log('Database restored successfully');
  } catch (error) {
    console.error('Error restoring database:', error);
    throw error;
  }
};

const getStats = async () => {
  try {
    const User = require('./models/User');
    const { Problem, Submission } = require('./models/Problem');

    const stats = {
      users: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      problems: await Problem.countDocuments(),
      submissions: await Submission.countDocuments(),
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        status: getConnectionStatus().status
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

const healthCheck = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connection: getConnectionStatus()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  connectDB,
  setupDatabase,
  createIndexes,
  getConnectionStatus,
  closeConnection,
  dropDatabase,
  seedDatabase,
  backupDatabase,
  restoreDatabase,
  getStats,
  healthCheck
};