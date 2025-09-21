import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { designSystemData, DesignSystemItem, GITHUB_CONFIG } from "./design-system-data.js";
import { SourceManager, type SourcedContent } from "./source-manager.js";

// Interface for parsed markdown content
interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  content: string;
  designSection: string;
  developmentSection: string;
}

// Helper function to parse frontmatter from markdown
function parseFrontmatter(content: string): ParsedMarkdown {
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
    developmentSection: developmentMatch ? developmentMatch[1].trim() : ''
  };
}

// Helper function to fetch content from GitHub repository
async function fetchRepoContent(filePath: string): Promise<ParsedMarkdown | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    console.error(`[DEBUG] Fetching: ${filePath}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'design-system-mcp-server'
      }
    });
    
    if (!response.ok) {
      console.error(`[ERROR] GitHub API error for ${filePath}: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // GitHub API returns base64 encoded content
    const content = atob(data.content);
    console.error(`[DEBUG] Content fetched successfully: ${content.length} characters`);
    
    const parsed = parseFrontmatter(content);
    console.error(`[DEBUG] Content parsed: Design=${parsed.designSection.length}chars, Development=${parsed.developmentSection.length}chars`);
    
    return parsed;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch repo content for ${filePath}:`, error);
    return null;
  }
}

// Create server instance
const server = new McpServer({
  name: "design-system",
  version: "1.0.0",
});

// Initialize source manager
const sourceManager = new SourceManager();

// Helper function to get SAIL guidance
async function getSailGuidance(): Promise<string> {
  const codingGuides = designSystemData['coding-guides'];
  const sailGuide = codingGuides['sail'];
  
  if (!sailGuide) {
    return "SAIL guidance not available.";
  }
  
  const sourcedContent = await sourceManager.getContent(sailGuide.filePath);
  
  if (!sourcedContent) {
    return "SAIL guidance could not be loaded.";
  }
  
  return sourcedContent.content;
}

// Tool 1: Get content sources status
server.tool(
  "get-content-sources",
  "Get information about available documentation sources and their status",
  {},
  async () => {
    const sources = sourceManager.getSourceStatus();
    
    const sourceInfo = sources.map(source => 
      `**${source.name.toUpperCase()} SOURCE**\n` +
      `- Enabled: ${source.enabled}\n` +
      `- Priority: ${source.priority}\n` +
      `- Authentication Required: ${source.auth_required}\n` +
      `- Last Sync: ${source.last_sync || 'Never'}`
    ).join('\n\n');
    
    return {
      content: [
        {
          type: "text",
          text: `Documentation Sources Status:\n\n${sourceInfo}`,
        },
      ],
    };
  },
);

// Tool 2: Refresh documentation sources
server.tool(
  "refresh-sources",
  "Trigger manual refresh of documentation sources",
  {},
  async () => {
    await sourceManager.refreshSources();
    
    return {
      content: [
        {
          type: "text",
          text: "Documentation sources refreshed successfully. Cache cleared and sources will be re-synced on next request.",
        },
      ],
    };
  },
);

// Tool 3: List all categories
server.tool(
  "list-categories",
  "List all design system categories",
  {},
  async () => {
    const categories = Object.keys(designSystemData);
    
    return {
      content: [
        {
          type: "text",
          text: `Available design system categories: ${categories.join(", ")}`,
        },
      ],
    };
  },
);

// Tool 4: List components in a category (enhanced with source filtering)
server.tool(
  "list-components",
  "List components in a specific category with source information",
  {
    category: z.string().describe("Design system category (components, layouts, patterns)"),
    includeInternal: z.boolean().optional().describe("Include internal documentation components (default: false)"),
    sourceOnly: z.enum(["public", "internal", "all"]).optional().describe("Filter by specific source"),
  },
  async ({ category, includeInternal, sourceOnly }) => {
    // Default to including internal if internal source is enabled
    const defaultIncludeInternal = sourceManager.getSourceStatus().some(s => s.name === 'internal' && s.enabled);
    const shouldIncludeInternal = includeInternal !== undefined ? includeInternal : defaultIncludeInternal;
    const normalizedCategory = category.toLowerCase();
    
    if (!(normalizedCategory in designSystemData)) {
      return {
        content: [
          {
            type: "text",
            text: `Category not found. Available categories: ${Object.keys(designSystemData).join(", ")}`,
          },
        ],
      };
    }
    
    const items = [];
    const categoryData = designSystemData[normalizedCategory];
    
    for (const [key, component] of Object.entries(categoryData)) {
      const item = component as DesignSystemItem;
      
      // Check if content exists and get source information
      const sourcedContent = await sourceManager.getContent(item.filePath);
      
      if (!sourcedContent) {
        continue; // Skip if content not available
      }
      
      // Apply access control
      if (sourcedContent.source === 'internal' && !shouldIncludeInternal) {
        continue; // Skip internal content when not requested
      }
      
      // Apply source filtering
      if (sourceOnly && sourceOnly !== 'all' && sourcedContent.source !== sourceOnly) {
        continue; // Skip if doesn't match source filter
      }
      
      // Add source attribution to the listing
      const sourceLabel = sourcedContent.source.toUpperCase();
      const overrideInfo = sourcedContent.overrides ? ` (overrides ${sourcedContent.overrides.toUpperCase()})` : '';
      
      items.push(`**${key}**: ${item.title} - ${item.body}\n  *Source: ${sourceLabel}${overrideInfo}*`);
    }
    
    if (items.length === 0) {
      const accessNote = !shouldIncludeInternal ? " (use includeInternal=true to see internal components)" : "";
      return {
        content: [
          {
            type: "text",
            text: `No accessible components found in ${normalizedCategory}${accessNote}`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Components in ${normalizedCategory}:\n\n${items.join("\n\n")}`,
        },
      ],
    };
  },
);

// Tool 7: Get SAIL guidance
server.tool(
  "get-component-details",
  "Get detailed information about a specific component with source attribution",
  {
    category: z.string().describe("Design system category (components, layouts, patterns)"),
    componentName: z.string().describe("Name of the component, layout, or pattern"),
    includeInternal: z.boolean().optional().describe("Include internal documentation if available (default: false)"),
    sourceOnly: z.enum(["public", "internal", "all"]).optional().describe("Filter by specific source"),
    includeSailGuidance: z.boolean().optional().describe("Include SAIL coding guidance (default: true for components/patterns/layouts)"),
  },
  async ({ category, componentName, includeInternal = false, sourceOnly, includeSailGuidance }) => {
    const normalizedCategory = category.toLowerCase();
    const normalizedComponentName = componentName.toLowerCase();
    
    if (!(normalizedCategory in designSystemData)) {
      return {
        content: [
          {
            type: "text",
            text: `Category not found. Available categories: ${Object.keys(designSystemData).join(", ")}`,
          },
        ],
      };
    }
    
    const categoryData = designSystemData[normalizedCategory];
    
    if (!(normalizedComponentName in categoryData)) {
      return {
        content: [
          {
            type: "text",
            text: `Component not found in ${normalizedCategory}. Available components: ${Object.keys(categoryData).join(", ")}`,
          },
        ],
      };
    }
    
    const component = categoryData[normalizedComponentName] as DesignSystemItem;
    
    // Use new source manager to get content
    const sourcedContent = await sourceManager.getContent(component.filePath);
    
    if (!sourcedContent) {
      console.error(`[ERROR] Unable to fetch content for ${component.title} at ${component.filePath}`);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch details for ${component.title}.\n\nBasic information:\n${component.body}\n\nFile path: ${component.filePath}\n\nNote: This may be due to GitHub API limits, network issues, or authentication problems. Check server logs for details.`,
          },
        ],
      };
    }

    // Apply source filtering
    if (sourceOnly && sourceOnly !== 'all' && sourcedContent.source !== sourceOnly) {
      return {
        content: [
          {
            type: "text",
            text: `Component ${component.title} not available from ${sourceOnly} source. Available from: ${sourcedContent.source}`,
          },
        ],
      };
    }

    // Check internal access
    if (sourcedContent.source === 'internal' && !includeInternal) {
      return {
        content: [
          {
            type: "text",
            text: `Component ${component.title} is only available in internal documentation. Set includeInternal=true to access.`,
          },
        ],
      };
    }
    
    let response = `# ${component.title}\n\n${component.body}\n\n`;
    
    // Add source attribution
    response += `**Source:** ${sourcedContent.source.toUpperCase()}`;
    if (sourcedContent.overrides) {
      response += ` (overrides ${sourcedContent.overrides})`;
    }
    response += '\n';
    
    // Add frontmatter info if available
    if (Object.keys(sourcedContent.frontmatter).length > 0) {
      response += `**Status:** ${sourcedContent.frontmatter.status || 'Unknown'}\n`;
      if (sourcedContent.last_updated) {
        response += `**Last Updated:** ${sourcedContent.last_updated}\n`;
      }
      response += '\n';
    }
    
    // Parse content sections (reuse existing logic)
    const parsedContent = parseFrontmatter(sourcedContent.content);
    
    // Add Design section
    if (parsedContent.designSection) {
      response += `## Design\n\n${parsedContent.designSection}\n\n`;
    }
    
    // Add Development section
    if (parsedContent.developmentSection) {
      response += `## Development\n\n${parsedContent.developmentSection}`;
    }
    
    // If no sections found, show full content
    if (!parsedContent.designSection && !parsedContent.developmentSection) {
      response += `## Content\n\n${sourcedContent.content}`;
    }
    
    // Auto-include SAIL guidance for relevant categories
    const shouldIncludeSail = includeSailGuidance !== false && 
      ['components', 'patterns', 'layouts'].includes(normalizedCategory);
    
    if (shouldIncludeSail) {
      const sailGuidance = await getSailGuidance();
      response += `\n\n---\n\n## SAIL Coding Guidance\n\n${sailGuidance}`;
    }
    
    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  },
);

// Tool 6: Search across all components (enhanced with source filtering)
server.tool(
  "search-design-system",
  "Search for components, layouts, or patterns by keyword with source filtering",
  {
    keyword: z.string().describe("Keyword to search for in titles and descriptions"),
    includeInternal: z.boolean().optional().describe("Include internal documentation in search (default: false)"),
    sourceOnly: z.enum(["public", "internal", "all"]).optional().describe("Filter results by specific source"),
  },
  async ({ keyword, includeInternal = false, sourceOnly }) => {
    const normalizedKeyword = keyword.toLowerCase();
    const results = [];
    
    // Search through all categories and components
    for (const [categoryName, category] of Object.entries(designSystemData)) {
      for (const [componentName, component] of Object.entries(category)) {
        if (
          component.title.toLowerCase().includes(normalizedKeyword) || 
          component.body.toLowerCase().includes(normalizedKeyword)
        ) {
          // Get source information for this component
          const sourcedContent = await sourceManager.getContent(component.filePath);
          
          // Apply source filtering
          if (sourceOnly && sourceOnly !== 'all' && sourcedContent?.source !== sourceOnly) {
            continue;
          }
          
          // Check internal access
          if (sourcedContent?.source === 'internal' && !includeInternal) {
            continue;
          }
          
          results.push({
            category: categoryName,
            name: componentName,
            title: component.title,
            description: component.body,
            source: sourcedContent?.source || 'unknown',
            overrides: sourcedContent?.overrides
          });
        }
      }
    }
    
    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for keyword "${keyword}" with the specified filters.`,
          },
        ],
      };
    }
    
    const formattedResults = results.map(result => {
      let resultText = `**Category:** ${result.category}\n**Component:** ${result.name}\n**Title:** ${result.title}\n**Description:** ${result.description}\n**Source:** ${result.source.toUpperCase()}`;
      if (result.overrides) {
        resultText += ` (overrides ${result.overrides})`;
      }
      return resultText;
    });
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} results for "${keyword}":\n\n${formattedResults.join("\n\n")}`,
        },
      ],
    };
  },
);

// Tool 7: Get SAIL guidance
server.tool(
  "get-sail-guidance",
  "Get SAIL coding guidance and best practices",
  {
    technology: z.string().describe("Technology or framework (e.g., 'sail', 'html', 'css')").optional(),
  },
  async ({ technology }) => {
    // If no technology specified, list available guides
    if (!technology) {
      const codingGuides = designSystemData['coding-guides'];
      const guides = Object.entries(codingGuides).map(
        ([key, guide]) => `${key}: ${guide.title} - ${guide.body}`
      );
      
      return {
        content: [
          {
            type: "text",
            text: `Available coding guides:\n\n${guides.join("\n\n")}\n\nUse get-component-details with category 'coding-guides' to access specific guides.`,
          },
        ],
      };
    }
    
    // Look for technology-specific guide
    const normalizedTech = technology.toLowerCase();
    const codingGuides = designSystemData['coding-guides'];
    
    // Check if there's a direct match or partial match
    let matchedGuide = null;
    let matchedKey = null;
    
    for (const [key, guide] of Object.entries(codingGuides)) {
      if (key.includes(normalizedTech) || guide.title.toLowerCase().includes(normalizedTech)) {
        matchedGuide = guide;
        matchedKey = key;
        break;
      }
    }
    
    if (!matchedGuide) {
      return {
        content: [
          {
            type: "text",
            text: `No coding guide found for "${technology}". Available guides: ${Object.keys(codingGuides).join(", ")}`,
          },
        ],
      };
    }
    
    // Fetch the full guide content
    const repoContent = await fetchRepoContent(matchedGuide.filePath);
    
    if (!repoContent) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch ${matchedGuide.title} guide. Basic info: ${matchedGuide.body}`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `# ${matchedGuide.title}\n\n${repoContent.content}`,
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Design System MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
