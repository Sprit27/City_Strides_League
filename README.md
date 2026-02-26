# City Strides League

Track your runs, trace your routes, and climb the leaderboard.

## Features
- **Real-time Map Tracking**: Uses the browser's Geolocation API to trace your run on an interactive map.
- **Firebase Auth**: Secure login via Email/Password or Google Sign-in.
- **Firestore Integration**: Persistently stores user profiles and run statistics.
- **Live Leaderboard**: Compete with other runners based on distance, speed, and pace.

## Getting Started

1.  **Firebase Setup**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Firestore Database**.
    - Enable **Authentication** with Email/Password and Google providers.
2.  **Environment Variables**: Ensure your `.env` file contains your Firebase project configuration keys.
3.  **Run locally**:
    ```bash
    npm install
    npm run dev
    ```

## How to push to GitHub

1.  **Create a Repository**: Go to [github.com/new](https://github.com/new) and create a new repository (don't initialize it with a README).
2.  **Open Terminal**: Open your terminal in this project's root folder.
3.  **Initialize & Commit**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of City Strides app"
    ```
4.  **Set Remote & Push**:
    Replace the URL with your actual GitHub repository URL:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Deployment
This project is configured for **Firebase App Hosting**. Updates pushed to your main branch on GitHub can be automatically deployed if you connect your repository in the Firebase Console.
