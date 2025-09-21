import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Define the type structure for our design system data
export interface DesignSystemItem {
  title: string;
  body: string;
  filePath: string;
  source?: 'internal' | 'public'; // Optional field to indicate source
}

export interface DesignSystemCategory {
  [key: string]: DesignSystemItem;
}

export interface DesignSystemData {
  branding: DesignSystemCategory;
  'content-style-guide': DesignSystemCategory;
  accessibility: DesignSystemCategory;
  layouts: DesignSystemCategory;
  patterns: DesignSystemCategory;
  components: DesignSystemCategory;
  'coding-guides': DesignSystemCategory;
  [key: string]: DesignSystemCategory;
}

// Load environment variables from .env file
function loadEnvVariable(variableName: string): string {
  // Get the current file's directory (ES module equivalent of __dirname)
  const currentDir = dirname(fileURLToPath(import.meta.url));
  
  // Try multiple possible locations for .env file
  const possiblePaths = [
    join(process.cwd(), '.env'),
    join(currentDir, '..', '.env'),
    join(currentDir, '..', '..', '.env')
  ];
  
  for (const envPath of possiblePaths) {
    try {
      console.error(`[DEBUG] Attempting to load .env from: ${envPath}`);
      const envContent = readFileSync(envPath, 'utf8');
      const regex = new RegExp(`${variableName}=(.+)`);
      const match = envContent.match(regex);
      if (match) {
        const value = match[1].trim();
        if (variableName === 'GITHUB_TOKEN' || variableName === 'INTERNAL_DOCS_TOKEN') {
          console.error(`[DEBUG] ${variableName} loaded from .env: ${value.substring(0, 20)}...`);
        } else {
          console.error(`[DEBUG] ${variableName} loaded from .env: ${value}`);
        }
        return value;
      }
    } catch (error) {
      console.error(`[DEBUG] Failed to load .env from ${envPath}: ${error}`);
    }
  }
  
  // Fall back to environment variable
  const envValue = process.env[variableName] || '';
  if (variableName === 'GITHUB_TOKEN' || variableName === 'INTERNAL_DOCS_TOKEN') {
    console.error(`[DEBUG] Using environment ${variableName}: ${envValue ? envValue.substring(0, 20) + '...' : 'EMPTY'}`);
  } else {
    console.error(`[DEBUG] Using environment ${variableName}: ${envValue || 'EMPTY'}`);
  }
  return envValue;
}

// GitHub repository configuration (legacy - maintained for backward compatibility)
export const GITHUB_CONFIG = {
  owner: loadEnvVariable('GITHUB_OWNER'),
  repo: loadEnvVariable('GITHUB_REPO'),
  token: loadEnvVariable('GITHUB_TOKEN')
};

// Dual-source configuration for the new source manager
export const DUAL_SOURCE_CONFIG = {
  public: {
    enabled: true,
    owner: loadEnvVariable('GITHUB_OWNER'),
    repo: loadEnvVariable('GITHUB_REPO'),
    token: loadEnvVariable('GITHUB_TOKEN'),
    priority: 1
  },
  internal: {
    enabled: loadEnvVariable('ENABLE_INTERNAL_DOCS').toLowerCase() === 'true',
    owner: loadEnvVariable('INTERNAL_GITHUB_OWNER') || loadEnvVariable('GITHUB_OWNER'),
    repo: loadEnvVariable('INTERNAL_GITHUB_REPO') || 'design-system-docs-internal',
    token: loadEnvVariable('INTERNAL_DOCS_TOKEN'),
    priority: 2
  }
};

// Validate configuration
export function validateConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate public repository configuration
  if (!DUAL_SOURCE_CONFIG.public.owner) errors.push('GITHUB_OWNER is required');
  if (!DUAL_SOURCE_CONFIG.public.repo) errors.push('GITHUB_REPO is required');
  if (!DUAL_SOURCE_CONFIG.public.token) errors.push('GITHUB_TOKEN is required');
  
  // Validate internal repository configuration if enabled
  if (DUAL_SOURCE_CONFIG.internal.enabled) {
    if (!DUAL_SOURCE_CONFIG.internal.token) {
      errors.push('INTERNAL_DOCS_TOKEN is required when ENABLE_INTERNAL_DOCS=true');
    }
    if (!DUAL_SOURCE_CONFIG.internal.owner) {
      errors.push('INTERNAL_GITHUB_OWNER is required when ENABLE_INTERNAL_DOCS=true');
    }
    if (!DUAL_SOURCE_CONFIG.internal.repo) {
      errors.push('INTERNAL_GITHUB_REPO is required when ENABLE_INTERNAL_DOCS=true');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export const designSystemData: DesignSystemData = {
  branding: {
    'logo-and-favicon': {
      title: 'Logo and Favicon',
      body: 'Guidelines for using logos and favicons consistently across applications.',
      filePath: 'docs/branding/logo-and-favicon.md'
    },
    'colors': {
      title: 'Colors',
      body: 'Color palette and usage guidelines for the design system.',
      filePath: 'docs/branding/colors.md'
    },
    'icons': {
      title: 'Icons',
      body: 'Icon library and usage guidelines.',
      filePath: 'docs/branding/icons.md'
    },
    'typography': {
      title: 'Typography',
      body: 'Typography scale, fonts, and text styling guidelines.',
      filePath: 'docs/branding/typography.md'
    },
    'approach-to-ai': {
      title: 'Approach to AI',
      body: 'Guidelines for incorporating AI elements in design.',
      filePath: 'docs/branding/approach-to-ai.md'
    }
  },
  'content-style-guide': {
    'voice-and-tone': {
      title: 'Voice and Tone',
      body: 'Guidelines for consistent voice and tone across content.',
      filePath: 'docs/content-style-guide/voice-and-tone.md'
    }
  },
  accessibility: {
    'checklist': {
      title: 'Accessibility Checklist',
      body: 'Comprehensive checklist for ensuring accessible design and development.',
      filePath: 'docs/accessibility/checklist.md'
    }
  },
  layouts: {
    'dashboards': {
      title: 'Dashboards',
      body: 'Layout patterns for dashboard interfaces.',
      filePath: 'docs/layouts/dashboards.md'
    },
    'empty-states': {
      title: 'Empty States',
      body: 'Layout guidance for empty state screens.',
      filePath: 'docs/layouts/empty-states.md'
    },
    'forms': {
      title: 'Forms',
      body: 'Form layout patterns and best practices.',
      filePath: 'docs/layouts/forms.md'
    },
    'grids': {
      title: 'Grids',
      body: 'Grid system and layout structures.',
      filePath: 'docs/layouts/grids.md'
    },
    'landing-pages': {
      title: 'Landing Pages',
      body: 'Layout patterns for landing and marketing pages.',
      filePath: 'docs/layouts/landing-pages.md'
    },
    'messaging-module': {
      title: 'Messaging Module',
      body: 'Layout for messaging and communication interfaces.',
      filePath: 'docs/layouts/messaging-module.md'
    },
    'pane-layouts': {
      title: 'Pane Layouts',
      body: 'Multi-pane layout patterns for complex interfaces.',
      filePath: 'docs/layouts/pane-layouts.md'
    },
    'record-views': {
      title: 'Record Views',
      body: 'Layout patterns for viewing and editing records.',
      filePath: 'docs/layouts/record-views.md'
    }
  },
  patterns: {
    'banners': {
      title: 'Banners',
      body: 'Banner patterns for important announcements and alerts.',
      filePath: 'docs/patterns/banners.md'
    },
    'calendar-widget': {
      title: 'Calendar Widget',
      body: 'Calendar interface patterns and interactions.',
      filePath: 'docs/patterns/calendar-widget.md'
    },
    'charts': {
      title: 'Charts',
      body: 'Data visualization and chart patterns.',
      filePath: 'docs/patterns/charts.md'
    },
    'comment-thread': {
      title: 'Comment Thread',
      body: 'Comment and discussion thread patterns.',
      filePath: 'docs/patterns/comment-thread.md'
    },
    'document-summary': {
      title: 'Document Summary',
      body: 'Document summary and preview patterns.',
      filePath: 'docs/patterns/document-summary.md'
    },
    'document-cards': {
      title: 'Document Cards',
      body: 'Card patterns for displaying document information.',
      filePath: 'docs/patterns/document-cards.md'
    },
    'inline-dialog': {
      title: 'Inline Dialog',
      body: 'Inline dialog and contextual popup patterns.',
      filePath: 'docs/patterns/inline-dialog.md'
    },
    'key-performance-indicators': {
      title: 'Key Performance Indicators',
      body: 'KPI display and dashboard patterns.',
      filePath: 'docs/patterns/key-performance-indicators.md'
    },
    'notifications': {
      title: 'Notifications',
      body: 'Notification patterns for system messages and alerts.',
      filePath: 'docs/patterns/notifications.md'
    },
    'pick-list': {
      title: 'Pick List',
      body: 'Selection and pick list interface patterns.',
      filePath: 'docs/patterns/pick-list.md'
    }
  },
  components: {
    'breadcrumbs': {
      title: 'Breadcrumbs',
      body: 'Navigation breadcrumb components for showing hierarchy.',
      filePath: 'docs/components/breadcrumbs.md'
    },
    'cards': {
      title: 'Cards',
      body: 'Card components for displaying grouped content.',
      filePath: 'docs/components/cards.md'
    },
    'confirmation-dialog': {
      title: 'Confirmation Dialog',
      body: 'Modal dialog components for confirmations.',
      filePath: 'docs/components/confirmation-dialog.md'
    },
    'milestones': {
      title: 'Milestones',
      body: 'Milestone and progress indicator components.',
      filePath: 'docs/components/milestones.md'
    },
    'more-less-link': {
      title: 'More / Less Link',
      body: 'Expandable content toggle components.',
      filePath: 'docs/components/more-less-link.md'
    },
    'tabs': {
      title: 'Tabs',
      body: 'Tabbed interface components for organizing content.',
      filePath: 'docs/components/tabs.md'
    },
    'selections': {
      title: 'Selections',
      body: 'Internal component for selection interfaces.',
      filePath: 'docs/components/selections.md',
      source: 'internal'
    }
  },
  'coding-guides': {
    'sail-coding-guide': {
      title: 'SAIL Coding Guide',
      body: 'Comprehensive guide for generating valid Appian SAIL interfaces using documented components and best practices.',
      filePath: 'docs/SAIL_CODING_GUIDE.md'
    }
  }
};

// Validate configuration on module load
const configValidation = validateConfiguration();
if (!configValidation.isValid) {
  console.error('[ERROR] Configuration validation failed:');
  configValidation.errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

// Log configuration status
console.error(`[INFO] Public repository: ${DUAL_SOURCE_CONFIG.public.owner}/${DUAL_SOURCE_CONFIG.public.repo}`);
if (DUAL_SOURCE_CONFIG.internal.enabled) {
  console.error(`[INFO] Internal repository: ${DUAL_SOURCE_CONFIG.internal.owner}/${DUAL_SOURCE_CONFIG.internal.repo}`);
} else {
  console.error('[INFO] Internal documentation: disabled');
}