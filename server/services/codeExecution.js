const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const TIMEOUT = 5000;
const MEMORY_LIMIT = 128 * 1024 * 1024;

const createTempFile = async (content, extension) => {
  const tempDir = path.join(__dirname, '../temp');
  
  try {
    await fs.access(tempDir);
  } catch (error) {
    await fs.mkdir(tempDir, { recursive: true });
  }
  
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(tempDir, fileName);
  
  await fs.writeFile(filePath, content);
  return filePath;
};

const cleanupFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

const executeJavaScript = async (code, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      
      const wrappedCode = `
        ${code}
        
        const input = \`${testCase.input}\`;
        const lines = input.trim().split('\\n');
        
        let result;
        if (typeof solve === 'function') {
          result = solve(lines);
        } else if (typeof solution === 'function') {
          result = solution(lines);
        } else {
          result = eval(code);
        }
        
        console.log(JSON.stringify(result));
      `;
      
      const tempFile = await createTempFile(wrappedCode, 'js');
      
      const result = await new Promise((resolve, reject) => {
        const child = spawn('node', [tempFile], {
          timeout: TIMEOUT,
          cwd: path.dirname(tempFile)
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          resolve({
            exitCode: code,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        });
        
        child.on('error', (error) => {
          reject(error);
        });
        
        setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('Time limit exceeded'));
        }, TIMEOUT);
      });
      
      await cleanupFile(tempFile);
      
      const runtime = Date.now() - startTime;
      const output = result.stdout.replace(/"/g, '');
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: output,
        passed: output === testCase.expectedOutput,
        runtime,
        memory: 0,
        error: result.stderr
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        passed: false,
        runtime: TIMEOUT,
        memory: 0,
        error: error.message
      });
    }
  }
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  return {
    status: passedTests === totalTests ? 'accepted' : 'wrong_answer',
    testCasesPassed: passedTests,
    totalTestCases: totalTests,
    results,
    runtime: Math.max(...results.map(r => r.runtime)),
    memory: Math.max(...results.map(r => r.memory)),
    details: {
      output: results.map(r => r.actualOutput).join('\n'),
      stderr: results.map(r => r.error).filter(e => e).join('\n')
    }
  };
};

const executePython = async (code, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      
      const wrappedCode = `
import sys
import json

${code}

input_data = """${testCase.input}"""
lines = input_data.strip().split('\\n')

try:
    if 'solve' in globals():
        result = solve(lines)
    elif 'solution' in globals():
        result = solution(lines)
    else:
        result = None
    
    print(json.dumps(result) if result is not None else "")
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
`;
      
      const tempFile = await createTempFile(wrappedCode, 'py');
      
      const result = await new Promise((resolve, reject) => {
        const child = spawn('python3', [tempFile], {
          timeout: TIMEOUT,
          cwd: path.dirname(tempFile)
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          resolve({
            exitCode: code,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        });
        
        child.on('error', (error) => {
          reject(error);
        });
        
        setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('Time limit exceeded'));
        }, TIMEOUT);
      });
      
      await cleanupFile(tempFile);
      
      const runtime = Date.now() - startTime;
      const output = result.stdout.replace(/"/g, '');
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: output,
        passed: output === testCase.expectedOutput,
        runtime,
        memory: 0,
        error: result.stderr
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        passed: false,
        runtime: TIMEOUT,
        memory: 0,
        error: error.message
      });
    }
  }
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  return {
    status: passedTests === totalTests ? 'accepted' : 'wrong_answer',
    testCasesPassed: passedTests,
    totalTestCases: totalTests,
    results,
    runtime: Math.max(...results.map(r => r.runtime)),
    memory: Math.max(...results.map(r => r.memory)),
    details: {
      output: results.map(r => r.actualOutput).join('\n'),
      stderr: results.map(r => r.error).filter(e => e).join('\n')
    }
  };
};

const executeCode = async (code, language, testCases) => {
  try {
    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      throw new Error('Invalid input parameters');
    }
    
    if (testCases.length === 0) {
      throw new Error('No test cases provided');
    }
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await executeJavaScript(code, testCases);
        
      case 'python':
      case 'py':
        return await executePython(code, testCases);
        
      default:
        return {
          status: 'compilation_error',
          testCasesPassed: 0,
          totalTestCases: testCases.length,
          results: [],
          runtime: 0,
          memory: 0,
          details: {
            output: '',
            stderr: `Language ${language} is not supported yet`
          },
          errorMessage: `Language ${language} is not supported yet`
        };
    }
    
  } catch (error) {
    return {
      status: 'runtime_error',
      testCasesPassed: 0,
      totalTestCases: testCases ? testCases.length : 0,
      results: [],
      runtime: 0,
      memory: 0,
      details: {
        output: '',
        stderr: error.message
      },
      errorMessage: error.message
    };
  }
};

const validateCode = (code, language) => {
  const errors = [];
  
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    errors.push('Code is required');
  }
  
  if (code && code.length > 50000) {
    errors.push('Code is too long (max 50,000 characters)');
  }
  
  if (!language || typeof language !== 'string') {
    errors.push('Programming language is required');
  }
  
  const supportedLanguages = ['javascript', 'js', 'python', 'py'];
  if (language && !supportedLanguages.includes(language.toLowerCase())) {
    errors.push(`Language ${language} is not supported`);
  }
  
  if (code && (code.includes('require(') || code.includes('import '))) {
    if (language.toLowerCase() === 'javascript' && code.includes('require(')) {
      errors.push('require() is not allowed for security reasons');
    }
  }
  
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /process\./,
    /fs\./,
    /child_process/,
    /exec\s*\(/,
    /spawn\s*\(/
  ];
  
  if (code) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push('Code contains potentially dangerous operations');
        break;
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  executeCode,
  validateCode
};