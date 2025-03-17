// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDEXYxnJ-JqsiQ7WGPv0_VkL3a1Rszq6DY",
    authDomain: "emotionalsupportcenter.firebaseapp.com",
    databaseURL: "https://emotionalsupportcenter-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "emotionalsupportcenter",
    storageBucket: "emotionalsupportcenter.firebasestorage.app",
    messagingSenderId: "371135122162",
    appId: "1:371135122162:web:e418af9a73b0058c6dde6b",
    measurementId: "G-0H3899194M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);