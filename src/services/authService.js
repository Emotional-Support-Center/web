import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";

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
