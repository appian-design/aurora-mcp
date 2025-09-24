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
      body: 'Use the Appian logo and favicon to support branding guidelines.',
      filePath: 'docs/branding/logo-and-favicon.md'
    },
    'colors': {
      title: 'Colors',
      body: 'The following is the complete color palette with named colors and their corresponding hex codes:',
      filePath: 'docs/branding/colors.md'
    },
    'icons': {
      title: 'Icons',
      body: 'The following icons are available for use in Appian Solutions. Icons are organized by category to help you select the most appropriate icon for your use case.',
      filePath: 'docs/branding/icons.md'
    },
    'typography': {
      title: 'Typography',
      body: 'Guidance on heading styles and how to use them in your interfaces',
      filePath: 'docs/branding/typography.md'
    },
    'approach-to-ai': {
      title: 'Approach to AI',
      body: 'The UX of AI in Appian Solutions',
      filePath: 'docs/branding/approach-to-ai.md'
    }
  },
  'content-style-guide': {
    'voice-and-tone': {
      title: 'Voice and Tone Principles',
      body: 'Content guidance for Appian Solution UIs',
      filePath: 'docs/content-style-guide/voice-and-tone.md'
    }
  },
  accessibility: {
    'checklist': {
      title: 'Accessibility Checklist',
      body: 'Guidance for how to make your interfaces accessible',
      filePath: 'docs/accessibility/checklist.md'
    }
  },
  layouts: {
    'dashboards': {
      title: 'Dashboards',
      body: 'Provide actionable insights from business data',
      filePath: 'docs/layouts/dashboards.md'
    },
    'empty-states': {
      title: 'Empty States',
      body: 'Used to depict when the UI has no content to display. Empty states can be used to communicate intent and action with your user. A well designed empty state makes a great first impression, guides the user so that they complete their tasks intuitively and minimizes confusion.',
      filePath: 'docs/layouts/empty-states.md'
    },
    'forms': {
      title: 'Forms',
      body: 'Facilitate user input by using the appropriate form style and input types for each scenario',
      filePath: 'docs/layouts/forms.md'
    },
    'grids': {
      title: 'Grids',
      body: 'Display tabular information in a scannable and digestible format',
      filePath: 'docs/layouts/grids.md'
    },
    'landing-pages': {
      title: 'Landing Pages',
      body: '**Tailor Content to Target Users**',
      filePath: 'docs/layouts/landing-pages.md'
    },
    'messaging-module': {
      title: 'Messaging Module',
      body: '![](https://github.com/user-attachments/assets/c4a563e1-fb73-4ac3-8233-44b4182c5f9d)',
      filePath: 'docs/layouts/messaging-module.md'
    },
    'pane-layouts': {
      title: 'Pane Layouts',
      body: 'Use `a!PaneLayout()` to display independently scrolling sections within the interface',
      filePath: 'docs/layouts/pane-layouts.md'
    },
    'record-views': {
      title: 'Record Views',
      body: 'Display information about a record in an interface',
      filePath: 'docs/layouts/record-views.md'
    }
  },
  patterns: {
    'banners': {
      title: 'Banners',
      body: 'Banners are visual elements used to display important information or messages to users',
      filePath: 'docs/patterns/banners.md'
    },
    'calendar-widget': {
      title: 'Calendar Widget',
      body: 'Calendar Widgets are used to display a calendar / scheduling interaction',
      filePath: 'docs/patterns/calendar-widget.md'
    },
    'cards-as-choices': {
      title: 'Cards as Choices',
      body: 'Cards as choices present a set of distinct options to a user in a visually engaging, easily scannable format. This pattern serves as an alternative to radio buttons or dropdowns, especially when choices benefit from descriptive text, icons, or images.',
      filePath: 'docs/patterns/cards-as-choices.md'
    },
    'charts': {
      title: 'Charts',
      body: 'Charts can be a useful tool in interfaces to get a high level view of data and the state of processes in a visual manner.',
      filePath: 'docs/patterns/charts.md'
    },
    'comment-thread': {
      title: 'Comment Thread',
      body: 'Comment threads display a chronological list of messages from different users on a single record',
      filePath: 'docs/patterns/comment-thread.md'
    },
    'document-summary': {
      title: 'Document Summary',
      body: 'Allow users to preview a document while easily scanning for relevant document details and actions',
      filePath: 'docs/patterns/document-summary.md'
    },
    'document-cards': {
      title: 'Document Cards',
      body: 'Cards that represent documents and their respective actions',
      filePath: 'docs/patterns/document-cards.md'
    },
    'inline-dialog': {
      title: 'Inline Dialog',
      body: 'Inline Dialogs are used to quickly perform an action on item in a list with at most 3 to 4 form fields. Avoid using this pattern for lists that may have a long list of fields. In those cases, use a dialog instead.',
      filePath: 'docs/patterns/inline-dialog.md'
    },
    'key-performance-indicators': {
      title: 'Key Performance Indicators',
      body: 'KPIs or Key Performance Indicators are meant to show a quick and high level snapshot of organizational performance over time or in meeting their measurable goals.',
      filePath: 'docs/patterns/key-performance-indicators.md'
    },
    'notifications': {
      title: 'Notifications',
      body: 'Notifications are used to inform users about events in a solution',
      filePath: 'docs/patterns/notifications.md'
    },
    'pick-list': {
      title: 'Pick List',
      body: 'Pick Lists are used on a form to allow users to select one or more items from a long list and additional metadata is helpful',
      filePath: 'docs/patterns/pick-list.md'
    }
  },
  components: {
    'breadcrumbs': {
      title: 'Breadcrumbs',
      body: 'Breadcrumbs display the user\'s current location within the application\'s hierarchy, allowing them to navigate back to higher-level pages.',
      filePath: 'docs/components/breadcrumbs.md'
    },
    'buttons': {
      title: 'Buttons',
      body: 'A button allows users to trigger an action, such as submitting a form, opening a dialog, or navigating to another page.',
      filePath: 'docs/components/buttons.md'
    },
    'cards': {
      title: 'Cards Guidance',
      body: 'Cards are containers used to group content together. They allow the user to view information and take actions.',
      filePath: 'docs/components/cards.md'
    },
    'confirmation-dialog': {
      title: 'Confirmation Dialog',
      body: 'Confirmation dialogs are used to present the user with a directive action to prevent adverse situations',
      filePath: 'docs/components/confirmation-dialog.md'
    },
    'milestones': {
      title: 'Milestones',
      body: 'Wizard milestones provide a guided experience to help users complete their tasks. Milestones should clearly identify each step in the process as well as the user\'s progress through those steps.',
      filePath: 'docs/components/milestones.md'
    },
    'more-less-link': {
      title: 'More / Less Link',
      body: 'More / Less Links are used to display a certain amount of text content and provide a link for the user to expand and view additional information. It prevents clutter in an interface that might be prone to long text.',
      filePath: 'docs/components/more-less-link.md'
    },
    'tabs': {
      title: 'Tabs',
      body: 'Tabs are used to navigate between alternate views within a user interface',
      filePath: 'docs/components/tabs.md'
    },
    'tags': {
      title: 'Tags',
      body: 'Tags are visual indicators used to highlight notable attributes of items and draw viewer attention to important characteristics. They provide quick, scannable context without overwhelming the interface.',
      filePath: 'docs/components/tags.md'
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