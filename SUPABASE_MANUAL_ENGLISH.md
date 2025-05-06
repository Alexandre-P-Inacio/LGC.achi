# Supabase Guide for Absolute Beginners - LGC Architecture Portfolio

## Contents
1. [What the Heck is Supabase?](#what-the-heck-is-supabase)
2. [Getting Into Supabase](#getting-into-supabase)
3. [Finding Your Way Around](#finding-your-way-around)
4. [Where All Your Stuff is Stored](#where-all-your-stuff-is-stored)
5. [Managing Users](#managing-users)
6. [Dealing with Files](#dealing-with-files)
7. [The Coding Bits](#the-coding-bits)
8. [Checking if Things Are Working](#checking-if-things-are-working)
9. [Keeping Everything Safe](#keeping-everything-safe)
10. [When Stuff Breaks](#when-stuff-breaks)

## What the Heck is Supabase?

Supabase is basically the engine running behind the scenes of the LGC Architecture Portfolio website. Think of it like the backstage crew at a concert - you don't see them, but they make everything work.

Here's what it does in simple terms:

- **Stores all the information**: Like a super-organized filing cabinet for all the project details, user info, and settings
- **Handles user accounts**: Keeps track of who can log in and what they're allowed to see
- **Stores all the files**: Keeps all those PDFs, videos, and images safe and organized
- **Connects everything together**: Makes sure the website can access all this stuff when needed
- **Makes things happen instantly**: Updates information in real-time when changes are made

The cool thing about Supabase is that it does all this complicated stuff automatically, so we don't have to build it ourselves or manage physical servers. It's like having a virtual assistant that handles all the boring technical stuff.

## Getting Into Supabase

### Login Details

To get into the Supabase control panel for the LGC Architecture Portfolio:

1. Go to https://app.supabase.io/
2. Log in with these details:
   - **Email**: admin@lgc.achi (use the real admin email you were given)
   - **Password**: Ask whoever set up the system for the password

### Finding Your Project

After you log in:

1. You'll see a list of projects connected to your account
2. Click on the one called **LGC Architecture Portfolio**
3. That'll take you to the main control panel

**Important Security Stuff**: Never share these login details with anyone. Don't write them down in emails or put them on sticky notes on your monitor. These login details are like the keys to the kingdom - they give access to all the private data.

## Finding Your Way Around

The Supabase control panel might look overwhelming at first, but it's just organized into different sections:

### Side Menu

- **Home**: Shows an overview of everything
- **Table Editor**: Where you can view and change the information stored in the system
- **Authentication**: Where user accounts are managed
- **Storage**: Where all the files are kept
- **Edge Functions**: Fancy automated stuff (you probably won't need to touch this)
- **Database**: Advanced settings for the information storage
- **Project Settings**: General settings for the whole system
- **API Docs**: Instructions for programmers (you can ignore this unless you're coding)

### Main Area

The middle part of the screen shows whatever section you picked from the side menu. This is where you'll actually do stuff.

### Stats at the Top

The home page shows some basic numbers about how the system is doing:

- How many users are registered
- How busy the system is
- How much storage space is being used
- How well the database is performing

## Where All Your Stuff is Stored

The LGC Architecture Portfolio keeps all its information in organized "tables" (think of them like spreadsheets):

### Users Table

This keeps track of everyone who can log in:

| Column | What It Is | Description |
|--------|------------|-------------|
| id | Unique ID code | A random code that identifies each user |
| username | Username | What people type to log in |
| password | Password | Scrambled for security (never stored as plain text) |
| is_admin | Admin switch | Determines if the user has special powers |
| created_at | Creation date | When the account was created |

### Projects Table

This stores all the architecture projects:

| Column | What It Is | Description |
|--------|------------|-------------|
| id | Unique ID code | A random code that identifies each project |
| title | Project title | The name of the project |
| category | Category | What type of project it is |
| status | Status | In Progress, Completed, or Incompleted |
| description | Description | Details about the project |
| file_path | File location | Where the main document is stored |
| image_path | Image location | Where the cover image is stored |
| content_type | Content type | Whether it's a document or video |
| created_at | Creation date | When the project was added |
| created_by | Creator ID | Which user added the project |

### Project_Client Table

This connects projects to the clients they belong to:

| Column | What It Is | Description |
|--------|------------|-------------|
| id | Unique ID code | A random code for each connection |
| project_id | Project ID | Which project this is about |
| user_id | Client ID | Which client this is for |
| access_level | Access level | What the client is allowed to do with the project |

### Looking at and Changing Information

To view or edit the information:

1. Click on **Table Editor** in the side menu
2. Pick which table you want to look at
3. You can:
   - Look at what's already there
   - Add new information by clicking "Insert Row"
   - Change existing information by clicking on any cell
   - Delete stuff by selecting it and clicking "Delete"

### Doing More Complex Searches

If you need to find specific information:

1. Click on **SQL Editor** in the side menu
2. Click "New Query"
3. Type in a search command, like:
   ```
   SELECT p.title, p.status, u.username 
   FROM projects p
   JOIN users u ON p.created_by = u.id
   WHERE p.status = 'In Progress';
   ```
   (This would find all projects that are currently in progress and show who created them)
4. Click "Run" to see the results

Don't worry if this looks complicated - you probably won't need to use this unless you're trying to find something very specific.

## Managing Users

The system keeps track of who can log in and what they can do:

### Looking at User Accounts

1. Click on **Authentication** in the side menu
2. Select **Users** to see everyone who can log in
3. You'll see things like:
   - Their username/email
   - When they signed up
   - When they last logged in
   - Whether their account is active

### Managing User Accounts

As an administrator, you can:

1. **Create new accounts**:
   - Click "Add User"
   - Fill in their details
   - Set their starting password

2. **Edit existing accounts**:
   - Click on the user you want to change
   - Make your changes
   - Save them

3. **Turn accounts on or off**:
   - Select the user
   - Click "Disable" or "Enable" as needed

4. **Reset passwords**:
   - Select the user
   - Click "Reset Password"
   - They'll get instructions for creating a new password

### User Settings

To change general settings about how accounts work:

1. Click on **Authentication** in the side menu
2. Select **Settings**
3. You can change things like:
   - How people can log in
   - Password rules
   - How password resets work
   - Where people go after logging in
   - How long they stay logged in

## Dealing with Files

Supabase has a file storage system that's like a super-powered Google Drive for all the project documents, videos, and images:

### How Files are Organized

Files are stored in different "buckets" (think of them as main folders):

- **project_files**: Where the main project documents live
- **project_images**: Where project images and thumbnails are stored
- **project_videos**: Where video files are kept
- **temp_uploads**: Temporary storage during file uploads

### Accessing Files

1. Click on **Storage** in the side menu
2. Pick which bucket you want to look in
3. You'll see all the files organized in folders

### Managing Files

As an administrator, you can:

1. **Upload files**:
   - Go to the bucket and folder you want
   - Click "Upload"
   - Choose a file from your computer
   - Confirm the upload

2. **View files**:
   - Click on the filename to see it
   - Images will show a preview
   - For other files, you can download them to view

3. **Organize files**:
   - Create new folders by clicking "New Folder"
   - Move files between folders by dragging them
   - Rename files by clicking the edit icon

4. **Delete files**:
   - Select the file you want to remove
   - Click "Delete"
   - Confirm you really want to delete it

### File Access Rules

You can control who gets to see or change which files:

1. Click on **Storage** in the side menu
2. Select **Policies**
3. You can view and change the existing rules for each bucket
4. To create a new rule:
   - Click "Add Policy"
   - Set the permissions (read, write, delete)
   - Specify who can do these things
   - Save the new rule

## The Coding Bits

Supabase automatically creates ways for the website to talk to all this data. This part gets technical, but here's the simple version:

### API Keys

There are two main "keys" that let the website access the data:

1. **Public key** (`anon` key):
   - Used for regular user stuff
   - Built into the website code
   
2. **Service key** (`service_role` key):
   - Super-powerful admin key
   - Must be kept secret and never put in the website code

To find these keys:

1. Click on **Project Settings** in the side menu
2. Select **API**
3. The keys will be shown in the "Project API keys" section

### Looking at the API Docs

To see how the website can use this data:

1. Click on **API Docs** in the side menu
2. Pick the table or feature you're interested in
3. You'll see examples of code for different operations like:
   - Getting data
   - Adding new records
   - Updating information
   - Deleting data

### Code Examples

Here are some simplified examples of how the website code talks to Supabase:

#### Setting Up the Connection

```javascript
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'your-public-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
```

#### Getting All Projects

```javascript
async function getProjects() {
  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error getting projects:', error);
    return [];
  }
  
  return data;
}
```

#### Logging In Users

```javascript
async function loginUser(username, password) {
  // Simplified example
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('username', username)
    .single();
    
  if (error || !data) {
    return { success: false, error: 'User not found' };
  }
  
  if (data.password === password) {
    return { success: true, user: data };
  } else {
    return { success: false, error: 'Wrong password' };
  }
}
```

Don't worry if this looks like gibberish - the web developers handle this part. You don't need to understand the code to use the system.

## Checking if Things Are Working

Keeping an eye on how the system is performing helps catch problems early:

### Viewing Request Logs

To see what's happening with the system:

1. Click on **Database** in the side menu
2. Select **Logs**
3. Choose "API" in the top tab
4. You'll see a list of all the recent activities, including:
   - When they happened
   - What kind of request it was
   - What part of the system was used
   - Whether it worked or not
   - How long it took

### Monitoring Database Performance

To check how well the database is running:

1. Click on **Database** in the side menu
2. Select **Performance**
3. You can see things like:
   - CPU usage
   - Memory usage
   - Reading/writing activity
   - Slow queries

### Setting Up Alerts

You can get notifications when something's not right:

1. Click on **Project Settings** in the side menu
2. Select **Notifications**
3. Set up alerts for things like:
   - High resource usage
   - Security problems
   - Approaching usage limits

## Keeping Everything Safe

### Database Backups

Supabase automatically makes backups of your database:

1. Click on **Database** in the side menu
2. Select **Backups**
3. You'll see a list of available backups
4. To restore from a backup:
   - Pick the backup you want
   - Click "Restore"
   - Confirm the action

**Important**: Restoring a backup will completely replace the current database. Only do this in an emergency!

### Security and Advanced Settings

For more advanced security settings:

1. Click on **Project Settings** in the side menu
2. Explore the sections:
   - **General**: Basic project settings
   - **Database**: Database settings
   - **API**: API key management and settings
   - **Authentication**: Advanced login settings

### Security Policies (RLS)

Supabase uses "Row Level Security" to control who can see or change what:

1. Click on **Authentication** in the side menu
2. Select **Policies**
3. Here you can create and manage rules for each table:
   - Define who can read which records
   - Control who can add new data
   - Restrict who can update or delete information

## When Stuff Breaks

### Common Problems and Solutions

#### 1. Login Problems

**Problem**: Users can't log in.

**Solutions**:
- Check that the username and password are correct
- Make sure the account isn't disabled in the Authentication panel
- Verify the authentication settings are correct
- Test the connection to Supabase in the front-end

#### 2. API Errors

**Problem**: The website isn't connecting to the data properly.

**Solutions**:
- Check that the API key is correct
- Make sure the permission settings are set up right
- Look at the API logs to find the specific problem
- Test the query directly in the SQL Editor

#### 3. File Storage Issues

**Problem**: Users can't upload or view files.

**Solutions**:
- Check the Storage access policies
- Make sure the bucket exists and is accessible
- Verify the file size isn't too big
- Test uploading manually through the dashboard

#### 4. Slow Performance

**Problem**: Things are running too slowly.

**Solutions**:
- Check the database performance in the Database panel
- Optimize complex queries
- Consider adding indexes to frequently searched columns
- Monitor resource usage in the Project panel

### Getting More Help

If you run into problems you can't fix:

1. **Supabase Documentation**:
   - Visit https://supabase.com/docs for official help

2. **Community Support**:
   - GitHub: https://github.com/supabase/supabase/discussions
   - Discord: https://discord.supabase.com

3. **Direct Support** (for paid plans):
   - Contact through the Supabase support portal

## Conclusion

This guide gives you the basics of how to access and manage Supabase for the LGC Architecture Portfolio. It can seem complicated at first, but you don't need to understand every detail to make basic changes.

Remember that Supabase holds all the important data for the application. Always make backups before making big changes, and test things carefully before applying them to the live system.

If you're ever unsure about something, it's better to ask for help than to experiment with settings you don't understand.

---

© 2025 LGC Architecture Portfolio. All rights reserved. 