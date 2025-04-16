
import {
    doc,
    getDoc,
    setDoc,
    addDoc,
    serverTimestamp,
    deleteDoc,
    updateDoc,
    collection,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { createNotification } from "./notificationService";

// Saat bazlı randevu oluşturma + availability güncelleme + bildirim
export const createAppointment = async ({
                                            therapistId,
                                            patientId,
                                            date,
                                            time,
                                            fee,
                                            availability,
                                            setAvailability,
                                            resetSelection
                                        }) => {
    const appointmentData = {
        therapistId,
        patientId,
        date,
        time,
        fee,
        status: "pending",
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "appointments"), appointmentData);

    // Güncelle availability: available'dan çıkar, busy'ye ekle
    const availabilityRef = doc(db, "availability", therapistId);
    const updated = { ...availability };

    if (!updated[date]) updated[date] = { available: [], busy: [] };

    updated[date].available = updated[date].available.filter(h => h !== time);
    if (!updated[date].busy.includes(time)) {
        updated[date].busy.push(time);
        updated[date].busy.sort();
    }

    await setDoc(availabilityRef, updated);
    setAvailability(updated);

    await createNotification({
        recipientId: therapistId,
        senderId: patientId,
        type: "appointment_request",
        message: "has requested an appointment"
    });

    resetSelection();
    return docRef.id;
};

// Randevuyu onayla (status günceller, bildirim gönderir)
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

// Randevuyu reddet (randevuyu siler, availability'yi geri çevirir, bildirim gönderir)
export const rejectAppointment = async (appointmentId, therapistId, patientId) => {
    const ref = doc(db, "appointments", appointmentId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data();
        const { date, time } = data;

        await deleteDoc(ref);

        const availabilityRef = doc(db, "availability", therapistId);
        const availabilitySnap = await getDoc(availabilityRef);
        if (availabilitySnap.exists()) {
            const availability = availabilitySnap.data();
            const day = availability[date] || { available: [], busy: [] };

            day.busy = day.busy.filter(h => h !== time);
            if (!day.available.includes(time)) {
                day.available.push(time);
                day.available.sort();
            }

            const updated = { ...availability, [date]: day };
            await setDoc(availabilityRef, updated);
        }

        await createNotification({
            recipientId: patientId,
            senderId: therapistId,
            type: "appointment_rejected",
            message: "has rejected your appointment request"
        });
    }
};
