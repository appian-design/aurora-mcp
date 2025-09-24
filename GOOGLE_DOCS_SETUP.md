# Google Docs Integration Setup

This guide explains how to set up Google Docs integration to pull UX content guidelines into your design system MCP server.

## Prerequisites

- Access to Google Cloud Console
- The Google Docs document ID from your UX content guidelines
- Admin access to configure service accounts

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Docs API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Docs API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: `design-system-docs-reader`
   - Description: `Service account for reading UX content guidelines`
4. Click "Create and Continue"
5. Skip role assignment (we'll handle permissions at document level)
6. Click "Done"

## Step 3: Generate Service Account Key

1. Find your service account in the list
2. Click on it to open details
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the key file
7. Save it as `google-service-account-key.json` in your project root

## Step 4: Share Google Doc with Service Account

1. Open your UX content guidelines Google Doc
2. Click "Share" button
3. Add the service account email (found in the JSON key file as `client_email`)
4. Give it "Viewer" permissions
5. Click "Send"

## Step 5: Configure Environment Variables

1. Copy your document ID from the Google Docs URL:
   ```
   https://docs.google.com/document/d/100MCx0jSdB44k0lwFZwmz8KxpX0q3etHh4MF2KLCTXg/edit
   ```
   The document ID is: `100MCx0jSdB44k0lwFZwmz8KxpX0q3etHh4MF2KLCTXg`

2. Update your `.env` file:
   ```bash
   # Enable Google Docs integration
   ENABLE_GOOGLE_DOCS=true
   
   # Google Docs document ID (from the URL)
   GOOGLE_DOCS_DOCUMENT_ID=100MCx0jSdB44k0lwFZwmz8KxpX0q3etHh4MF2KLCTXg
   
   # Path to Google Service Account key file (JSON)
   GOOGLE_SERVICE_ACCOUNT_KEY=./google-service-account-key.json
   ```

## Step 6: Test the Integration

1. Rebuild your MCP server:
   ```bash
   npm run build
   ```

2. Test with Amazon Q:
   ```
   Get details about the buttons component
   ```

You should now see a "UX Content Guidelines" section in the component details that pulls content from your Google Doc.

## Component Mapping

The integration automatically maps component names to Google Doc sections:

- `buttons` → "Buttons and Links", "Button Links"
- `cards` → "Cards", "Content Cards"  
- `confirmation-dialog` → "Error Messages", "Dialogs"
- `tags` → "Labels", "Tags"

To add more mappings, edit the `componentMapping` object in `src/google-docs-integration.ts`.

## Troubleshooting

**"Authentication failed" errors:**
- Verify the service account key file path is correct
- Check that the service account email has access to the Google Doc
- Ensure the Google Docs API is enabled in your project

**"Document not found" errors:**
- Verify the document ID is correct
- Check that the document is shared with the service account
- Ensure the document is not restricted by organization policies

**No content guidelines appearing:**
- Check that your component names match the mapping in the code
- Verify the Google Doc has the expected section headings
- Check server logs for any error messages
