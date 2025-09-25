# Design System MCP Server

This is a Model Context Protocol (MCP) server that provides access to Appian's design system documentation through GitHub repositories. It supports both public and internal documentation sources, allowing LLMs like Claude to query and explore design system components, layouts, and patterns with appropriate access controls.

## 🔗 Related Resources

- **Aurora Design System Documentation**: [appian-design/aurora](https://github.com/appian-design/aurora) - The source repository for design system documentation
- **Live Documentation Site**: [https://appian-design.github.io/aurora/](https://appian-design.github.io/aurora/) - Browse the design system online

## ⚡ Quickstart

For technical users who want to get up and running quickly:

1. **Clone and setup**:
   ```bash
   git clone https://github.com/appian-design/aurora-mcp.git
   cd aurora-mcp
   npm install
   ```

2. **Configure GitHub access**:
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token and repository details
   ```

3. **Build and configure MCP**:
   ```bash
   npm run build
   # Add to ~/.aws/amazonq/mcp.json or Claude Desktop config
   ```

4. **Test the connection**:
   ```bash
   npm test
   ```

For detailed setup instructions, see the [Installation](#installation) section below.

## Features

- **Multi-source support**: Access both public and internal documentation repositories
- **Source attribution**: Clear indication of content source (public/internal)
- **Priority-based merging**: Internal documentation overrides public when both exist
- **Access control**: Configurable access to internal documentation
- **Browse design system categories** (components, layouts, patterns, branding, etc.)
- **List components** within a category with source information
- **Get detailed component information** including guidance and code examples
- **Search across all components** by keyword with source filtering
- **Source management**: View source status and manually refresh content

## Installation

### Public Documentation Only

For access to public design system documentation only:

1. Clone this repository (or fork it to your own GitHub account)
2. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and update the values:
   - `GITHUB_TOKEN`: Your GitHub personal access token (generate at https://github.com/settings/tokens)
   - `GITHUB_OWNER`: Your GitHub username (the repository owner)
   - `GITHUB_REPO`: Your repository name (e.g., "aurora")
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the server:
   ```bash
   npm run build
   ```

### Internal Documentation Access

For access to both public and internal documentation:

1. Follow the public documentation setup above
2. Configure internal documentation access in your `.env` file:
   ```bash
   # Enable internal documentation
   ENABLE_INTERNAL_DOCS=true
   
   # GitHub token for internal repository (must have access to private repo)
   INTERNAL_DOCS_TOKEN=your_github_token_for_private_repo
   
   # Optional: Internal repository owner (defaults to GITHUB_OWNER)
   INTERNAL_GITHUB_OWNER=your_internal_repo_owner
   
   # Optional: Internal repository name (defaults to design-system-docs-internal)
   INTERNAL_GITHUB_REPO=your_internal_repo_name
   ```
3. Ensure your internal repository follows the same structure as the public one:
   - Place documentation files in a `/docs` folder
   - Use the same category structure (components, layouts, patterns, etc.)

### Advanced Configuration

For detailed configuration options, see [Configuration Guide](docs/CONFIGURATION.md).

## Usage with Amazon Q (Appian-specific)

This section will help you set up the Design System MCP Server to work with Amazon Q chat. This tool allows you to query design system components, patterns, and layouts directly through conversational AI, with support for both public and internal documentation sources.

### What You'll Need

- Access to our AWS account
- VS Code (recommended)
- Node.js installed on your machine

#### More on Node.js

Check if it's installed by opening the Terminal app and running this command to see the version: `node -v`.

If you get a "command not found" message, go to the [Node.js download page](https://nodejs.org/en/download) to get it. You can use the selection tool to run the installation from the command line or the download the binary and run it from your machine.

Pick the current LTS (long-term support) version of Node.

The command line tool will have you pick a node version manager and node package manager. Unless you have a preference for something else, use `nvm` and `npm`.

### Step 1: Install Amazon Q Chat

> [!IMPORTANT]
> During installation, sign in with the `Use with Pro license` option. You will need to locate the start URL from our internal documentation.

1. Visit the Amazon Q chat installation page: [Amazon Q Developer](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html?b=cli&p=overview&s=tiles) (Command Line)
    - We want to use the command line version (CLI) because it's more reliable and has access to the MCP tools.
3. Click "Get Started" and follow the installation instructions for your operating system
4. Once installed, you can access Amazon Q through the terminal command line by typing `q chat`
    - Once you start Q, we recommend switching the model to Claude 4 by typing `/model` and choosing that option.

### Step 2: Download This Project

You have two options to get the project files:

#### Option A: Download ZIP (Easier)
1. Go to the project's GitHub page
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your Desktop or preferred location
   - It will download and extract as `aurora-mcp-main`. You can remove the `-main` or leave as is but the rest of the instructions assume it's not there.

#### Option B: Clone with Git (If you're comfortable with Git)
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the project, e.g., `~/repo/`
3. Run: `git clone [repository-url]`

### Step 3: Install the Project

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the project folder, for example:
   ```
   cd Desktop/aurora
   ```
3. Install the required dependencies:
   ```
   npm install
   ```
4. Build the project:
   ```
   npm run build
   ```
### Step 4: Set Up GitHub Access

The MCP server needs API access to GitHub to fetch the design system documentation. You can set up access for public documentation only, or for both public and internal documentation.

#### Public Documentation Only (Default Setup)

At a high level, here's what you need to do:

- Create a Personal Access Token (PAT) to allow API access to all public repositories (easier)
   - Alternatively, you can fork your own copy of the repo and create a PAT for that one (more for development)
- Copy the PAT to a `.env` file in the folder of your local copy of the `aurora-mcp` repo

#### Internal Documentation Access (Optional)

If you need access to internal documentation, you'll also need:
- Access to the internal documentation repository
- A separate GitHub token for the private repository
- Additional environment configuration

#### Detailed Steps

1. **Create a GitHub Personal Access Token:**
   - Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
   - Click "Generate new token"
   - Give it a descriptive name like "Appian Aurora Docs Access"
   - Set expiration to your preference
   - Under Repository Access, confirm it's set to `Public repositories`
   - Click "Generate token"
   - **Important:** Copy the token immediately - you won't be able to see it again! (You may want to paste it in a temporary location until setup is complete.)

1. **Create a .env file:**
   - In the aurora-mcp folder on your machine, run this command in Terminal to copy the example environment file:
     ```
     cp .env.example .env
     ```
   - Open the `.env` file in a text editor
     ```
     open -e .env
     ```
   - **For public documentation only**, update these values:
     - `GITHUB_TOKEN`: Replace with your actual token from previous step
     - `GITHUB_OWNER`: Should be set to `appian-design` (unless you created a fork)
     - `GITHUB_REPO`: Should be set to `aurora` (unless you renamed your fork)
   
   - **For internal documentation access**, also add:
     - `ENABLE_INTERNAL_DOCS=true`
     - `INTERNAL_DOCS_TOKEN=your_internal_docs_token_here`
   
   - Save and close the file

1. **Rebuild the project:**
   ```
   npm run build
   ```
### Step 5: Configure Amazon Q

Now you need to tell Amazon Q where to find this design system server.

1. **Set up configuration file:**
   - Run this command in Terminal to create the empty file in the right place and open it with TextEdit:
     ```
     mkdir -p ~/.aws/amazonq && touch ~/.aws/amazonq/mcp.json && open -e ~/.aws/amazonq/mcp.json
     ```

2. **Get the full path to your project:**
   - In Terminal/Command Prompt, while in the `aurora-mcp` project folder, run:
     ```
     pwd
     ```
   - Copy the full path that appears and paste it somewhere handy for now (it will look something like `/Users/first.last/Desktop/aurora-mcp`)

3. **Edit the configuration file:**
   - Open the `mcp.json` file in VS Code or any text editor (if it's not already open in TextEdit)
   - Add this configuration (replace `YOUR_FULL_PATH_HERE` with the path you copied and leave the `/build/index.js` after the path):

   ```json
   {
       "mcpServers": {
           "design-system": {
               "command": "node",
               "args": [
                   "YOUR_FULL_PATH_HERE/build/index.js"
               ]
           }
       }
   }
   ```

4. **Save the file and restart Amazon Q**

5. **Confirm MCP configuration**
   - In a new Terminal window, type this command: `qchat mcp list`
   - You should see a reference to the file you just edited (under global:) with a `design-system` item listed

### Step 6: Set Up Your Working Project

Now that the MCP server is configured, you'll want to create a separate workspace for your design system work. This is where you'll generate and organize files before copying them into Interface Designer.

1. **Create a new project folder:**
   - Create a new folder on your Desktop called something like `design-system-work` or `my-design-project`
   - This folder will be separate from the MCP server folder you downloaded earlier

1. **Open your working folder in VS Code:**
   - Launch VS Code
   - Go to File → Open Folder
   - Select your new working project folder
   - This gives you a clean workspace for your design system files

1. **Understanding the workflow:**
   - You'll use Amazon Q chat to query the design system and generate component code
   - Amazon Q will provide you with SAIL code snippets
   - You can save these snippets as files in your VS Code project for reference
   - When ready, you'll copy and paste the final code into Interface Designer

1. **Organize your workspace:**
   - Consider creating folders like:
     - `components/` - for individual component files
     - `layouts/` - for layout patterns
     - `examples/` - for code examples and variations
     - `notes/` - for design decisions and documentation

### Step 7: Test It Out

1. Open Amazon Q chat (type `q chat` in Terminal)
2. Try asking questions like:
   - "What design system categories are available?"
   - "Show me all components in the components category"
   - "Search the design system for cards"
   - "Check the status of documentation sources" (to see if internal docs are enabled)
   - "Get details about the cards component including internal documentation" (if you have internal access)

### Step 8: Internal Documentation Setup (Optional)

If you need access to internal documentation, follow these additional steps:

#### Prerequisites
- Access to the internal documentation repository
- Permission to create GitHub Personal Access Tokens for private repositories

#### Setup Steps

1. **Get access to internal repository:**
   - Contact your team lead to get access to the internal documentation repository
   - The repository is typically named something like `aurora-internal`

2. **Create internal documentation token:**
   - Go to [GitHub Settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
   - Create a new token with access to the internal repository
   - Set the same permissions as your public token (Contents: Read, Metadata: Read)

3. **Update your .env file:**
   ```bash
   # Add these lines to your existing .env file
   ENABLE_INTERNAL_DOCS=true
   INTERNAL_DOCS_TOKEN=your_internal_token_here
   ```

4. **Rebuild and test:**
   ```bash
   npm run build
   ```
   
   Test with Amazon Q:
   - "Check the status of documentation sources"
   - You should see both PUBLIC and INTERNAL sources listed

#### Using Internal Documentation

Once set up, you can access internal documentation by:
- Adding "including internal documentation" to your queries
- Using specific internal component names
- Searching within internal documentation only

Example queries:
- "Get details about the admin-panel component including internal documentation"
- "Search for 'internal' components in internal documentation only"

### Troubleshooting

**If Amazon Q can't find the server:**
- Double-check that the path in your config file is correct and absolute (starts with `/` on Mac or `C:\` on Windows)
- Make sure you ran `npm run build` successfully
- Restart Amazon Q completely

**If npm commands don't work:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart your Terminal/Command Prompt after installation

**If internal documentation isn't working:**
- Verify `ENABLE_INTERNAL_DOCS=true` is set in your .env file
- Check that `INTERNAL_DOCS_TOKEN` has the correct permissions
- Test the token manually by visiting the repository in your browser
- Use "Check the status of documentation sources" to verify both sources are enabled

**If you see "Authentication required" errors:**
- Your internal documentation token may have expired
- Verify the token has access to the correct repository
- Try regenerating the token with the same permissions

**Need help?**
- Check the main README.md file for more detailed troubleshooting
- See [Migration Guide](docs/MIGRATION.md) for upgrading from single-source setup
- See [Configuration Guide](docs/CONFIGURATION.md) for advanced configuration options
- The configuration file path must be the complete, absolute path to work properly

### What's Next?

Once set up, you can use Amazon Q to explore your design system by asking natural language questions about components, patterns, and layouts. The AI will help you find what you need without having to manually browse through documentation.

## Usage with Claude Desktop

1. Make sure you have Claude Desktop installed and up to date
2. Edit the Claude Desktop configuration file:
   
   **MacOS:**
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```
   
   **Windows:**
   ```
   %AppData%\Claude\claude_desktop_config.json
   ```

3. Add the server configuration:
   ```json
   {
       "mcpServers": {
           "design-system": {
               "command": "node",
               "args": [
                   "/ABSOLUTE/PATH/TO/aurora-mcp/build/index.js"
               ]
           }
       }
   }
   ```
   (Replace `/ABSOLUTE/PATH/TO` with the actual path to this directory)

4. Restart Claude Desktop

### Troubleshooting

If you encounter issues:

1. Check Claude Desktop logs:
   ```
   tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
   ```
2. Verify your server builds and runs without errors
3. Make sure the configuration path is absolute and correct
4. Restart Claude Desktop completely

## Tools

The server provides the following tools with dual-source support:

### Source Management
1. **get-content-sources**: View available documentation sources and their status
2. **refresh-sources**: Manually refresh documentation sources and clear cache

### Content Access
3. **list-categories**: Lists all available design system categories
4. **list-components**: Lists all components in a specific category
5. **get-component-details**: Gets detailed information about a specific component with source attribution
   - `includeInternal`: Access internal documentation (default: false)
   - `sourceOnly`: Filter by specific source ("public", "internal", "all")
6. **search-design-system**: Searches across all components by keyword with source filtering
   - `includeInternal`: Include internal documentation in search
   - `sourceOnly`: Filter results by specific source

For detailed API documentation, see [API Guide](docs/API.md).

## Example Queries

### Basic Usage (Public Documentation)
- "What design system categories are available?"
- "Show me all components in the 'layouts' category"
- "Get details about the 'cards' component"
- "Search the design system for 'navigation'"

### Dual-Source Usage (Public + Internal)
- "Check the status of documentation sources"
- "Get details about the 'cards' component including internal documentation"
- "Search for 'internal' components in internal documentation only"
- "Show me all components, including internal ones"
- "Refresh the documentation sources"

### Advanced Filtering
```javascript
// Public users - default behavior
"Get details about the cards component"

// Internal users - access internal documentation
"Get details about the cards component with internal documentation included"

// Search only internal documentation
"Search for 'widget' in internal documentation only"

// Check what sources are available
"What documentation sources are available?"
```