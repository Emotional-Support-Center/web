import React, { useState, useEffect } from 'react';
import '../css/TherapistPopup.css';
import { db, storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const TherapistInfoPopup = ({ userId, onClose, onSave }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        fee: '',
        about: '',
        specialties: '',
        photo: null,
        certificate: null,
    });

    const [photoURL, setPhotoURL] = useState('');
    const [certificateURL, setCertificateURL] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'therapists', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    fee: data.fee || '',
                    about: data.about || '',
                    specialties: data.specialties || '',
                    photo: null,
                    certificate: null,
                });
                setPhotoURL(data.photoURL || '');
                setCertificateURL(data.certificateURL || '');
            }
        };
        fetchData();
    }, [userId]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) =>
        setForm({ ...form, photo: e.target.files[0] });

    const handleCertificateChange = (e) =>
        setForm({ ...form, certificate: e.target.files[0] });

    const handleSubmit = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            alert("First Name and Last Name are required.");
            return;
        }

        try {
            let newPhotoURL = photoURL;
            let newCertificateURL = certificateURL;

            if (form.photo) {
                const photoRef = ref(storage, `therapists/${userId}/profile`);
                await uploadBytes(photoRef, form.photo);
                newPhotoURL = await getDownloadURL(photoRef);
            }

            if (form.certificate) {
                const certRef = ref(storage, `therapists/${userId}/certificate`);
                await uploadBytes(certRef, form.certificate);
                newCertificateURL = await getDownloadURL(certRef);
            }

            const updatedData = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                fee: form.fee.trim(),
                about: form.about.trim(),
                specialties: form.specialties.trim(),
                photoURL: newPhotoURL,
                certificateURL: newCertificateURL,
                showWelcomePopup: false,
            };

            await setDoc(doc(db, 'therapists', userId), updatedData, { merge: true });

            onSave();
            onClose();
        } catch (err) {
            console.error("Error saving therapist info:", err);
            alert("Failed to save data.");
        }
    };

    const handleContinueLater = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            alert("First Name and Last Name are required to continue later.");
            return;
        }

        const partialData = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            showWelcomePopup: false,
        };

        if (form.fee.trim()) partialData.fee = form.fee.trim();
        if (form.about.trim()) partialData.about = form.about.trim();
        if (form.specialties.trim()) partialData.specialties = form.specialties.trim();

        try {
            await setDoc(doc(db, 'therapists', userId), partialData, { merge: true });

            onSave();
            onClose();
        } catch (err) {
            console.error("Error updating partial therapist info:", err);
            alert("Failed to save partial data.");
        }
    };

    return (
        <div className="popup-backdrop">
            <div className="popup-form">
                <h2>Welcome to Us!</h2>
                <p>Please fill in your information to get started.</p>

                <div className="form-group">
                    <label>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Appointment Fee</label>
                    <input name="fee" value={form.fee} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>About</label>
                    <textarea name="about" value={form.about} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Speciality</label>
                    <input name="specialties" value={form.specialties} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="form-group">
                    <label>Certificate Upload (PDF or PNG)</label>
                    <input type="file" accept="application/pdf,image/png" onChange={handleCertificateChange} />
                </div>

                <div className="popup-buttons">
                    <button onClick={handleSubmit}>Save</button>
                    <button onClick={handleContinueLater}>Continue Later</button>
                </div>
            </div>
        </div>
    );
};

export default TherapistInfoPopup;
