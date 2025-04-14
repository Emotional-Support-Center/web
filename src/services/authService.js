import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';


export const registerPatient = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "patients", user.uid), {
        email,
        showWelcomePopup: true
    });
};


export const registerTherapist = async (email, password, extraData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "therapists", user.uid), {
        email,
        showWelcomePopup: true,
        verified:false,
        ...extraData
    });
};


export const loginUser = async (email, password, role) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const collection = role === "patient" ? "patients" : "therapists";
    const docRef = doc(db, collection, user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { success: true, userData: docSnap.data() };
    } else {
        throw new Error("User not found in selected role!");
    }
};
