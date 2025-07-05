const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= 6 && password.length <= 128;
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
};

const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateLanguage = (language) => {
  const validLanguages = [
    'javascript', 'python', 'java', 'cpp', 'c', 
    'csharp', 'go', 'rust', 'swift', 'kotlin'
  ];
  return validLanguages.includes(language);
};

const validateDifficulty = (difficulty) => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(difficulty);
};

const validateCategory = (category) => {
  const validCategories = [
    'array', 'string', 'linkedlist', 'tree', 'graph', 'dp', 'greedy',
    'backtracking', 'sorting', 'searching', 'math', 'bit-manipulation',
    'two-pointers', 'sliding-window', 'stack', 'queue', 'heap', 'trie',
    'union-find', 'design', 'simulation'
  ];
  return validCategories.includes(category);
};

const validateCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  const trimmedCode = code.trim();
  return trimmedCode.length > 0 && trimmedCode.length <= 50000;
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  
  const validPage = !isNaN(parsedPage) && parsedPage > 0;
  const validLimit = !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100;
  
  return {
    page: validPage ? parsedPage : 1,
    limit: validLimit ? parsedLimit : 20
  };
};

const validateTestCase = (testCase) => {
  if (!testCase || typeof testCase !== 'object') {
    return false;
  }
  const { input, expectedOutput } = testCase;
  return (
    typeof input === 'string' && 
    typeof expectedOutput === 'string' &&
    input.length > 0 && 
    expectedOutput.length > 0
  );
};

const validateProblemData = (problemData) => {
  const { title, description, difficulty, category, testCases } = problemData;
  const errors = [];
  
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!validateDifficulty(difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }
  
  if (!validateCategory(category)) {
    errors.push('Invalid category');
  }
  
  if (!Array.isArray(testCases) || testCases.length === 0) {
    errors.push('At least one test case is required');
  } else {
    const invalidTestCases = testCases.filter(tc => !validateTestCase(tc));
    if (invalidTestCases.length > 0) {
      errors.push('Invalid test case format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateRegistrationData = (data) => {
  const { name, email, password } = data;
  const errors = [];
  
  if (!validateName(name)) {
    errors.push('Name must be between 2 and 50 characters');
  }
  
  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!validatePassword(password)) {
    errors.push('Password must be between 6 and 128 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLoginData = (data) => {
  const { email, password } = data;
  const errors = [];
  
  if (!validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateSubmissionData = (data) => {
  const { problemId, code, language } = data;
  const errors = [];
  
  if (!validateObjectId(problemId)) {
    errors.push('Valid problem ID is required');
  }
  
  if (!validateCode(code)) {
    errors.push('Valid code is required');
  }
  
  if (!validateLanguage(language)) {
    errors.push('Valid programming language is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateObjectId,
  validateLanguage,
  validateDifficulty,
  validateCategory,
  validateCode,
  validateUrl,
  sanitizeString,
  validatePagination,
  validateTestCase,
  validateProblemData,
  validateRegistrationData,
  validateLoginData,
  validateSubmissionData
};