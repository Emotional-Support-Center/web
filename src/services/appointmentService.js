import { db } from "../firebase/firebase";
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { createNotification } from "./notificationService";

export const createAppointment = async ({ therapistId, patientId, date, time,fee }) => {
    const appointmentData = {
        therapistId,
        patientId,
        date,
        time,
        status: "pending",
        createdAt: serverTimestamp(),
        fee,
    };

    const docRef = await addDoc(collection(db, "appointments"), appointmentData);

    await createNotification({
        recipientId: therapistId,
        senderId: patientId,
        type: "appointment_request",
        message: "has requested an appointment"
    });

    return docRef.id;
};

export const approveAppointment = async (appointmentId, therapistId, patientId) => {
    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, { status: "waitingPayment" });

    await createNotification({
        recipientId: patientId,
        senderId: therapistId,
        type: "payment_request",
        message: "has accepted your appointment request. Please proceed with the payment."
    });
};

export const rejectAppointment = async (appointmentId, therapistId, patientId) => {
    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, { status: "rejected" });

    await createNotification({
        recipientId: patientId,
        senderId: therapistId,
        type: "appointment_rejected",
        message: "has rejected your appointment request"
    });
};
