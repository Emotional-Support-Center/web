import React, { useState, useEffect } from 'react';
import '../css/TherapistPopup.css';
import { db, storage } from '../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PatientInfoPopup = ({ userId, onClose, onSave }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        photo: null,
    });

    const [photoURL, setPhotoURL] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const refDoc = doc(db, 'patients', userId);
            const docSnap = await getDoc(refDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    photo: null,
                });
                setPhotoURL(data.photoURL || '');
            }
        };
        fetchData();
    }, [userId]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) =>
        setForm({ ...form, photo: e.target.files[0] });

    const handleSubmit = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setErrorMessage('First Name and Last Name are required.');
            return;
        }
        setErrorMessage('');

        try {
            let newPhotoURL = photoURL;
            if (form.photo) {
                const photoRef = ref(storage, `patients/${userId}/profile`);
                await uploadBytes(photoRef, form.photo);
                newPhotoURL = await getDownloadURL(photoRef);
            }

            const updatedData = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                photoURL: newPhotoURL,
                showWelcomePopup: false,
            };

            await setDoc(doc(db, 'patients', userId), updatedData, { merge: true });
            onSave(updatedData);
            onClose();
        } catch (err) {
            console.error('Error saving patient info:', err);
            setErrorMessage('Failed to save your information.');
        }
    };

    return (
        <div className="popup-backdrop">
            <div className="popup-form">
                <h2>Welcome!</h2>
                <p>Please enter your details to get started.</p>

                {errorMessage && <div className="error-banner">{errorMessage}</div>}

                <div className="form-group">
                    <label>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Profile Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="popup-buttons">
                    <button onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default PatientInfoPopup;
