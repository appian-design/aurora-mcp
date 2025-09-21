import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// Configuration schema using Zod for validation
const DocumentationSourceSchema = z.object({
  enabled: z.boolean().default(true),
  path: z.string(),
  repo: z.string().url(),
  branch: z.string().default("main"),
  priority: z.number().int().positive(),
  auth_required: z.boolean().default(false),
  submodule_path: z.string().optional(),
});

const ConfigSchema = z.object({
  documentation: z.object({
    sources: z.object({
      public: DocumentationSourceSchema,
      internal: DocumentationSourceSchema.optional(),
    }),
  }),
  refresh_interval: z.number().int().positive().default(300), // 5 minutes in seconds
  cache_enabled: z.boolean().default(true),
});

export type DocumentationSource = z.infer<typeof DocumentationSourceSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Default configuration
const DEFAULT_CONFIG: Config = {
  documentation: {
    sources: {
      public: {
        enabled: true,
        path: "./docs-public",
        repo: "https://github.com/appian-design/aurora.git",
        branch: "main",
        priority: 1,
        auth_required: false,
      },
    },
  },
  refresh_interval: 300,
  cache_enabled: true,
};

// Environment variable mappings
interface EnvConfig {
  ENABLE_INTERNAL_DOCS?: string;
  INTERNAL_DOCS_TOKEN?: string;
  DOCS_REFRESH_INTERVAL?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
}

/**
 * Load environment variable from .env file or process.env
 */
function loadEnvVariable(variableName: string): string {
  // Get the current file's directory (ES module equivalent of __dirname)
  const currentDir = dirname(fileURLToPath(import.meta.url));

  // Try multiple possible locations for .env file
  const possiblePaths = [
    join(process.cwd(), ".env"),
    join(currentDir, "..", ".env"),
    join(currentDir, "..", "..", ".env"),
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

  // Fall back to environment variable
  return process.env[variableName] || "";
}

/**
 * Load configuration from file and environment variables
 */
export function loadConfig(): Config {
  let config = { ...DEFAULT_CONFIG };

  // Try to load from config.yml file
  const configPath = join(process.cwd(), "config.yml");
  if (existsSync(configPath)) {
    try {
      const configFile = readFileSync(configPath, "utf8");
      const yamlConfig = parseYaml(configFile);
      config = mergeConfigs(config, yamlConfig);
    } catch (error) {
      console.error("[CONFIG] Failed to load config.yml:", error);
    }
  }

  // Override with environment variables
  config = applyEnvironmentOverrides(config);

  // Validate final configuration
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error("[CONFIG] Configuration validation failed:", error);
    throw new Error("Invalid configuration");
  }
}

/**
 * Simple YAML parser for basic configuration
 */
function parseYaml(yamlContent: string): Partial<Config> {
  const lines = yamlContent.split("\n");
  const result: any = {};
  let currentPath: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;
    const colonIndex = trimmed.indexOf(":");

    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    // Adjust current path based on indentation
    const level = Math.floor(indent / 2);
    currentPath = currentPath.slice(0, level);
    currentPath.push(key);

    // Set value in nested object
    let current = result;
    for (let i = 0; i < currentPath.length - 1; i++) {
      if (!current[currentPath[i]]) {
        current[currentPath[i]] = {};
      }
      current = current[currentPath[i]];
    }

    // Parse value
    if (value) {
      current[key] = parseValue(value);
    } else {
      current[key] = {};
    }
  }

  return result;
}

/**
 * Parse YAML value to appropriate type
 */
function parseValue(value: string): any {
  // Remove quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  // Boolean values
  if (value === "true") return true;
  if (value === "false") return false;

  // Numeric values
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

  return value;
}

/**
 * Merge two configuration objects
 */
function mergeConfigs(base: Config, override: Partial<Config>): Config {
  return {
    ...base,
    ...override,
    documentation: {
      ...base.documentation,
      ...override.documentation,
      sources: {
        ...base.documentation.sources,
        ...override.documentation?.sources,
      },
    },
  };
}

/**
 * Apply environment variable overrides
 */
function applyEnvironmentOverrides(config: Config): Config {
  // Configure public repository from environment variables
  const githubOwner = loadEnvVariable("GITHUB_OWNER");
  const githubRepo = loadEnvVariable("GITHUB_REPO");
  const githubToken = loadEnvVariable("GITHUB_TOKEN");
  
  if (githubOwner && githubRepo) {
    config.documentation.sources.public.repo = `https://github.com/${githubOwner}/${githubRepo}.git`;
  }
  
  // Enable authentication for public source if token is available (to avoid rate limits)
  if (githubToken) {
    config.documentation.sources.public.auth_required = true;
  }

  // Enable internal docs if environment variable is set
  if (loadEnvVariable("ENABLE_INTERNAL_DOCS") === "true") {
    const internalOwner = loadEnvVariable("INTERNAL_GITHUB_OWNER") || githubOwner;
    const internalRepo = loadEnvVariable("INTERNAL_GITHUB_REPO") || "design-system-docs-internal";
    
    // Preserve existing internal config or create new one
    const existingInternal = config.documentation.sources.internal;
    
    config.documentation.sources.internal = {
      enabled: true,
      path: existingInternal?.path || "./docs-internal",
      repo: `https://github.com/${internalOwner}/${internalRepo}.git`,
      branch: existingInternal?.branch || "main",
      priority: existingInternal?.priority || 2,
      auth_required: true,
      // Preserve submodule_path from YAML config
      ...(existingInternal?.submodule_path && { submodule_path: existingInternal.submodule_path }),
    };
  }

  // Set refresh interval
  const refreshInterval = loadEnvVariable("DOCS_REFRESH_INTERVAL");
  if (refreshInterval) {
    const interval = parseInt(refreshInterval, 10);
    if (!isNaN(interval)) {
      config.refresh_interval = interval;
    }
  }

  return config;
}

/**
 * Get authentication token for a source
 */
export function getAuthToken(source: DocumentationSource): string | undefined {
  if (!source.auth_required) return undefined;

  // For internal docs, use INTERNAL_DOCS_TOKEN
  if (source.priority > 1) {
    return loadEnvVariable("INTERNAL_DOCS_TOKEN");
  }

  // For public docs that require auth, use GITHUB_TOKEN
  return loadEnvVariable("GITHUB_TOKEN");
}

/**
 * Validate that required authentication is available
 */
export function validateAuth(config: Config): void {
  const sources = Object.values(config.documentation.sources).filter(Boolean);

  for (const source of sources) {
    if (source.auth_required && !getAuthToken(source)) {
      const tokenName =
        source.priority > 1 ? "INTERNAL_DOCS_TOKEN" : "GITHUB_TOKEN";
      throw new Error(
        `Authentication required for source but ${tokenName} not provided`
      );
    }
  }
}
