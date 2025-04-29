import { db } from "../firebase/firebase";
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    getDocs, getDoc
} from "firebase/firestore";
import { createNotification } from "./notificationService";

// Create Appointment and update availability
export const createAppointment = async ({ therapistId, patientId, date, time, fee,sessionType  }) => {
    const appointmentData = {
        therapistId,
        patientId,
        date,
        time,
        status: "pending",
        createdAt: serverTimestamp(),
        fee,
        sessionType,
    };

    // 1. Appointment oluştur
    const docRef = await addDoc(collection(db, "appointments"), appointmentData);

    // 2. Availability durumunu "busy" yap
    const availabilityQuery = query(
        collection(db, "availability"),
        where("therapistId", "==", therapistId),
        where("date", "==", date),
        where("time", "==", time)
    );
    const snapshot = await getDocs(availabilityQuery);
    snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "availability", docSnap.id), {
            status: "busy",
        });
    });

    // 3. Bildirim gönder
    await createNotification({
        recipientId: therapistId,
        senderId: patientId,
        type: "appointment_request",
        message: "has requested an appointment"
    });

    return docRef.id;
};

// Approve Appointment (payment request)
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

// Reject Appointment and update availability
export const rejectAppointment = async (appointmentId, therapistId, patientId) => {
    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, { status: "rejected" });

    // Randevu bilgilerini çek
    const appointmentSnap = await getDoc(ref);
    const { date, time } = appointmentSnap.data();

    // Availability durumunu tekrar "available" yap
    const availabilityQuery = query(
        collection(db, "availability"),
        where("therapistId", "==", therapistId),
        where("date", "==", date),
        where("time", "==", time)
    );
    const snapshot = await getDocs(availabilityQuery);
    snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "availability", docSnap.id), {
            status: "available",
        });
    });

    await createNotification({
        recipientId: patientId,
        senderId: therapistId,
        type: "appointment_rejected",
        message: "has rejected your appointment request"
    });
};
