import { loadConfig, getAuthToken, type Config, type DocumentationSource } from './config.js';

// Enhanced interface for content with source attribution
export interface SourcedContent {
  content: string;
  frontmatter: Record<string, any>;
  source: 'public' | 'internal';
  overrides?: 'public' | 'internal';
  last_updated?: string;
  file_path: string;
}

// Interface for parsed markdown content with source info
export interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  content: string;
  designSection: string;
  developmentSection: string;
  source: 'public' | 'internal';
  last_updated?: string;
}

// Content cache for performance
interface ContentCache {
  [key: string]: {
    content: SourcedContent;
    timestamp: number;
  };
}

export class SourceManager {
  private config: Config;
  private cache: ContentCache = {};
  private lastRefresh: number = 0;

  constructor() {
    this.config = loadConfig();
  }

  /**
   * Get content from the appropriate source(s) with merging logic
   */
  async getContent(filePath: string): Promise<SourcedContent | null> {
    const cacheKey = filePath;
    
    // Check cache first
    if (this.config.cache_enabled && this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      const age = Date.now() - cached.timestamp;
      if (age < this.config.refresh_interval * 1000) {
        return cached.content;
      }
    }

    // Get content from all enabled sources
    const sources = this.getEnabledSources();
    const contentResults: Array<{ content: ParsedMarkdown; source: DocumentationSource; sourceKey: 'public' | 'internal' }> = [];

    for (const [sourceKey, source] of sources) {
      try {
        const content = await this.fetchFromSource(source, filePath);
        if (content) {
          contentResults.push({ 
            content: { ...content, source: sourceKey }, 
            source, 
            sourceKey 
          });
        }
      } catch (error) {
        console.error(`[SOURCE-MANAGER] Failed to fetch from ${sourceKey}:`, error);
      }
    }

    if (contentResults.length === 0) {
      return null;
    }

    // Merge content based on priority
    const mergedContent = this.mergeContent(contentResults, filePath);
    
    // Cache the result
    if (this.config.cache_enabled) {
      this.cache[cacheKey] = {
        content: mergedContent,
        timestamp: Date.now()
      };
    }

    return mergedContent;
  }

  /**
   * Get list of available sources and their status
   */
  getSourceStatus(): Array<{
    name: 'public' | 'internal';
    enabled: boolean;
    priority: number;
    auth_required: boolean;
    last_sync?: string;
  }> {
    const sources = Object.entries(this.config.documentation.sources)
      .filter(([_, source]) => source !== undefined) as Array<['public' | 'internal', DocumentationSource]>;

    return sources.map(([name, source]) => ({
      name,
      enabled: source.enabled,
      priority: source.priority,
      auth_required: source.auth_required,
      last_sync: this.lastRefresh ? new Date(this.lastRefresh).toISOString() : undefined
    }));
  }

  /**
   * Clear cache and force refresh
   */
  async refreshSources(): Promise<void> {
    this.cache = {};
    this.lastRefresh = Date.now();
  }

  /**
   * Get enabled sources sorted by priority
   */
  private getEnabledSources(): Array<['public' | 'internal', DocumentationSource]> {
    const sources = Object.entries(this.config.documentation.sources)
      .filter(([_, source]) => source?.enabled) as Array<['public' | 'internal', DocumentationSource]>;
    
    // Sort by priority (lower numbers first, higher priority sources last for override logic)
    return sources.sort(([, a], [, b]) => a.priority - b.priority);
  }

  /**
   * Fetch content from a specific source
   */
  private async fetchFromSource(source: DocumentationSource, filePath: string): Promise<ParsedMarkdown | null> {
    try {
      // For now, use GitHub API (in future this could support local files, git clones, etc.)
      const repoUrl = source.repo;
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
      
      if (!match) {
        throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
      }

      const [, owner, repo] = match;
      
      // Include submodule_path if specified
      const basePath = source.submodule_path ? `${source.submodule_path}/` : '';
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${basePath}${filePath}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'design-system-mcp-server'
      };

      const token = getAuthToken(source);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // File not found in this source
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const content = atob(data.content);
      
      return this.parseFrontmatter(content);
    } catch (error) {
      console.error(`[SOURCE-MANAGER] Error fetching from source:`, error);
      return null;
    }
  }

  /**
   * Parse frontmatter from markdown content
   */
  private parseFrontmatter(content: string): ParsedMarkdown {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    let frontmatter = {};
    let markdownContent = content;
    
    if (match) {
      const frontmatterText = match[1];
      markdownContent = match[2];
      
      // Parse YAML-like frontmatter
      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          (frontmatter as any)[key] = value;
        }
      });
    }
    
    // Extract Design and Development sections
    const designMatch = markdownContent.match(/## Design\n([\s\S]*?)(?=## Development|$)/);
    const developmentMatch = markdownContent.match(/## Development\n([\s\S]*?)$/);
    
    return {
      frontmatter,
      content: markdownContent,
      designSection: designMatch ? designMatch[1].trim() : '',
      developmentSection: developmentMatch ? developmentMatch[1].trim() : '',
      source: 'public', // Will be overridden by caller
      last_updated: (frontmatter as any).last_updated
    };
  }

  /**
   * Merge content from multiple sources based on priority
   */
  private mergeContent(
    contentResults: Array<{ content: ParsedMarkdown; source: DocumentationSource; sourceKey: 'public' | 'internal' }>,
    filePath: string
  ): SourcedContent {
    // Sort by priority (higher priority last to override)
    contentResults.sort((a, b) => a.source.priority - b.source.priority);
    
    // Use the highest priority content as base
    const primaryResult = contentResults[contentResults.length - 1];
    const primaryContent = primaryResult.content;
    
    // Determine if this is an override situation
    let overrides: 'public' | 'internal' | undefined;
    if (contentResults.length > 1) {
      const lowerPrioritySource = contentResults[0].sourceKey;
      overrides = lowerPrioritySource;
    }

    // Merge frontmatter from all sources (higher priority wins for conflicts)
    const mergedFrontmatter = {};
    for (const result of contentResults) {
      Object.assign(mergedFrontmatter, result.content.frontmatter);
    }

    return {
      content: primaryContent.content,
      frontmatter: mergedFrontmatter,
      source: primaryResult.sourceKey,
      overrides,
      last_updated: primaryContent.last_updated || new Date().toISOString(),
      file_path: filePath
    };
  }
}