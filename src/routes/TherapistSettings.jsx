import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase/firebase";
import { useAuth } from "../services/authContext";
import HeadBarTherapist from "../components/therapistHeadBar";
import LeftbarTherapist from "../components/therapistLeftBar";
import "../css/TherapistSettings.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Settings = () => {
    const { currentUser, userData, setUserData } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        fee: "",
        about: "",
        specialties: "",
        verified: false,
        photo: null,
        certificate: null,
    });

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                fee: userData.fee || "",
                about: userData.about || "",
                specialties: userData.specialties || "",
                verified: userData.verified || false,
                photo: null,
                certificate: null,
            });
        }
    }, [userData]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) =>
        setForm({ ...form, photo: e.target.files[0] });

    const handleCertificateChange = (e) =>
        setForm({ ...form, certificate: e.target.files[0] });

    const handleSave = async () => {
        try {
            let photoURL = userData?.photoURL || "";
            let certificateURL = userData?.certificateURL || "";

            if (form.photo) {
                const photoRef = ref(storage, `therapists/${currentUser.uid}/profile`);
                await uploadBytes(photoRef, form.photo);
                photoURL = await getDownloadURL(photoRef);
            }

            if (form.certificate) {
                const certRef = ref(storage, `therapists/${currentUser.uid}/certificate`);
                await uploadBytes(certRef, form.certificate);
                certificateURL = await getDownloadURL(certRef);
            }

            const docRef = doc(db, "therapists", currentUser.uid);
            const updatedData = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                fee: form.fee.trim(),
                about: form.about.trim(),
                specialties: form.specialties.trim(),
                photoURL,
                certificateURL,
            };

            await updateDoc(docRef, updatedData);
            setUserData({ ...userData, ...updatedData });
            alert("Your information has been updated.");
            setEditable(false);
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update your information.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your account?");
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "therapists", currentUser.uid));
            await deleteUser(auth.currentUser);
            alert("Account deleted.");
            window.location.href = "/auth";
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete account.");
        }
    };

    return (
        <div className="dashboard-layout">
            <LeftbarTherapist />
            <div className="dashboard-main">
                <HeadBarTherapist />
                <div className="dashboard-content">
                    <div className="settings-container">
                        <h2>Settings</h2>

                        <div className="form-group">
                            <label>First Name</label>
                            <input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Appointment Fee</label>
                            <input name="fee" value={form.fee} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>About</label>
                            <textarea name="about" value={form.about} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Speciality</label>
                            <input name="specialties" value={form.specialties} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Verified</label>
                            {form.verified ? <FaCheckCircle color="green" size={20} /> : <FaTimesCircle color="red" size={20} />}
                        </div>

                        <div className="form-group">
                            <label>Profile Photo</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Certificate Upload (PDF or PNG)</label>
                            <input type="file" accept="application/pdf,image/png" onChange={handleCertificateChange} disabled={!editable} />
                        </div>

                        <div className="settings-buttons">
                            {!editable ? (
                                <button className="edit-btn" onClick={() => setEditable(true)}>Edit Information</button>
                            ) : (
                                <button className="save-btn" onClick={handleSave}>Save Changes</button>
                            )}
                        </div>

                        <h2 className="section-title">Delete your account</h2>
                        <div className="delete-wrapper">
                            <button className="delete-btn" onClick={handleDeleteAccount}>
                                Delete Account
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
