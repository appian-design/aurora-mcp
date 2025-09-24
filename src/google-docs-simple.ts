interface ContentGuideline {
  tabName: string;
  content: string;
}

export class GoogleDocsSimple {
  private documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
  }

  async getContentGuidelines(): Promise<ContentGuideline[]> {
    try {
      // Try Google Apps Script first if configured
      if (process.env.GOOGLE_APPS_SCRIPT_URL) {
        console.log('Fetching content via Google Apps Script...');
        const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('Successfully fetched Google Doc content via Apps Script!');
            return this.parseTextContent(data.content);
          }
        }
      }

      // Fallback to direct export (requires public access)
      const exportUrl = `https://docs.google.com/document/d/${this.documentId}/export?format=txt`;
      console.log('Trying direct export...');
      
      const response = await fetch(exportUrl);
      if (response.ok) {
        const text = await response.text();
        console.log('Successfully fetched via direct export!');
        return this.parseTextContent(text);
      }

      console.log('Both methods failed, using fallback content');
      return this.getFallbackContent();
    } catch (error) {
      console.log('Google Doc integration error:', error);
      return this.getFallbackContent();
    }
  }

  async getGuidelineForComponent(componentName: string): Promise<string | null> {
    const guidelines = await this.getContentGuidelines();
    
    const componentMapping: Record<string, string[]> = {
      // Components
      'buttons': ['Buttons and Links', 'Button Links', 'Button'],
      'cards': ['Cards', 'Content Cards', 'Card'],
      'confirmation-dialog': ['Confirmation Messages', 'Dialogs', 'Dialog', 'Error Messages'],
      'tabs': ['Section Headings & Tab Names', 'Tab Names', 'Tabs', 'Navigation'],
      'tags': ['Labels', 'Tag', 'Tags'],
      'breadcrumbs': ['Navigation Menus', 'Navigation', 'Breadcrumbs'],
      'milestones': ['Wizard Milestone Test', 'Milestones', 'Wizard'],
      'more-less-link': ['Buttons and Links', 'Links'],
      
      // Layouts  
      'forms': ['Instructions and Descriptions', 'Labels', 'Parameter Names', 'Placeholder Text'],
      'grids': ['Labels', 'Section Headings & Tab Names'],
      'empty-states': ['Instructions and Descriptions', 'Placeholder Text'],
      'dashboards': ['Section Headings & Tab Names', 'Labels'],
      'landing-pages': ['Section Headings & Tab Names', 'Instructions and Descriptions'],
      'record-views': ['Section Headings & Tab Names', 'Labels'],
      'pane-layouts': ['Section Headings & Tab Names'],
      'messaging-module': ['Instructions and Descriptions', 'Labels'],
      
      // Patterns
      'banners': ['Informational Banner', 'Banner', 'Notifications'],
      'notifications': ['Informational Banner', 'Notifications', 'Error Messages'],
      'inline-dialog': ['Dialogs', 'Dialog', 'Confirmation Messages'],
      'pick-list': ['Dropdown Options', 'Labels', 'Instructions and Descriptions'],
      'comment-thread': ['Instructions and Descriptions', 'Labels'],
      'document-summary': ['Labels', 'Instructions and Descriptions'],
      'document-cards': ['Cards', 'Labels'],
      'calendar-widget': ['Labels', 'Instructions and Descriptions'],
      'charts': ['Labels', 'Section Headings & Tab Names'],
      'cards-as-choices': ['Cards', 'Labels', 'Instructions and Descriptions'],
      'key-performance-indicators': ['Labels', 'Section Headings & Tab Names'],
      
      // Common UI elements that might be queried
      'dropdown': ['Dropdown Options', 'Labels'],
      'error': ['Error Messages', 'Confirmation Messages'],
      'tooltip': ['Tooltips', 'Instructions and Descriptions'],
      'navigation': ['Navigation Menus', 'Buttons and Links'],
      'headings': ['Section Headings & Tab Names'],
      'labels': ['Labels', 'Parameter Names'],
      'placeholders': ['Placeholder Text', 'Instructions and Descriptions'],
      'instructions': ['Instructions and Descriptions', 'Labels'],
      'functions': ['Function/Component Names', 'Parameter Names'],
    };

    const searchTerms = componentMapping[componentName.toLowerCase()] || [componentName];
    
    for (const guideline of guidelines) {
      for (const term of searchTerms) {
        if (guideline.tabName.toLowerCase().includes(term.toLowerCase())) {
          return guideline.content;
        }
      }
    }

    return null;
  }

  private getFallbackContent(): ContentGuideline[] {
    // Manually integrated content from Appian UX Content Standards document
    // TODO: Replace with live Google Docs API integration when authentication is available
    return [
      {
        tabName: 'Buttons and Links',
        content: `**Purpose**
Buttons and links let users advance towards or commit to an action. The text used in these elements aims to quickly tell users what action occurs or where the navigation will take them when they click the element.

**Guidelines**
The text for buttons and links should be short, clear, conversational, and self-explanatory. You can use the context of the current user experience to eliminate unnecessary words from the text.

**Button Guidance**
• Use this guidance for all types of buttons, including:
  - Buttons for actions within the same page
  - Buttons for dialog actions  
  - Buttons in grid toolbars

• Use a specific action verb that gives a command and best describes the button action or the result of the action. Users should be able to choose the correct action without reading any supporting text.

**DO:** CLEAR PATCH
**DON'T:** I WOULD LIKE TO CLEAR THE PATCH

• Match the verb to the current context of the user experience:
  - Match the button text to the dialog title. For example, for a dialog titled "Generate Event Record Types", use the button text GENERATE
  - If the title asks a question (for example, "Delete Interface Object?"), the button text should restate the primary action from the question (DELETE)

• Aim for a single word, if possible. If using multiple words for clarity:
  - Leave out nouns that can be understood from context
  - Leave out articles (use "SAVE CHANGES" instead of "SAVE THE CHANGES")
  - Use "and" instead of an ampersand (&)

**Standard Button Text:**
• Creating: NEW <object name> → CREATE
• Auto-generation: GENERATE  
• Configuration: ADD <part name> → ADD
• Removal: REMOVE (undoable) / DELETE (permanent)
• Editing: EDIT / VIEW (read-only)
• Navigation: NEXT / BACK
• Saving: SAVE / OK (temporary) / DONE
• Exiting: CANCEL / CLOSE / DISMISS

**Link Guidance**
• Use a specific action verb that gives a command and best describes the action
• For current page actions: aim for 1-2 words, leave out articles
• For application actions: keep as short as possible but can use more words for clarity
• Use "and" instead of "&"

**Standard Link Text:**
• Toggle text: "...More" / "(Less)"
• Show/hide: "Show advanced options" / "Hide advanced options"  
• Navigation: "Back to [name of higher level]"
• Grid rows: "New [name of row]"

**Documentation Links**
• Standard: "Learn more about [specific setting/concept]"
• Shortened: "Learn how to [action]" / "Learn when to [action]"
• Best practices: "[Component] Best Practices"
• Functions: "See documentation for details"

**Formatting & Capitalization**
• Buttons: ALL CAPITAL LETTERS, no punctuation
• Links: Sentence case, underline on hover
• Documentation links: Include external link icon`
      }
    ];
  }

  private parseTextContent(text: string): ContentGuideline[] {
    const guidelines: ContentGuideline[] = [];
    const lines = text.split('\n');
    
    let currentTab = 'General';
    let currentContent = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        currentContent += '\n';
        continue;
      }
      
      if (this.isLikelyHeading(trimmedLine)) {
        if (currentContent.trim()) {
          guidelines.push({
            tabName: currentTab,
            content: currentContent.trim()
          });
        }
        
        currentTab = trimmedLine;
        currentContent = '';
      } else {
        currentContent += trimmedLine + '\n';
      }
    }
    
    if (currentContent.trim()) {
      guidelines.push({
        tabName: currentTab,
        content: currentContent.trim()
      });
    }
    
    return guidelines.length > 0 ? guidelines : this.getFallbackContent();
  }

  private isLikelyHeading(line: string): boolean {
    return (
      line.length < 50 &&
      (
        line === line.toUpperCase() ||
        line.includes('Button') ||
        line.includes('Card') ||
        line.includes('Dialog') ||
        line.includes('Error') ||
        line.includes('Label') ||
        line.includes('Tag') ||
        /^[A-Z][a-z]+ (and|&) [A-Z][a-z]+/.test(line)
      )
    );
  }
}
