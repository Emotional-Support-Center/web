import React, { useState, useEffect } from 'react';
import '../css/TherapistPopup.css';
import { db, storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const TherapistInfoPopup = ({ userId, onClose, onSave }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        feeIndividual: '',
        feeGroup: '',
        languages: '',
        location: '',
        specialties: '',
        about: '',
        verified: false,
        photo: null,
        certificate: null,
    });

    const [photoURL, setPhotoURL] = useState('');
    const [certificateURL, setCertificateURL] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [certificateWarning, setCertificateWarning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'therapists', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    feeIndividual: data.feeIndividual || '',
                    feeGroup: data.feeGroup || '',
                    languages: data.languages || '',
                    location: data.location || '',
                    specialties: data.specialties || '',
                    about: data.about || '',
                    verified: data.verified || false,
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
            setErrorMessage("First Name and Last Name are required.");
            return;
        }

        setErrorMessage('');

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
                feeIndividual: form.feeIndividual.trim(),
                feeGroup: form.feeGroup.trim(),
                languages: form.languages.trim(),
                location: form.location.trim(),
                specialties: form.specialties.trim(),
                about: form.about.trim(),
                verified: false,
                photoURL: newPhotoURL,
                certificateURL: newCertificateURL,
                showWelcomePopup: false,
            };

            await setDoc(doc(db, 'therapists', userId), updatedData, { merge: true });

            setCertificateWarning(!newCertificateURL);
            onSave?.();   // opsiyonel çağrı
            onClose?.();  // popup hemen kapansın
        } catch (err) {
            setErrorMessage("An error occurred while saving your data.");
            console.error("Save error:", err);
        }
    };

    return (
        <div className="popup-backdrop">
            <div className="popup-form">
                <h2>Welcome to Us!</h2>
                <p>Please fill in your basic information to get started.</p>

                {errorMessage && <div className="error-banner">{errorMessage}</div>}
                {certificateWarning && (
                    <div className="certificate-warning">
                        To verify your profile, please upload your certificate from the <strong>Settings</strong> page.
                    </div>
                )}

                <div className="form-group"><label>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} /></div>
                <div className="form-group"><label>Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} /></div>
                <div className="form-group"><label>Fee (Individual)</label><input name="feeIndividual" value={form.feeIndividual} onChange={handleChange} /></div>
                <div className="form-group"><label>Fee (Group)</label><input name="feeGroup" value={form.feeGroup} onChange={handleChange} /></div>
                <div className="form-group"><label>Languages</label><input name="languages" value={form.languages} onChange={handleChange} /></div>
                <div className="form-group"><label>Location</label><input name="location" value={form.location} onChange={handleChange} /></div>
                <div className="form-group"><label>Specialties</label><input name="specialties" value={form.specialties} onChange={handleChange} /></div>
                <div className="form-group"><label>About</label><textarea name="about" value={form.about} onChange={handleChange} /></div>
                <div className="form-group"><label>Profile Photo</label><input type="file" accept="image/*" onChange={handleFileChange} /></div>
                <div className="form-group"><label>Certificate Upload (PDF or PNG)</label><input type="file" accept="application/pdf,image/png" onChange={handleCertificateChange} /></div>

                <div className="popup-buttons">
                    <button onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default TherapistInfoPopup;
