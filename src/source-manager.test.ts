import { SourceManager } from './source-manager.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
function loadEnvVariable(variableName: string): string {
  const possiblePaths = [
    join(process.cwd(), ".env"),
    join(process.cwd(), "..", ".env"),
  ];

  for (const envPath of possiblePaths) {
    try {
      const envContent = readFileSync(envPath, "utf8");
      const regex = new RegExp(`^${variableName}=(.+)`, 'm');
      const match = envContent.match(regex);
      if (match) {
        return match[1].trim();
      }
    } catch (error) {
      // Continue to next path
    }
  }

  return process.env[variableName] || "";
}

// Simple test runner
function test(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      console.log(`✅ ${name}`);
    } catch (error) {
      console.error(`❌ ${name}: ${error}`);
    }
  };
}

console.log('Running source manager tests...\n');

// Test 1: Source manager initialization
await test('SourceManager initializes correctly', () => {
  const sourceManager = new SourceManager();
  
  const status = sourceManager.getSourceStatus();
  if (status.length === 0) {
    throw new Error('Should have at least one source configured');
  }
  
  const publicSource = status.find(s => s.name === 'public');
  if (!publicSource) {
    throw new Error('Public source should be configured');
  }
  
  if (!publicSource.enabled) {
    throw new Error('Public source should be enabled by default');
  }
})();

// Test 2: Source status reporting
await test('getSourceStatus returns correct information', () => {
  const sourceManager = new SourceManager();
  
  const status = sourceManager.getSourceStatus();
  
  for (const source of status) {
    if (typeof source.name !== 'string') {
      throw new Error('Source name should be a string');
    }
    
    if (typeof source.enabled !== 'boolean') {
      throw new Error('Source enabled should be a boolean');
    }
    
    if (typeof source.priority !== 'number') {
      throw new Error('Source priority should be a number');
    }
    
    if (typeof source.auth_required !== 'boolean') {
      throw new Error('Source auth_required should be a boolean');
    }
  }
})();

// Test 3: Cache refresh
await test('refreshSources clears cache', async () => {
  const sourceManager = new SourceManager();
  
  // This should not throw
  await sourceManager.refreshSources();
})();

// Test 4: Content fetching with fallback
await test('getContent handles missing files gracefully', async () => {
  const sourceManager = new SourceManager();
  
  // Try to get content for a non-existent file
  const content = await sourceManager.getContent('non-existent-file.md');
  
  // Should return null for missing files
  if (content !== null) {
    throw new Error('Should return null for non-existent files');
  }
})();

// Test 5: Source manager with internal docs enabled
const internalDocsToken = loadEnvVariable("INTERNAL_DOCS_TOKEN");
if (internalDocsToken) {
  await test('SourceManager works with internal docs enabled', () => {
    process.env.ENABLE_INTERNAL_DOCS = 'true';
    
    const sourceManager = new SourceManager();
    const status = sourceManager.getSourceStatus();
    
    const internalSource = status.find(s => s.name === 'internal');
    if (!internalSource) {
      throw new Error('Internal source should be configured when enabled');
    }
    
    if (internalSource.priority <= 1) {
      throw new Error('Internal source should have higher priority than public');
    }
    
    delete process.env.ENABLE_INTERNAL_DOCS;
  })();
} else {
  console.log('⏭️  Skipping internal docs test (INTERNAL_DOCS_TOKEN not set)');
}

console.log('\nSource manager tests completed!');