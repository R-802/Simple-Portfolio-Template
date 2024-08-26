import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDW2o6-U_yfOchrCybxuca3XVPzNWpG0xY",
    authDomain: "portfolio-template-demo.firebaseapp.com",
    projectId: "portfolio-template-demo",
    storageBucket: "portfolio-template-demo.appspot.com",
    messagingSenderId: "341276079607",
    appId: "1:341276079607:web:9dcf6bcd10278a43dfaaf2",
    measurementId: "G-3S2QS1PW2C"
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

export { db, auth, analytics };
