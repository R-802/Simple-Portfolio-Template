import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
            console.log("Analytics initialized:", analytics); // Log once confirmed
        } else {
            console.warn("Analytics not supported");
        }
    }).catch((error) => {
        console.error("Error checking analytics support:", error);
    });
}

async function getAuthToken() {
    const currentUser = auth.currentUser; // Use the initialized auth instance
    if (!currentUser) {
        throw new Error("User not authenticated");
    }
    try {
        return await currentUser.getIdToken();
    } catch (error) {
        console.error("Error getting auth token:", error);
        throw new Error("Failed to get auth token");
    }
}

export { db, auth, analytics, getAuthToken };
