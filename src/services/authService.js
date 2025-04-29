import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import {GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export const registerPatient = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "patients", user.uid), {
        email,
        showWelcomePopup: true
    });
};


export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error("Failed to send reset email: " + error.message);
    }
};
export const registerTherapist = async (email, password, extraData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "therapists", user.uid), {
        email,
        showWelcomePopup: true,
        verified: false,
        ...extraData
    });
};



export const loginUser = async (email, password, role) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const collection = role === "patient" ? "patients" : "therapists";
    const docRef = doc(db, collection, user.uid);
    const docSnap = await getDoc(docRef);
    if (!user.emailVerified) {
        throw new Error("Please verify your email address before logging in.");
    }
    if (docSnap.exists()) {
        return { success: true, userData: docSnap.data() };
    } else {
        throw new Error("User not found in selected role!");
    }
};
export const signInWithGoogle = async (role) => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const isTherapistRef = doc(db, "therapists", user.uid);
    const isTherapistSnap = await getDoc(isTherapistRef);

    const isPatientRef = doc(db, "patients", user.uid);
    const isPatientSnap = await getDoc(isPatientRef);

    // Kullanıcı zaten başka bir rolde kayıtlıysa hata döndür
    if (role === "patient" && isTherapistSnap.exists()) {
        throw new Error("This email is already registered as a therapist.");
    }
    if (role === "therapist" && isPatientSnap.exists()) {
        throw new Error("This email is already registered as a patient.");
    }

    // Zaten kayıtlıysa userData döndür
    const existingSnap = role === "patient" ? isPatientSnap : isTherapistSnap;
    if (existingSnap.exists()) {
        return { success: true, userData: existingSnap.data() };
    }

    // Yeni kayıt oluştur
    const docRef = role === "patient" ? isPatientRef : isTherapistRef;
    const newUserData = {
        email: user.email,
        showWelcomePopup: true,
        createdAt: new Date().toISOString(),
        ...(role === "therapist" ? { verified: false } : {})
    };

    await setDoc(docRef, newUserData);
    return { success: true, userData: newUserData };
};
