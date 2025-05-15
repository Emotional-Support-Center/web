import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../css/PatientNotePopup.css";

const PatientNotePopup = ({ patient, onClose }) => {
    const [note, setNote] = useState("");
    const [noteId, setNoteId] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const q = query(
                    collection(db, "notes"),
                    where("patientId", "==", patient.id),
                    where("therapistId", "==", patient.therapistId)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const noteDoc = snapshot.docs[0];
                    setNote(noteDoc.data().content);
                    setNoteId(noteDoc.id);
                }
            } catch (error) {
                console.error("Note fetch error:", error);
            }
        };

        if (patient?.id && patient?.therapistId) {
            fetchNote();
        }
    }, [patient]);

    const handleSave = async () => {
        if (!patient?.id || !patient?.therapistId) {
            console.error("Missing patientId or therapistId");
            return;
        }

        if (noteId) {
            await updateDoc(doc(db, "notes", noteId), {
                content: note,
                updatedAt: Timestamp.now(),
            });
        } else {
            await addDoc(collection(db, "notes"), {
                patientId: patient.id,
                therapistId: patient.therapistId,
                content: note,
                updatedAt: Timestamp.now(),
            });
        }

        onClose();
    };

    return (
        <div className="note-popup-overlay">
            <div className="note-popup">
                <h3>Patient Notes</h3>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write notes about the patient..."
                />
                <div className="note-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default PatientNotePopup;
