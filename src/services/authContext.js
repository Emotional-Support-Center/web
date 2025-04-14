import React, { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // First, check if user is a therapist
                    const therapistRef = doc(db, 'therapists', user.uid);
                    const therapistSnap = await getDoc(therapistRef);
                    if (therapistSnap.exists()) {
                        setUserData(therapistSnap.data());
                        setUserRole("therapist");
                        setLoading(false);
                        return;
                    }

                    // If not a therapist, check if user is a patient
                    const patientRef = doc(db, 'patients', user.uid);
                    const patientSnap = await getDoc(patientRef);
                    if (patientSnap.exists()) {
                        setUserData(patientSnap.data());
                        setUserRole("patient");
                    } else {
                        setUserData(null);
                        setUserRole(null);
                    }
                } catch (err) {
                    console.error("Error fetching user info:", err);
                    setUserData(null);
                    setUserRole(null);
                }
            } else {
                setUserData(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsub;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
            setUserRole(null);
            window.location.href = "/auth";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, userData, userRole, setUserData, handleLogout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
