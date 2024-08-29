import { initializeApp } from "firebase/app";

import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
    // Only run client-side code
    import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
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
    });
}

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Only run client-side code

    connectFirestoreEmulator(db, 'localhost', 8081);
}

async function getAuthToken() {
    if (typeof window !== 'undefined') {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }
        try {
            return await currentUser.getIdToken();
        } catch (error) {
            console.error("Error getting auth token:", error);
            throw new Error("Failed to get auth token");
        }
    } else {
        throw new Error("Auth token can only be retrieved client-side");
    }
}

export { db, auth, analytics, getAuthToken };
