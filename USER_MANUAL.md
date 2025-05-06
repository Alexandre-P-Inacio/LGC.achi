# LGC Architecture Portfolio - User Manual

## Table of Contents
1. [Introduction](#introduction)
   - [System Overview](#system-overview)
   - [Technical Requirements](#technical-requirements)
   - [Supported Browsers](#supported-browsers)
2. [Getting Started](#getting-started)
   - [Account Registration](#account-registration)
   - [Logging In](#logging-in)
   - [Password Recovery](#password-recovery)
   - [User Profile Management](#user-profile-management)
   - [Navigating the Interface](#navigating-the-interface)
3. [User Features](#user-features)
   - [Browsing Projects](#browsing-projects)
   - [Viewing Project Details](#viewing-project-details)
   - [Document Viewer](#document-viewer)
   - [Video Player](#video-player)
   - [Project Filtering and Search](#project-filtering-and-search)
   - [Contacting the Architecture Firm](#contacting-the-architecture-firm)
   - [Bookmarking Favorites](#bookmarking-favorites)
4. [Client Dashboard](#client-dashboard)
   - [Accessing Your Dashboard](#accessing-your-dashboard)
   - [Viewing Your Projects](#viewing-your-projects)
   - [Project Status Tracking](#project-status-tracking)
   - [Communication with the Architecture Firm](#communication-with-the-architecture-firm)
5. [Administrator Features](#administrator-features)
   - [Admin Dashboard](#admin-dashboard)
   - [Managing Projects](#managing-projects)
   - [Adding New Projects](#adding-new-projects)
   - [Editing Existing Projects](#editing-existing-projects)
   - [Project Deletion](#project-deletion)
   - [User Management](#user-management)
   - [Statistics and Analytics](#statistics-and-analytics)
6. [Language Options](#language-options)
   - [Changing the Interface Language](#changing-the-interface-language)
   - [Content Translation](#content-translation)
7. [Troubleshooting](#troubleshooting)
   - [Login Issues](#login-issues)
   - [Project Display Problems](#project-display-problems)
   - [Upload Problems](#upload-problems)
   - [Browser Compatibility Issues](#browser-compatibility-issues)
   - [Common Error Messages](#common-error-messages)
8. [Security Considerations](#security-considerations)
   - [Password Security](#password-security)
   - [Data Protection](#data-protection)
   - [Admin Access Management](#admin-access-management)
9. [Contact Support](#contact-support)
   - [Support Channels](#support-channels)
   - [Reporting Bugs](#reporting-bugs)
   - [Feature Requests](#feature-requests)
10. [Frequently Asked Questions](#frequently-asked-questions)
11. [Glossary](#glossary)

## Introduction

### System Overview

The LGC Architecture Portfolio is a comprehensive web application designed to showcase architectural projects, manage client relationships, and provide administrative tools for portfolio management. This system allows visitors to browse project portfolios, while registered users can access personalized dashboards and administrators can manage the entire platform.

The application is built using modern web technologies including HTML5, CSS3, and JavaScript, with Supabase as the backend database service. It features a responsive design that works across desktop, tablet, and mobile devices.

Key features of the system include:
- Public portfolio browsing with interactive project viewers
- Document and video content display with built-in viewers
- Client accounts with personalized project dashboards
- Administrative tools for portfolio management
- Multi-language support
- Secure authentication system
- Interactive communication tools

### Technical Requirements

To use the LGC Architecture Portfolio system effectively, your device should meet the following requirements:

- **Internet Connection**: Broadband connection (1 Mbps or higher recommended)
- **Screen Resolution**: Minimum 1280 x 720 pixels (responsive design supports mobile devices)
- **Storage**: At least 100MB free space for browser cache
- **Memory (RAM)**: Minimum 2GB (4GB or higher recommended)

### Supported Browsers

The LGC Architecture Portfolio is optimized for the following browsers (latest versions recommended):

- Google Chrome (version 90 or higher)
- Mozilla Firefox (version 88 or higher)
- Microsoft Edge (version 90 or higher)
- Safari (version 14 or higher)
- Opera (version 76 or higher)

Mobile browsers on iOS and Android are also supported, but some features may have limited functionality compared to desktop versions.

## Getting Started

### Account Registration

1. Navigate to the registration page by clicking "Register" in the top navigation bar or by going directly to `register.html`.
2. The registration form will appear with the following fields:
   - **Username**: Create a unique username (3-20 characters, alphanumeric)
   - **Password**: Create a secure password
   - **Confirm Password**: Re-enter your password for verification
3. Create a strong password that meets the following requirements:
   - At least 8 characters long
   - Contains at least one uppercase letter (A-Z)
   - Contains at least one lowercase letter (a-z)
   - Contains at least one number (0-9)
   - Contains at least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)
4. Review the Terms of Service and Privacy Policy, then check the "I agree" box.
5. Complete the CAPTCHA verification if prompted.
6. Click the "Register" button to submit your registration.
7. The system will validate your information:
   - If your username is already taken, you'll receive an error message.
   - If your password doesn't meet the requirements, specific guidance will be provided.
8. Upon successful registration, you'll see a confirmation message and be redirected to the login page.

**Note**: Registration information is securely stored in the system's database. Your password is encrypted and cannot be viewed by administrators.

### Logging In

1. Navigate to the login page by clicking "Login" in the top navigation bar or by going directly to `login.html`.
2. Enter your registered username in the "Username" field.
3. Enter your password in the "Password" field.
4. Optional: Check the "Remember me" box to stay logged in on this device.
5. Click "Login" to access your account.
6. If your credentials are correct, you will be redirected to the homepage with personalized access.
   - The navigation bar will now show your username.
   - You'll have access to your personal dashboard.
7. If your credentials are incorrect, an error message will appear. You can:
   - Try again with the correct information.
   - Click on "Forgot Password" if you need to reset your password.

**Security Tip**: Always ensure you're on the correct website before entering login credentials. Check for "https" in the address bar, indicating a secure connection.

### Password Recovery

If you've forgotten your password, follow these steps to recover your account:

1. On the login page, click "Forgot Password" below the login form.
2. Enter your registered username in the provided field.
3. Click "Reset Password" to submit your request.
4. The system will display a confirmation message.
5. Follow the password reset instructions that will be sent to your registered email address.
6. In the password reset email, click the secure link to set a new password.
7. Enter a new password that meets the security requirements.
8. Confirm your new password by entering it again.
9. Click "Save New Password" to update your credentials.
10. You'll be redirected to the login page where you can use your new password.

**Note**: Password reset links are valid for 24 hours. For security reasons, you'll need to request a new link if it expires.

### User Profile Management

After logging in, you can manage your profile information:

1. Click on your username in the top navigation bar.
2. Select "Profile" from the dropdown menu.
3. In your profile page, you can:
   - Update your display name
   - Change your password
   - Update contact information
   - Set communication preferences
4. To change your password:
   - Enter your current password
   - Enter a new password that meets the security requirements
   - Confirm the new password
   - Click "Update Password"
5. To update other profile information:
   - Make the desired changes in the appropriate fields
   - Click "Save Changes"
6. A confirmation message will appear when your changes are successfully saved.

### Navigating the Interface

The LGC Architecture Portfolio interface is designed to be intuitive and easy to navigate. Here's a detailed breakdown of the main interface elements:

- **Top Navigation Bar**: Located at the top of every page, containing:
  - **Logo**: Click to return to the homepage
  - **Home**: Returns to the main landing page
  - **Portfolios**: Opens the project browsing page
  - **Contact**: Opens the contact form
  - **Login/Register**: Access to authentication pages (when not logged in)
  - **Username**: Your profile access (when logged in)
  - **Admin Dashboard**: Available for administrators only
  - **Language Selector**: Changes the interface language

- **Main Content Area**: The central part of the page that displays different content based on the selected section.

- **Sidebar**: May appear on certain pages, providing additional navigation options or filters.

- **Footer**: Located at the bottom of every page, containing:
  - Copyright information
  - Links to Terms of Service and Privacy Policy
  - Social media links
  - Additional company information

- **Fixed Chat Button**: A circular button in the bottom right corner that allows you to initiate contact with the firm from any page.

- **Breadcrumb Navigation**: On internal pages, shows your current location within the site hierarchy.

**Keyboard Navigation**: You can navigate the site using keyboard shortcuts:
- Tab: Move between interactive elements
- Enter: Activate selected buttons or links
- Esc: Close dialogs or popups
- Arrow keys: Navigate carousel elements or dropdown menus

## User Features

### Browsing Projects

The Portfolios page is the main hub for exploring architectural projects. Here's how to navigate and browse effectively:

1. Navigate to the "Portfolios" page by clicking the link in the top navigation bar or going directly to `portfolios.html`.

2. **Project Carousel Navigation**:
   - The main featured projects appear in a carousel format at the top of the page.
   - Use the left and right arrow buttons on either side of the carousel to navigate through projects.
   - On touch devices, you can swipe left or right to navigate.
   - The carousel auto-rotates every 8 seconds, but pauses when you hover over or interact with it.

3. **Project Grid View**:
   - Below the carousel, projects are displayed in a grid format.
   - Each project card contains:
     - Project thumbnail image
     - Project title
     - Category label
     - Status indicator (Completed, In Progress, or Incompleted)
     - Brief description (if available)
   - The grid automatically adjusts based on your screen size (4 columns on large screens, 2-3 on medium screens, 1 on mobile).

4. **Pagination**:
   - If there are more projects than can fit on one page, pagination controls appear at the bottom.
   - Click the numbers to jump to specific pages.
   - Use the "Previous" and "Next" buttons to move between adjacent pages.
   - The current page is highlighted in the pagination controls.

5. **View Modes**:
   - Toggle between "Grid View" and "List View" using the buttons in the top-right corner of the project section.
   - Grid View: Shows projects in a tile layout with emphasis on images.
   - List View: Shows projects in a more detailed format with additional text information.

6. **Sorting Options**:
   - Click the "Sort by" dropdown to arrange projects according to:
     - Newest First (default)
     - Oldest First
     - Alphabetical (A-Z)
     - Reverse Alphabetical (Z-A)
     - Status (Completed first)

**Performance Tip**: Images load progressively as you scroll down the page to optimize performance. If you have a slower connection, you may notice images loading with a slight delay.

### Viewing Project Details

When you find a project of interest, you can access detailed information by:

1. Click on any project card or thumbnail to open its detailed view.

2. **Project Information Panel**:
   - **Header Section**:
     - Project title in large font
     - Category and status indicators
     - Date added/completed (if available)
   
   - **Description Section**:
     - Detailed project description
     - Key features and highlights
     - "Show More/Less" toggle for longer descriptions
   
   - **Metadata Section**:
     - Technical specifications
     - Team members (if available)
     - Timeline information
     - Location details (if applicable)

3. **Navigation within Project Details**:
   - Use the tabs near the top of the page to switch between different content sections:
     - Overview (default)
     - Documents
     - Images
     - Videos (if available)
     - Specifications
   
4. **Returning to Projects List**:
   - Click the "Back to Projects" button in the top-left corner
   - Use the browser's back button
   - Click on "Portfolios" in the navigation bar

5. **Related Projects**:
   - At the bottom of the project details page, you'll find suggested related projects.
   - These are based on similar categories, techniques, or styles.
   - Click on any related project thumbnail to navigate to its details.

**Accessibility Feature**: All project details pages support keyboard navigation, screen readers, and high-contrast viewing modes for users with disabilities.

### Document Viewer

For projects that include document files (PDF, PowerPoint, etc.), the built-in document viewer provides these capabilities:

1. **Opening the Document Viewer**:
   - Navigate to a project's details page
   - Click on the "Documents" tab
   - Select the document you want to view from the list

2. **Document Viewer Controls**:
   - The document opens in a Turn.js-powered flipbook interface, simulating a physical book or document
   
   - **Navigation Controls**:
     - Click on the right edge of the page to move forward
     - Click on the left edge to move backward
     - Use the arrow buttons at the bottom for navigation
     - Enter a specific page number in the page input box
   
   - **View Controls**:
     - Zoom In (+): Enlarge the document
     - Zoom Out (-): Reduce the document size
     - Fit to Width: Adjust document to match window width
     - Fit to Page: Show entire page in viewer
     - Fullscreen: Toggle fullscreen mode (press Esc to exit)
   
   - **Additional Options**:
     - Download: Save the document to your device
     - Print: Send the document to your printer
     - Share: Generate a direct link to the document (if enabled)

3. **Multi-Page Navigation**:
   - Thumbnail strip at the bottom shows document preview
   - Click on any thumbnail to jump to that page
   - Use the scroll arrows to browse through thumbnails

4. **Interactive Elements**:
   - Clickable table of contents (for supported documents)
   - Hyperlinks within documents remain functional
   - Search function to find specific text (for text-based documents)

**Note on Performance**: Large documents may take a moment to fully load, especially on slower connections. A loading indicator will display while the document prepares.

### Video Player

Projects with video content include a specialized video player with these features:

1. **Accessing Videos**:
   - Navigate to a project's details page
   - Click on the "Videos" tab
   - Select the video you want to view from the available thumbnails

2. **Player Controls**:
   - **Playback Controls**:
     - Play/Pause: Toggle video playback
     - Timeline scrubber: Drag to jump to specific parts of the video
     - Volume: Adjust or mute audio
     - Playback speed: Change video speed (0.5x to 2x)
   
   - **Display Options**:
     - Full screen: Expand video to fill the entire screen
     - Picture-in-picture: Float video window while browsing other content
     - Quality selector: Choose resolution based on your connection speed
   
3. **Additional Features**:
   - Auto-play option (disabled by default)
   - Closed captions/subtitles (when available)
   - Chapter markers for longer videos (when provided)
   - Video information panel with description, duration, and upload date

4. **Mobile Viewing**:
   - All videos are optimized for mobile playback
   - Horizontal orientation recommended for best viewing experience
   - Data-saving option available for cellular connections

**Troubleshooting Tip**: If videos stutter or buffer frequently, try selecting a lower quality setting from the quality menu (gear icon) in the player controls.

### Project Filtering and Search

To quickly find specific projects or narrow down the portfolio display:

1. **Main Search Function**:
   - Located in the top-right corner of the Portfolios page
   - Enter keywords related to the project you're looking for
   - Results update as you type (after 3 characters)
   - Search covers project titles, descriptions, and metadata

2. **Category Filtering**:
   - Click on the "Filter by Category" dropdown
   - Select a category to show only projects within that classification:
     - RF Telecommunications
     - Energy
     - Construction
     - Banking & Finance
     - Sand & Mining
     - Oil & Gas
     - Real Estate
     - Nuclear
     - Industrial
     - Naval
     - BPO
     - Automotive
     - Aerospace
     - Chemistry-Pharmaceutical
   - An indicator shows the active filter
   - Click "Clear Filters" to return to showing all projects

3. **Status Filtering**:
   - Use the status checkboxes to filter by project completion status:
     - Completed
     - In Progress
     - Incompleted
   - Multiple statuses can be selected simultaneously

4. **Advanced Filtering**:
   - Click "Advanced Filters" to expand additional options:
     - Date range selector
     - File type filter (Document, Video, Mixed)
     - Sort options
   - Click "Apply Filters" to update the display
   - Click "Reset" to clear all advanced filters

5. **Combining Filters**:
   - All filtering mechanisms can be used together
   - Active filters are shown as tags at the top of the results
   - Click the "X" on any filter tag to remove that filter

**Search Tips**: For best results, use specific terms related to project names, architectural styles, or locations rather than general terms like "building" or "design."

### Contacting the Architecture Firm

There are multiple ways to get in touch with the LGC Architecture team:

1. **Main Contact Form**:
   - Navigate to the "Contact" page via the top navigation bar
   - Fill out the contact form with:
     - Full Name (required)
     - Email Address (required)
     - Phone Number (optional)
     - Subject
     - Detailed Message
   - Select a department from the dropdown (General Inquiries, Project Consultation, Career Opportunities, etc.)
   - Check the consent box for data processing
   - Click "Send Message" to submit

2. **Fixed Chat Button**:
   - Available on all pages in the bottom-right corner
   - Click to open the chat interface
   - Type your message in the text field
   - Initial responses may be automated
   - During business hours, live agents may respond
   - Outside business hours, leave a message for follow-up
   - Chat history is preserved if you remain on the site

3. **Project-Specific Inquiries**:
   - From any project details page, click the "Inquire About This Project" button
   - This opens a pre-populated contact form with the project reference included
   - Complete the remaining fields as with the main contact form
   - Your inquiry will be directed to the team responsible for that project

4. **Direct Contact Information**:
   - At the bottom of the Contact page, find:
     - Office address with interactive map
     - General email address
     - Phone numbers
     - Business hours
   - Social media links are available in the website footer

**Response Time**: During business hours (Monday-Friday, 9:00 AM - 5:00 PM), expect an initial response within 24 hours. More complex inquiries may take 2-3 business days.

### Bookmarking Favorites

Registered users can save projects for easy reference later:

1. **Adding Bookmarks**:
   - Look for the bookmark icon (ribbon shape) in the top-right corner of any project card or detail page
   - Click the icon to save the project to your bookmarks
   - The icon will change color to indicate it's been bookmarked
   - A confirmation message briefly appears

2. **Viewing Bookmarks**:
   - Click on your username in the top navigation bar
   - Select "My Bookmarks" from the dropdown menu
   - Your saved projects appear in a grid layout
   - Sort options are available as with the main portfolio page

3. **Managing Bookmarks**:
   - Remove a bookmark by clicking the filled bookmark icon again
   - The "Remove All Bookmarks" button at the top of the Bookmarks page clears your entire list
   - Bookmarks are preserved across sessions and devices

4. **Bookmark Organization**:
   - Create custom folders by clicking "Create New Folder"
   - Drag and drop bookmarked projects into folders
   - Rename or delete folders with the context menu (right-click)
   - Use the search function to find specific bookmarked projects

**Note**: Bookmarking is only available for registered users. If you bookmark a project and later log out, your bookmarks will be preserved and accessible when you log in again.

## Client Dashboard

### Accessing Your Dashboard

The client dashboard provides a personalized space where you can monitor your projects and interact with the architecture firm:

1. **Dashboard Access Methods**:
   - After logging in, click on your username in the top navigation bar
   - Select "Dashboard" from the dropdown menu
   - Alternatively, if you're already logged in, you can access directly via `/client-dashboard.html`

2. **Dashboard Authentication**:
   - You must be logged in to access your dashboard
   - If your session expires, you'll be prompted to log in again
   - For security, the dashboard automatically logs you out after 30 minutes of inactivity

3. **Dashboard Overview**:
   - Upon successful access, you'll see the main dashboard interface divided into several sections:
     - Welcome banner with your name and account information
     - Summary statistics of your projects
     - Recent activity timeline
     - Quick action buttons for common tasks
     - Project cards for all your associated projects

4. **Dashboard Customization**:
   - Click the "Customize Dashboard" button in the top-right corner
   - Select which widgets and information sections to display
   - Drag and drop widgets to rearrange the layout
   - Click "Save Layout" to preserve your changes

**First-Time Users**: If this is your first time accessing the dashboard, a guided tour will automatically start, highlighting key features and functions. You can skip this tour with the "Skip Tour" button or restart it later from the Help menu.

### Viewing Your Projects

Your dashboard provides comprehensive access to all projects associated with your account:

1. **Projects Overview**:
   - The "Your Projects" section displays all projects linked to your account
   - Each project is represented by a card showing:
     - Thumbnail image
     - Project title
     - Current status indicator
     - Last update date
     - Progress percentage (for in-progress projects)

2. **Project Card Interactions**:
   - Click on any project card to expand detailed information
   - Hover over status indicators for explanatory tooltips
   - Use the three-dot menu on each card for additional options:
     - View full details
     - Download project files
     - Contact project manager
     - Add notes

3. **Project Filtering and Sorting**:
   - Use the filter buttons above the project cards to filter by:
     - Status (All, In Progress, Completed, Incompleted)
     - Date (Newest, Oldest)
     - Category
   - Use the search box to find specific projects by name or keyword
   - Sort projects using the dropdown menu (alphabetically, by status, by date)

4. **Batch Actions**:
   - Select multiple projects by checking the boxes in the top-left corner of each card
   - With multiple projects selected, use the "Actions" dropdown to:
     - Download files from all selected projects
     - Generate a combined report
     - Send a message regarding the selected projects

**Note on Privacy**: Only projects specifically associated with your account will be visible in your dashboard. If you're expecting to see a project that isn't displayed, contact your project manager.

### Project Status Tracking

Monitor your projects' progress through detailed status tracking features:

1. **Status Indicators**:
   - Each project displays a color-coded status indicator:
     - **Green**: Completed - The project has been successfully completed
     - **Blue**: In Progress - Work is currently being done on the project
     - **Orange**: On Hold - Work has been temporarily paused
     - **Red**: Incompleted - The project was not completed or was cancelled
   
2. **Progress Timeline**:
   - Click on a project card and select the "Timeline" tab
   - View a chronological progression of project milestones
   - Each milestone shows:
     - Date completed (or estimated completion date)
     - Description of the milestone
     - Responsible team member
     - Status (completed, pending, delayed)
   - The timeline visually represents the project's overall progress

3. **Detailed Status Reports**:
   - Access full status reports by clicking "View Status Report" on a project
   - Reports include:
     - Executive summary
     - Current phase details
     - Upcoming milestones
     - Risk assessments
     - Budget status (if applicable)
     - Resource allocation

4. **Status Notifications**:
   - Configure notification preferences in your dashboard settings
   - Receive alerts when:
     - Project status changes
     - New milestones are achieved
     - Documents are uploaded
     - Comments are added by the team
   - Notifications can be received via:
     - In-app notifications
     - Email
     - SMS (if enabled in your profile)

**Tip**: Set up weekly email digests in your notification preferences to receive regular summaries of all your projects' status changes.

### Communication with the Architecture Firm

Your dashboard provides multiple channels to communicate with the architecture team:

1. **Project-Specific Messaging**:
   - In each project's detailed view, click the "Messages" tab
   - View the conversation history specific to that project
   - Type new messages in the text field at the bottom
   - Attach files by clicking the paperclip icon (max 25MB per file)
   - Tag specific team members with @ followed by their name
   - Use formatting options for better readability:
     - Bold: `**text**`
     - Italic: `*text*`
     - Lists: Start lines with `- ` or `1. `

2. **Direct Messaging**:
   - Click the "Messages" icon in the dashboard sidebar
   - Select a recipient from your project contacts
   - Start a new conversation thread
   - Messages are organized by contact and date
   - Search previous messages using the search bar

3. **Document Sharing and Review**:
   - Upload documents for review via the "Upload" button
   - Comment on specific parts of documents by highlighting text
   - Request approvals or feedback using the "Request Review" button
   - Track document versions and changes in the "Revisions" tab

4. **Meeting Scheduling**:
   - Click "Schedule Meeting" in the dashboard sidebar
   - Select available time slots based on the team's calendar
   - Specify meeting purpose and agenda
   - Choose between in-person, phone, or video conference
   - Add participants from your contacts
   - Receive confirmation and calendar invites automatically

**Response Protocol**: For urgent matters, use the "Mark as Urgent" option when sending messages. The team aims to respond to urgent communications within 4 business hours and standard communications within 1 business day.

## Administrator Features

### Admin Dashboard

The admin dashboard provides a comprehensive control center for managing the entire portfolio system:

1. **Accessing Admin Dashboard**:
   - Log in with an administrator account
   - Click "Admin Dashboard" in the navigation bar or go directly to `admin.html`
   - If you don't see the Admin Dashboard option, your account may not have administrative privileges

2. **Dashboard Layout**:
   - **Header Area**: Contains quick navigation, notifications, and user info
   - **Statistics Overview**: Displays key metrics in card format
   - **Main Content Area**: Contains tabbed sections for different management functions
   - **Sidebar**: Provides quick access to frequently used admin tools

3. **Dashboard Sections**:
   - **Overview**: Shows system statistics and recent activity
   - **Projects**: Complete project management interface
   - **Users**: User account management
   - **Analytics**: Detailed usage statistics and reports
   - **Settings**: System configuration options
   - **Logs**: System activity and error logs

4. **Real-time Monitoring**:
   - The dashboard updates in real-time to show:
     - New user registrations
     - Project additions or modifications
     - System alerts and notifications
     - Current active users
   - Enable desktop notifications to receive alerts even when working in another tab

5. **Admin Quick Actions**:
   - The Quick Actions panel provides one-click access to common tasks:
     - Add new project
     - Add new user
     - Generate reports
     - System backup
     - Clear cache
     - View system status

**Security Note**: Administrative sessions have a shorter timeout period (15 minutes) for security purposes. Save your work frequently to avoid losing changes.

### Managing Projects

The Projects section provides comprehensive management tools for all portfolio content:

1. **Projects Overview**:
   - Navigate to the "Projects" tab in the admin dashboard
   - View a complete table of all projects with key information:
     - Project ID
     - Project name
     - Category
     - Status
     - Date added
     - File type
     - Creator
     - Actions column

2. **Table Navigation and Controls**:
   - **Pagination**: Navigate through pages of projects (25 projects per page by default)
   - **Search**: Filter projects by typing in the search box (searches across all fields)
   - **Sorting**: Click column headers to sort by that field (ascending or descending)
   - **Filtering**: Use the filter dropdown to show only specific categories or statuses
   - **Column Selection**: Customize visible columns via the settings icon
   - **Bulk Actions**: Select multiple projects using checkboxes for batch operations

3. **Detailed Project View**:
   - Click on any project name to view detailed information
   - The detail view shows all metadata, files, and history
   - Tabs organize different aspects of the project:
     - Details: Basic information and description
     - Files: All associated documents and media
     - Analytics: View statistics (views, downloads, etc.)
     - History: Complete audit trail of changes
     - Comments: Internal notes and discussion

4. **Project Actions**:
   - For each project, the Actions column provides buttons for:
     - Edit: Modify project information
     - View: Preview as a regular user would see it
     - Feature: Highlight on homepage carousel
     - Archive: Move to archive (hidden from public view)
     - Delete: Permanently remove the project
   - Confirmation is required for irreversible actions

5. **Export Options**:
   - Export project data in various formats:
     - CSV: Spreadsheet-compatible format
     - PDF: Formatted report
     - JSON: Data interchange format
   - Customize export fields and date ranges
   - Schedule regular exports via the "Scheduled Reports" section

**Best Practice**: Before deleting any project, use the Archive function instead. This preserves the data while removing it from public view, allowing for potential restoration later.

### Adding New Projects

To add new content to the portfolio, follow these detailed steps:

1. **Initiating Project Creation**:
   - Click the "Add New Project" button in the Projects section
   - Alternatively, use the Quick Action button from the dashboard
   - The project creation form will open with multiple sections

2. **Basic Information Section**:
   - **Project Name**: Enter a descriptive title (required, 3-100 characters)
   - **Project Category**: Select from the dropdown or create a new category
     - RF Telecommunications
     - Energy
     - Construction
     - Banking & Finance
     - Sand & Mining
     - Oil & Gas
     - Real Estate
     - Nuclear
     - Industrial
     - Naval
     - BPO
     - Automotive
     - Aerospace
     - Chemistry-Pharmaceutical
   - **Content Type**: Choose between:
     - Document File (PDF, Word, PowerPoint, Excel)
     - Video File (MP4, WebM, etc.)
   - **Project Status**: Select from dropdown (In Progress, Completed, Incompleted)
   - **Description**: Enter a detailed description with formatting options

3. **File Upload Section**:
   - **For Document Type**:
     - Click "Choose File" or drag and drop the main project document
     - Supported formats include PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
     - Maximum file size: 100MB
     - File will be automatically converted to an interactive format if needed
   
   - **For Video Type**:
     - Click "Choose File" or drag and drop the video file
     - Supported formats include MP4, WebM, MOV, AVI
     - Maximum file size: 500MB
     - Videos will be automatically processed and optimized for web viewing
   
   - **Project Image**: Upload a thumbnail or cover image
     - Recommended size: 1200 x 800 pixels
     - Supported formats: JPG, PNG, GIF
     - Will be displayed on project cards and at the top of the detail page

4. **Additional Options Section**:
   - **Featured Project**: Toggle to highlight on the homepage
   - **Client Association**: Link to specific client accounts (optional)
   - **Tags**: Add relevant keywords for improved searchability
   - **Team Members**: Associate with architectural team members
   - **Completion Date**: Set actual or estimated completion date
   - **Access Permissions**: Set visibility (Public, Registered Users, Specific Clients)

5. **Publishing Options**:
   - **Save as Draft**: Save without publishing (only visible to admins)
   - **Preview**: See how the project will appear to users
   - **Save Project**: Publish immediately to the portfolio
   - **Schedule**: Set a future publication date and time

**Important**: Large files may take time to upload depending on your connection speed. A progress indicator will display during the upload process. Do not navigate away from the page until the upload completes.

### Editing Existing Projects

To modify projects already in the system:

1. **Accessing Edit Mode**:
   - From the projects table, click the "Edit" button for the desired project
   - Alternatively, while viewing a project's details, click the "Edit Project" button
   - The edit form opens with all current project information pre-populated

2. **Making Changes**:
   - Modify any fields as needed using the same interface as project creation
   - Fields that cannot be edited will appear disabled
   - Changes are highlighted with a different background color
   - Required fields are marked with an asterisk (*)

3. **File Management**:
   - **Replace Existing Files**:
     - Click "Replace" next to the current file
     - Upload the new version
     - The system maintains version history for documents
   
   - **Add Additional Files**:
     - In the "Additional Files" section, click "Add File"
     - Upload supplementary documents or media
     - Provide a description for each additional file
     - Arrange files by dragging and dropping

4. **Revision Tracking**:
   - Each edit creates a new revision in the system
   - Enter revision notes in the "Change Summary" field
   - Previous versions remain accessible in the project history
   - Use the "Compare Versions" tool to see differences between revisions

5. **Update Options**:
   - **Save Changes**: Apply all modifications immediately
   - **Save as Draft**: Store changes without publishing
   - **Cancel**: Discard all changes and exit edit mode
   - **Preview Changes**: See how the updated project will appear

6. **Notification Options**:
   - **Notify Associated Clients**: Send automatic updates to linked clients
   - **Custom Notification Message**: Add a personalized note
   - **Notification Method**: Choose email, in-system, or both

**Version Control**: The system maintains a complete history of all edits. To revert to a previous version, navigate to the History tab and click "Restore This Version" next to the desired revision.

### Project Deletion

When a project needs to be permanently removed from the system:

1. **Deletion Process**:
   - From the projects table, click the "Delete" button for the relevant project
   - Alternatively, use the Delete option in the project's detail view
   - A confirmation dialog appears with important warnings

2. **Confirmation Requirements**:
   - You must type the project name to confirm deletion
   - For projects older than 30 days or with client associations, administrator approval may be required
   - For additional security, you may need to enter your password

3. **Deletion Effects**:
   - **Permanent Removal**: All project data will be permanently deleted
   - **Associated Files**: All uploaded files will be removed from storage
   - **Analytics Data**: Usage statistics will be lost
   - **Client Associations**: Links to client accounts will be removed
   - **Search Indexes**: Project will be removed from search results

4. **Alternative: Archiving**:
   - Consider archiving instead of deleting for historical preservation
   - Archived projects are hidden from public view but preserved in the database
   - To archive, use the "Archive" button instead of "Delete"
   - Archived projects can be restored at any time

5. **Post-Deletion**:
   - System logs record the deletion event, including:
     - Admin who performed the deletion
     - Date and time
     - Project details
   - A confirmation message appears after successful deletion
   - The projects table refreshes automatically

**Warning**: Deletion is irreversible. Once confirmed, the project and all associated data cannot be recovered. Always consider archiving as an alternative to permanent deletion.

### User Management

The User Management section provides tools to manage all system users:

1. **Accessing User Management**:
   - Click the "Users" tab in the admin dashboard
   - View the complete user table with information:
     - Username
     - Registration date
     - Last login
     - Account type (Admin, Client, Regular User)
     - Status (Active, Inactive, Suspended)
     - Actions column

2. **User Search and Filtering**:
   - Search for specific users by username or email
   - Filter by account type, status, or registration date
   - Sort by clicking column headers
   - Advanced filters for complex queries

3. **Viewing User Details**:
   - Click on a username to access the detailed profile
   - The profile shows:
     - Account information
     - Associated projects
     - Login history
     - Communication log
     - Account activity

4. **Modifying User Accounts**:
   - Click "Edit" in the Actions column to modify an account
   - Editable fields include:
     - Display name
     - Email address
     - Account type
     - Status
     - Password reset
     - Project associations
   - Save changes or cancel to return to the user list

5. **Account Type Management**:
   - **Changing Account Types**:
     - In the user edit form, select the desired account type
     - Available types:
       - **Regular User**: Basic access to view portfolios
       - **Client**: Access to client dashboard and associated projects
       - **Admin**: Full system access and management capabilities
     - Changing a user to Admin requires additional confirmation
   
   - **Permission Sets**:
     - For Admin accounts, customize specific permissions
     - Toggle individual capabilities on or off
     - Create custom permission templates for different admin roles

6. **Account Actions**:
   - **Suspend Account**: Temporarily disable login
   - **Activate/Deactivate**: Change account status
   - **Force Password Reset**: Require user to create a new password
   - **Delete Account**: Permanently remove the user account
   - **Impersonate User**: View the system as this user (for troubleshooting)

7. **Bulk User Management**:
   - Select multiple users with checkboxes
   - Apply actions to all selected accounts:
     - Change status
     - Export data
     - Send notifications
     - Delete accounts

**Security Best Practice**: Regularly audit admin accounts and ensure proper permission levels. The principle of least privilege should be applied—grant only the permissions necessary for each admin's role.

### Statistics and Analytics

The Analytics section provides detailed insights into system usage and performance:

1. **Accessing Analytics**:
   - Click the "Analytics" tab in the admin dashboard
   - View the main dashboard with key performance indicators

2. **Overview Dashboard**:
   - **Summary Cards**: Show high-level metrics:
     - Total visitors (daily, weekly, monthly)
     - Project views
     - Downloads
     - New user registrations
     - Average session duration
   
   - **Trend Graphs**: Visual representation of:
     - Traffic over time
     - User engagement
     - Popular content
     - Conversion rates

3. **Detailed Reports**:
   - **User Activity Report**:
     - Login frequency
     - Feature usage
     - Time spent per section
     - Device and browser statistics
   
   - **Content Performance Report**:
     - Most viewed projects
     - Download statistics
     - Time spent viewing each project
     - Engagement metrics (clicks, shares)
   
   - **Client Engagement Report**:
     - Client login frequency
     - Project access patterns
     - Communication statistics
     - Feedback metrics

4. **Data Visualization Tools**:
   - Interactive charts and graphs
   - Heat maps showing popular content areas
   - Geographic distribution of users
   - Custom date range selection
   - Comparison tools for different time periods

5. **Export and Sharing**:
   - Export any report in multiple formats:
     - PDF (for printing and sharing)
     - CSV (for further analysis)
     - PNG (chart images)
   - Schedule automatic report generation
   - Set up email delivery of regular reports
   - Share reports with other administrators

6. **Custom Analytics**:
   - Create custom metrics and KPIs
   - Build personalized dashboards
   - Set up custom tracking for specific features
   - Configure alerts for metric thresholds

**Data Retention Policy**: Analytics data is stored for 24 months by default. Older data is automatically archived but can be accessed upon request.

## Language Options

### Changing the Interface Language

The LGC Architecture Portfolio supports multiple languages to accommodate users from different regions:

1. **Language Selector Location**:
   - The language selector is located in the top navigation bar
   - It appears as a globe icon followed by the current language code (e.g., "EN" for English)
   - Click on this element to open the language selection dropdown

2. **Selecting a Language**:
   - The dropdown menu displays all available languages:
     - English (EN)
     - Portuguese (PT)
     - Spanish (ES)
     - French (FR)
     - German (DE)
     - Italian (IT)
     - *Additional languages may be available depending on configuration*
   - Click on your preferred language
   - The page will refresh with the interface translated to the selected language

3. **Persistent Language Selection**:
   - Your language preference is stored as a browser cookie
   - The system will remember your choice for future visits
   - The preference applies across all pages of the site
   - You can change your selection at any time

4. **Auto-Detection Option**:
   - On first visit, the system attempts to detect your preferred language based on browser settings
   - You can override this by manually selecting a language
   - To reset to auto-detection, clear your browser cookies or click "Auto-detect" in the language dropdown

5. **Mobile Device Language Selection**:
   - On mobile devices, tap the language icon to open the dropdown
   - The selection process works the same as on desktop
   - The interface will automatically adjust to accommodate the selected language

**Note**: Changing the language affects the user interface elements, navigation, and system messages. It does not automatically translate user-generated content such as project descriptions or comments.

### Content Translation

While the interface language can be changed instantly, content translation works differently:

1. **Project Content Translation**:
   - Project descriptions and details may be available in multiple languages if the administrator has provided translations
   - When viewing a project in a language different from the original:
     - If a translation exists, it will be displayed automatically
     - If no translation exists, the original language version will be shown with a notification
     - Some projects may have a "View in [Language]" button if alternate versions are available

2. **Translation Indicators**:
   - Content available in multiple languages displays a "Translations Available" icon
   - Click this icon to see a list of available languages for that specific content
   - Select your preferred language from the list

3. **Machine Translation Option**:
   - For content without official translations, a "Translate" button may appear
   - Clicking this uses an integrated machine translation service
   - A banner will indicate that the translation is automated and may not be completely accurate
   - You can revert to the original language at any time

4. **Partial Translations**:
   - Some content may be partially translated
   - Untranslated sections will appear in the original language
   - A notification will indicate which sections remain untranslated

5. **Requesting Translations**:
   - If you need content in a specific language, use the "Request Translation" option
   - Click the three-dot menu near the content and select "Request Translation"
   - Specify the desired language
   - Your request will be sent to the administration team

**Translation Quality Notice**: Official translations are prepared by professional translators, while machine translations are provided as a convenience. For critical information, always refer to content in its original language or request an official translation.

## Troubleshooting

### Login Issues

If you experience problems accessing your account, try these solutions:

1. **Incorrect Username or Password**:
   - Double-check that you're entering the correct username (case-sensitive)
   - Verify that your password is correct (check Caps Lock status)
   - If unsure about your password, click "Forgot Password" to reset it
   - Make sure there are no extra spaces before or after your credentials

2. **Account Locked**:
   - After multiple failed login attempts, accounts may be temporarily locked
   - Wait 30 minutes before trying again
   - Use the "Forgot Password" function to reset your credentials
   - If the problem persists, contact support with your username and the approximate time of the issue

3. **Session Expired**:
   - If you were logged in but suddenly prompted to log in again:
     - Your session may have timed out (default: 30 minutes of inactivity)
     - Your browser cookies may have been cleared
     - Another user may have logged into your account from a different device
   - Log in again to start a new session
   - If you suspect unauthorized access, change your password immediately

4. **Browser Issues**:
   - Clear your browser cache and cookies
   - Try using a different browser (Chrome, Firefox, Safari, Edge)
   - Disable browser extensions that might interfere with login functionality
   - Ensure JavaScript is enabled in your browser settings

5. **Advanced Troubleshooting**:
   - Check your internet connection
   - Verify that the website URL is correct (https://lgc.achi/login.html)
   - Try accessing the site from a different device
   - If using a VPN, try disconnecting as some IP addresses may be blocked

**Immediate Assistance**: If you cannot access your account and have an urgent need, contact support by phone for expedited assistance.

### Project Display Problems

If projects aren't displaying correctly, try these solutions:

1. **Empty Project Gallery**:
   - If no projects are visible:
     - Check if filters are applied (look for active filter tags)
     - Try the "Reset Filters" button
     - Verify you're on the correct category page
     - Refresh the page (F5 or browser refresh button)

2. **Document Viewer Issues**:
   - If PDFs or documents don't load:
     - Ensure you have PDF.js support in your browser
     - Check if browser PDF plugins are enabled
     - Try the "Download" option and open locally
     - Clear browser cache and reload
     - Verify you have a stable internet connection

3. **Video Playback Problems**:
   - If videos won't play:
     - Check that your browser supports the video format (MP4, WebM)
     - Ensure JavaScript is enabled
     - Update your browser to the latest version
     - Try a different browser
     - Lower the video quality setting
     - Make sure your internet connection is stable and fast enough

4. **Image Loading Issues**:
   - If images appear broken or don't load:
     - Refresh the page
     - Clear browser cache
     - Check your internet connection
     - Disable ad-blockers or content blockers temporarily
     - Try a different browser

5. **Layout and Formatting Problems**:
   - If the page layout appears broken:
     - Try resizing your browser window
     - Zoom out if content appears too large
     - Rotate your device if on mobile
     - Update your browser to the latest version
     - Test in a different browser

**Specific Error Codes**: Note any error codes or messages that appear and include these when contacting support for faster resolution.

### Upload Problems

When experiencing difficulties uploading files as an administrator or client:

1. **File Size Issues**:
   - Verify that your file meets the size limitations:
     - Documents: Maximum 100MB
     - Videos: Maximum 500MB
     - Images: Maximum 25MB
   - If your file exceeds limits, try:
     - Compressing the file using appropriate software
     - Splitting large documents into smaller parts
     - Reducing video resolution or using a more efficient codec
     - Resizing images to recommended dimensions

2. **File Format Compatibility**:
   - Ensure your file type is supported:
     - Documents: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
     - Videos: MP4, WebM, MOV, AVI
     - Images: JPG, PNG, GIF, WebP
   - If your format isn't supported, convert the file using appropriate software

3. **Upload Process Stalls or Fails**:
   - If the upload progress bar stops or fails:
     - Check your internet connection (upload speed)
     - Try a more stable connection
     - Refresh the page and attempt again
     - Upload during off-peak hours
     - Try uploading in smaller batches if uploading multiple files

4. **Browser-Specific Issues**:
   - Some browsers handle large uploads better than others
   - Chrome and Firefox typically have the best upload handling
   - Avoid using Internet Explorer for large uploads
   - Ensure your browser is updated to the latest version

5. **Server Response Errors**:
   - If you receive server error messages (4xx or 5xx):
     - Note the specific error code
     - Try again after a few minutes
     - Check if the service is experiencing maintenance (status page)
     - Contact support with the error details

**Upload Recovery**: For partially completed uploads, the system will attempt to resume from the last successfully uploaded portion when you retry, rather than starting over completely.

### Browser Compatibility Issues

To ensure optimal experience across different browsers and devices:

1. **Recommended Browsers and Versions**:
   - Chrome 90+ (best overall compatibility)
   - Firefox 88+
   - Edge 90+
   - Safari 14+
   - Opera 76+

2. **Common Browser-Specific Problems**:
   - **Chrome Issues**:
     - Document viewer requires PDF.js which may need to be enabled
     - Clear site data if experiencing persistent login issues
     - Disable hardware acceleration for video playback problems
   
   - **Firefox Issues**:
     - Enable JavaScript if disabled
     - Check privacy settings that might block content
     - Update Firefox if multimedia content doesn't play
   
   - **Safari Issues**:
     - Enable JavaScript and cookies in preferences
     - If forms don't submit, check Intelligent Tracking Prevention settings
     - For video issues, update to latest macOS version
   
   - **Edge Issues**:
     - Reset browser settings if persistent problems occur
     - Toggle compatibility mode for older Microsoft services
     - Clear browser cache for display issues

3. **Mobile Device Compatibility**:
   - **iOS Devices**:
     - Use Safari for best compatibility
     - Keep iOS updated to latest version
     - Landscape orientation recommended for portfolio viewing
   
   - **Android Devices**:
     - Chrome for Android recommended
     - Test in "Desktop site" mode if mobile view has issues
     - Enable "Lite mode" for slower connections

4. **Responsive Design Issues**:
   - If content appears cut off or misaligned:
     - Try rotating your device (landscape/portrait)
     - Adjust text size in browser settings
     - Use pinch-to-zoom for detailed viewing
     - Reset page zoom (Ctrl+0 on most browsers)

5. **Alternative Access Methods**:
   - If browser compatibility issues persist:
     - Try the "Basic HTML Version" link at the bottom of pages
     - Download content for offline viewing
     - Consider using the mobile app if available

**Browser Update Recommendation**: For security and compatibility, always keep your browser updated to the latest version regardless of which browser you choose to use.

### Common Error Messages

Understanding and resolving frequently encountered error messages:

1. **Authentication Errors**:
   - **"Invalid username or password"**:
     - Verify credentials are correct and try again
     - Reset password if uncertain
   
   - **"Account temporarily locked"**:
     - Wait 30 minutes or contact support
     - Use password recovery to unlock
   
   - **"Session expired"**:
     - Log in again to create a new session
     - Check "Remember me" to extend future sessions

2. **Permission Errors**:
   - **"Access denied"**:
     - Verify you have the correct role/permissions
     - Log out and log back in
     - Contact your administrator if the issue persists
   
   - **"You don't have permission to view this project"**:
     - Request access from your project manager
     - Check if your account is properly associated with the project

3. **Content Delivery Errors**:
   - **"Error loading content"**:
     - Refresh the page
     - Check internet connection
     - Clear browser cache
   
   - **"Media cannot be played"**:
     - Verify browser compatibility with the media format
     - Check if you have the necessary plugins enabled
     - Try downloading the file and playing locally

4. **Form Submission Errors**:
   - **"Please fill out all required fields"**:
     - Look for fields marked with asterisks (*)
     - Check for validation messages under specific fields
   
   - **"File upload failed"**:
     - Verify file size and format are acceptable
     - Check internet connection stability
     - Try a smaller file or different format

5. **System Status Errors**:
   - **"Service temporarily unavailable"**:
     - The system may be undergoing maintenance
     - Wait a few minutes and try again
     - Check the service status page
   
   - **"Database error"**:
     - Report the issue to support
     - Note any error codes displayed
     - Try again later as these are typically temporary

**Error Reporting**: When contacting support about errors, always include the exact error message, the action you were attempting, the page URL, your browser version, and any error codes displayed.

## Security Considerations

### Password Security

Protecting your account starts with proper password management:

1. **Creating a Strong Password**:
   - Minimum requirements:
     - 8 characters long
     - At least one uppercase letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)
   - Recommended practices:
     - Use 12+ characters for enhanced security
     - Avoid common words or phrases
     - Don't use easily guessable information (birthdates, names)
     - Consider using a passphrase (multiple words with spaces)

2. **Password Management Best Practices**:
   - Change your password regularly (recommended every 90 days)
   - Never share your password with others
   - Use different passwords for different services
   - Consider using a reputable password manager
   - Enable two-factor authentication if available

3. **Password Recovery Security**:
   - Keep your contact information up to date
   - Be cautious of phishing attempts disguised as password reset emails
   - Always verify that reset links direct to the legitimate website
   - Set up security questions that only you would know

4. **Signs of Compromise**:
   - Unexpected password reset emails
   - Login notifications from unknown devices or locations
   - Changes to your account you didn't make
   - If you suspect compromise:
     - Change your password immediately
     - Contact support
     - Review recent account activity

5. **Device Security**:
   - Log out when using shared or public computers
   - Don't save passwords in browsers on shared devices
   - Clear browser history and cookies after using public computers
   - Use screen locks and device passwords

**Security Reminder**: The system will never ask for your full password via email or phone. All password entry should occur only on the secure login page.

### Data Protection

Understanding how your data is protected and how to enhance privacy:

1. **Data Encryption Standards**:
   - All data transmission uses secure HTTPS connections
   - Passwords are hashed and salted, never stored in plaintext
   - Document storage uses server-side encryption
   - Payment information (if applicable) complies with PCI-DSS standards

2. **Privacy Controls**:
   - Manage your privacy settings in your account profile:
     - Control what information is visible to other users
     - Set communication preferences
     - Manage cookie settings
     - Control third-party integrations
   - To access privacy settings:
     - Log in to your account
     - Click your username
     - Select "Privacy Settings"

3. **Data Retention Policies**:
   - Account information: Retained while account is active
   - Project data: Retained according to contract terms
   - Communication history: Typically retained for 3 years
   - Usage logs: Anonymized after 90 days
   - To request data deletion, contact support with specific requests

4. **Third-Party Services**:
   - The platform may utilize these third-party services:
     - Analytics tools to improve user experience
     - Document processing services
     - Email delivery services
     - Cloud storage providers
   - All third-party services are subject to strict data protection agreements
   - You can opt out of non-essential services in privacy settings

5. **Device and Connection Security**:
   - For maximum security:
     - Use updated devices and operating systems
     - Connect via secure networks, avoid public WiFi
     - Consider using a VPN for additional protection
     - Keep your browser updated
     - Use anti-virus and anti-malware protection

**Data Request Rights**: In accordance with applicable regulations, you may request a copy of your personal data stored in the system. Contact support to initiate this process.

### Admin Access Management

For system administrators, additional security responsibilities:

1. **Admin Account Security**:
   - Admin accounts require stricter password requirements
   - Session timeouts are shorter (15 minutes vs 30 minutes)
   - Failed login attempts are limited to 3 before temporary lockout
   - All admin actions are logged in a secure audit trail

2. **Role-Based Access Control**:
   - Admin privileges should be assigned based on the principle of least privilege
   - Available admin roles include:
     - **Super Admin**: Complete system access
     - **Content Admin**: Project management only
     - **User Admin**: User account management only
     - **Analytics Admin**: Reporting access only
   - Custom roles can be created with specific permission sets

3. **Admin Account Maintenance**:
   - Review active admin accounts quarterly
   - Rotate admin passwords every 60 days
   - Immediately revoke access for departed team members
   - Periodically audit access logs for suspicious activity

4. **Secure Admin Practices**:
   - Use dedicated devices for admin access when possible
   - Never share admin credentials
   - Consider using hardware security keys for authentication
   - Use IP restrictions for admin access if available
   - Avoid administrative activities on public networks

5. **Emergency Access Protocols**:
   - Document procedures for emergency access
   - Maintain backup admin contacts
   - Test account recovery processes periodically
   - Keep offline backup of recovery codes

**Critical Security Alert**: If you suspect an admin account has been compromised, immediately contact the security team and consider temporarily disabling the account until the situation is resolved.

## Contact Support

### Support Channels

Multiple channels are available to get help with the LGC Architecture Portfolio system:

1. **Online Help Center**:
   - Access comprehensive help documentation at help.lgc.achi
   - Searchable knowledge base with articles, tutorials, and FAQs
   - Video guides for common tasks
   - Available 24/7 without login

2. **Email Support**:
   - General inquiries: support@lgc.achi
   - Technical issues: tech@lgc.achi
   - Account problems: accounts@lgc.achi
   - Expected response time: Within 24 business hours

3. **Live Chat Support**:
   - Available Monday-Friday, 9:00 AM - 5:00 PM (GMT)
   - Access via the chat button in the bottom-right corner
   - Typical response time: 2-5 minutes during business hours
   - After hours: Leave a message for next-day follow-up

4. **Phone Support**:
   - Technical support: +1-234-567-8900
   - Customer service: +1-234-567-8901
   - Hours: Monday-Friday, 9:00 AM - 5:00 PM (GMT)
   - International numbers available on the Contact page

5. **In-App Support**:
   - Click the "Help" icon in the navigation menu
   - Select "Report a Problem" to send a ticket
   - Include screenshots directly from the issue report
   - Attach relevant files (maximum 25MB)

**Priority Support**: For urgent matters affecting your ability to access critical projects, call the technical support line and mention "Priority" to receive expedited assistance.

### Reporting Bugs

If you encounter a technical problem or potential bug, follow these steps:

1. **Before Reporting**:
   - Verify the issue can be reproduced
   - Check if the problem occurs in different browsers
   - Review the troubleshooting section of this manual
   - Search the knowledge base to see if it's a known issue

2. **Information to Include**:
   - Detailed description of the problem
   - Steps to reproduce the issue
   - What you expected to happen vs. what actually happened
   - Error messages (copy exact text if possible)
   - Screenshots or screen recordings
   - Browser and device information
   - Time and date when the issue occurred

3. **Reporting Methods**:
   - **Bug Report Form**: Available in the Help Center
   - **Email**: bugs@lgc.achi with "Bug Report" in the subject line
   - **In-App**: Use "Report a Bug" option in the Help menu

4. **Bug Severity Levels**:
   - **Critical**: System unusable, data loss risk
   - **High**: Major function impaired
   - **Medium**: Function works but with significant problems
   - **Low**: Minor issues, cosmetic problems
   - Indicate your assessment of severity in your report

5. **After Submission**:
   - You'll receive a tracking number for your report
   - Status updates will be sent as the issue is investigated
   - You may be contacted for additional information
   - Once resolved, you'll receive confirmation and details

**Security Vulnerabilities**: If you discover a potential security issue, please report it immediately to security@lgc.achi rather than using the standard bug reporting channels.

### Feature Requests

Have ideas for improving the LGC Architecture Portfolio? Here's how to submit suggestions:

1. **Preparing Your Request**:
   - Consider the problem you're trying to solve
   - Think about how the feature would benefit multiple users
   - Check if the functionality already exists in a different area
   - Review existing requests to avoid duplication

2. **Submission Process**:
   - Navigate to the "Feature Requests" section in the Help Center
   - Click "Submit New Request"
   - Complete the form with:
     - Feature title
     - Detailed description
     - Use case examples
     - Potential benefits
     - Any relevant attachments (mockups, diagrams)

3. **Community Voting**:
   - After submission, your request enters the voting phase
   - Other users can upvote and comment on the idea
   - Popular requests receive higher priority
   - You can track votes and comments on your submissions

4. **Request Lifecycle**:
   - **Submitted**: Initial status upon creation
   - **Under Review**: Being evaluated by the product team
   - **Planned**: Accepted for future development
   - **In Development**: Currently being built
   - **Released**: Implemented and available
   - **Not Planned**: Declined with explanation

5. **Feedback Loop**:
   - You'll receive notifications at key status changes
   - The product team may reach out for clarification
   - After implementation, you may be invited to beta test
   - Your name will be credited in release notes (if desired)

**Enhancement vs. Bug**: If something doesn't work as expected, that's a bug. If you think something could work better or differently, that's a feature request. Choose the appropriate channel for faster response.

## Frequently Asked Questions

### Account Management

**Q: How do I change my username?**  
A: Usernames cannot be changed after account creation. This ensures continuity and prevents confusion in project associations. If you absolutely need a new username, contact support to discuss options.

**Q: Can I have multiple accounts?**  
A: The system allows only one account per user. Multiple accounts for the same individual violate the Terms of Service and may result in account suspension.

**Q: How do I delete my account?**  
A: To delete your account, go to Account Settings > Privacy > Delete Account. Note that this is irreversible and will remove all personal data associated with your account. Project data will remain accessible to relevant clients and administrators.

**Q: What happens if I forget both my username and password?**  
A: Contact support directly with verification information. You'll need to provide the email address associated with your account and answer security questions.

### Project Access

**Q: Why can't I see a specific project that should be available to me?**  
A: Check that you're logged in with the correct account. If the problem persists, contact your project manager—the project may need to be specifically assigned to your account.

**Q: How long are completed projects available in my dashboard?**  
A: Completed projects remain accessible indefinitely unless specifically archived by an administrator or by client request.

**Q: Can I download a copy of all my project files?**  
A: Yes. From your client dashboard, use the "Export All" function to create a downloadable archive of all projects associated with your account.

**Q: Is there a limit to how many projects I can access?**  
A: There is no set limit to the number of projects that can be associated with your account.

### Document Handling

**Q: What's the difference between downloading a document and viewing it online?**  
A: Online viewing uses the built-in document viewer with interactive features but requires internet connection. Downloading saves a copy to your device for offline access but may not include interactive elements.

**Q: Are my downloaded files protected?**  
A: Downloaded files may contain digital watermarks for security purposes. Redistribution of these files without authorization may violate the Terms of Service.

**Q: Why do some PDFs look different in the online viewer versus downloaded?**  
A: The online viewer optimizes documents for web viewing and may adjust formatting slightly. For the exact original formatting, download the file.

**Q: Can I edit documents directly in the viewer?**  
A: The document viewer is read-only. To suggest changes, use the comment feature or contact your project manager.

### Technical Questions

**Q: Which browsers work best with the portfolio system?**  
A: Google Chrome and Mozilla Firefox provide the most consistent experience. Always use the latest version of your preferred browser.

**Q: Does the system work on mobile devices?**  
A: Yes, the system is fully responsive and works on smartphones and tablets, though some advanced features may be optimized for larger screens.

**Q: What's the maximum file size I can upload?**  
A: Document uploads are limited to 100MB, videos to 500MB, and images to 25MB per file.

**Q: Is my data backed up?**  
A: Yes, all system data is backed up daily. The platform maintains multiple redundant copies to ensure data preservation.

### Administrative Questions

**Q: How do I grant someone else access to manage my projects?**  
A: From your dashboard, go to Settings > Access Management > Add User. Enter their email and select the appropriate permission level.

**Q: Can I change a project's category after creation?**  
A: Administrators can change project categories at any time. Clients should contact their project manager to request category changes.

**Q: How often are analytics updated?**  
A: Basic analytics are updated in real-time. Comprehensive reports are processed daily, typically refreshing overnight.

**Q: Is there a limit to how many administrators can be assigned?**  
A: Standard plans allow up to 5 administrator accounts. Enterprise plans offer unlimited administrator accounts with customizable permission levels.

## Glossary

**Administrator (Admin)**: Users with elevated permissions who can manage projects, users, and system settings.

**Archive**: Moving a project to a storage state where it's preserved but hidden from general view.

**Authentication**: The process of verifying a user's identity, typically through username and password.

**Backend**: The server-side components of the system that process data and execute business logic.

**Bookmark**: A saved reference to a project for quick access later.

**Cache**: Temporary storage of website data to improve loading performance.

**Client**: A user with access to specific projects and a personalized dashboard.

**Dashboard**: A customizable interface showing relevant information and quick access to features.

**Document Viewer**: The built-in tool for viewing documents without downloading them.

**Featured Project**: A project highlighted on the homepage carousel for increased visibility.

**Filter**: A control that narrows down displayed projects based on specific criteria.

**Frontend**: The user-facing interface of the system visible in the browser.

**In Progress**: A project status indicating work is currently being done.

**Metadata**: Additional information about projects, such as creation date, category, and status.

**Permission**: Authorization to perform specific actions within the system.

**Portfolio**: The complete collection of architectural projects.

**Project Card**: A thumbnail representation of a project showing basic information.

**Regular User**: A registered user with basic access to view public portfolios.

**Responsive Design**: Web design approach that adjusts layout based on the user's device and screen size.

**Role**: A set of permissions grouped together for assignment to users.

**Session**: A period of activity between login and logout or timeout.

**Status**: Indicator of a project's current state (Completed, In Progress, Incompleted).

**Supabase**: The backend database service used by the LGC Architecture Portfolio.

**Tag**: Keyword or term assigned to a project for improved searchability.

**Thumbnail**: A small preview image representing a project or document.

**Turn.js**: The library used to create flipbook-style document viewing.

**User Interface (UI)**: The visual elements through which users interact with the system.

**Watermark**: A visible or invisible mark embedded in documents to indicate ownership.

---

© 2025 LGC Architecture Portfolio. All rights reserved. 