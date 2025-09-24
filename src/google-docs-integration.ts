import { google } from 'googleapis';

interface GoogleDocsConfig {
  documentId: string;
  tabName?: string;
  serviceAccountKey?: string;
}

interface ContentGuideline {
  tabName: string;
  content: string;
}

export class GoogleDocsIntegration {
  private docs: any;
  private documentId: string;

  constructor(config: GoogleDocsConfig) {
    this.documentId = config.documentId;
    
    // Initialize Google Docs API
    const auth = new google.auth.GoogleAuth({
      keyFile: config.serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });
    
    this.docs = google.docs({ version: 'v1', auth });
  }

  async getContentGuidelines(): Promise<ContentGuideline[]> {
    try {
      const response = await this.docs.documents.get({
        documentId: this.documentId,
      });

      const document = response.data;
      const guidelines: ContentGuideline[] = [];

      // Extract content from different tabs/sections
      if (document.body?.content) {
        let currentTab = 'General';
        let currentContent = '';

        for (const element of document.body.content) {
          if (element.paragraph) {
            const text = this.extractTextFromParagraph(element.paragraph);
            
            // Check if this is a heading that indicates a new tab/section
            if (this.isHeading(element.paragraph)) {
              if (currentContent.trim()) {
                guidelines.push({
                  tabName: currentTab,
                  content: currentContent.trim()
                });
              }
              currentTab = text;
              currentContent = '';
            } else {
              currentContent += text + '\n';
            }
          }
        }

        // Add the last section
        if (currentContent.trim()) {
          guidelines.push({
            tabName: currentTab,
            content: currentContent.trim()
          });
        }
      }

      return guidelines;
    } catch (error) {
      console.error('Error fetching Google Doc:', error);
      return [];
    }
  }

  async getGuidelineForComponent(componentName: string): Promise<string | null> {
    const guidelines = await this.getContentGuidelines();
    
    // Map component names to Google Doc sections
    const componentMapping: Record<string, string[]> = {
      'buttons': ['Buttons and Links', 'Button Links'],
      'cards': ['Cards', 'Content Cards'],
      'confirmation-dialog': ['Error Messages', 'Dialogs'],
      'tags': ['Labels', 'Tags'],
      // Add more mappings as needed
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

  private extractTextFromParagraph(paragraph: any): string {
    let text = '';
    if (paragraph.elements) {
      for (const element of paragraph.elements) {
        if (element.textRun) {
          text += element.textRun.content || '';
        }
      }
    }
    return text;
  }

  private isHeading(paragraph: any): boolean {
    return paragraph.paragraphStyle?.namedStyleType?.includes('HEADING') || false;
  }
}
