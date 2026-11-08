# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for the AMAI TV application.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. A Firebase project

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "amai-tv")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following sign-in methods:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and configure the OAuth consent screen

## Step 3: Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname (e.g., "amai-tv-web")
5. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase configuration values.

**Optional: For Development with Emulators**
If you want to use Firebase emulators for local development, add this line:
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```
Set to `true` only when you have Firebase emulators running locally.

## Step 6: Install Dependencies

Run the following command in the `frontend` directory:

```bash
npm install firebase
```

## Step 7: Set Up Firestore Security Rules

In the Firebase Console, go to "Firestore Database" > "Rules" and use rules that match the AMAI TV collections. The version below keeps your current app behavior and adds the missing `communityFeedback` permissions so signed-in users can post feedback and all visitors can read the public board:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.uid == "sf1MEwZ8KOME15feZVZ5j7Fajr13";
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // 1. ANIME CATALOG (cache)
    match /animes/{animeId} {
      allow read: if true;
      allow write: if true;
    }

    match /animes {
      allow list: if true;
    }

    // 2. SITE SETTINGS
    match /system/settings {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 3. PUBLIC COMMUNITY FEEDBACK BOARD
    match /communityFeedback/{feedbackId} {
      allow read: if true;

      allow create: if isSignedIn()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0
        && request.resource.data.message.size() <= 280
        && request.resource.data.type in ["feedback", "idea", "bug"]
        && request.resource.data.userName is string
        && request.resource.data.createdAtMs is int;

      allow update, delete: if isAdmin();
    }

    // 4. USER DATA
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin();

      match /{allSubcollections=**} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
    }

    match /users {
      allow list: if true;
    }

    // 5. Global fallback for admin
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

If you publish those rules, the `Missing or insufficient permissions` error for community feedback posts should stop for signed-in users.

## Step 8: Configure OAuth Consent Screen (for Google Sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen with your app information
5. Add your domain to authorized domains

## Step 9: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to your application
3. Try signing up with email/password
4. Try signing in with Google
5. Check the Firebase Console to see if users are being created

## Features Included

This authentication system includes:

- ✅ Email/Password authentication
- ✅ Google OAuth authentication
- ✅ Password reset functionality
- ✅ Session persistence
- ✅ User profile management
- ✅ Watch history tracking
- ✅ My List functionality
- ✅ Real-time data synchronization
- ✅ Responsive UI components

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens in development. The app is already initialized.

2. **"auth/operation-not-allowed"**
   - Check that the sign-in method is enabled in Firebase Console.

3. **"auth/invalid-api-key"**
   - Verify your environment variables are correct and the API key is valid.

4. **Google Sign-in not working**
   - Ensure OAuth consent screen is configured
   - Check that your domain is authorized
   - Verify the OAuth client ID is correct

### Development Tips:

- Use Firebase Emulator Suite for local development
- Check browser console for detailed error messages
- Use Firebase Console to monitor authentication events
- Test with different browsers and devices

## Security Considerations

- Never commit your `.env.local` file to version control
- Use Firebase Security Rules to protect user data
- Regularly review and update your security rules
- Consider implementing rate limiting for authentication endpoints
- Use HTTPS in production

## Support

For more information, refer to:
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
