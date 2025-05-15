import { db } from "../firebase/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createNotification = async ({ recipientId, senderId, type, message }) => {
    try {

        let senderRef = doc(db, "therapists", senderId);
        let senderSnap = await getDoc(senderRef);


        if (!senderSnap.exists()) {
            senderRef = doc(db, "patients", senderId);
            senderSnap = await getDoc(senderRef);
        }

        if (!senderSnap.exists()) {
            console.warn("Sender not found in therapists or patients:", senderId);
            return;
        }

        const senderData = senderSnap.data();

        const notificationData = {
            userId: recipientId,
            senderId,
            firstName: senderData.firstName || "Unknown",
            lastName: senderData.lastName || "",
            photoURL: senderData.photoURL || "/default-avatar.png",
            type,
            message,
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, "notifications"), notificationData);
    } catch (err) {
        console.error("Notification error:", err);
    }
};
