import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {deleteUser, updatePassword} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase/firebase";
import { useAuth } from "../services/authContext";
import "../css/TherapistSettings.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Settings = () => {
    const { currentUser, userData, setUserData } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        feeIndividual: "",
        feeGroup: "",
        languages: "",
        location: "",
        specialties: "",
        about: "",
        verified: false,
        photo: null,
        certificate: null,
    });

    const [editable, setEditable] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    useEffect(() => {
        if (userData) {
            setForm({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                feeIndividual: userData.feeIndividual || "",
                feeGroup: userData.feeGroup || "",
                languages: userData.languages || "",
                location: userData.location || "",
                specialties: userData.specialties || "",
                about: userData.about || "",
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

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            await updatePassword(auth.currentUser, newPassword);
            alert("Password successfully changed.");
            setShowPasswordChange(false);
            setNewPassword("");
        } catch (err) {
            console.error("Password update error:", err);
            alert("Failed to change password. Please log in again.");
        }
    };
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
                feeIndividual: form.feeIndividual.trim(),
                feeGroup: form.feeGroup.trim(),
                languages: form.languages.trim(),
                location: form.location.trim(),
                specialties: form.specialties.trim(),
                about: form.about.trim(),
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
            <div className="dashboard-main">
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
                            <label>Individual Appointment Fee</label>
                            <input name="feeIndividual" value={form.feeIndividual} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Group Appointment Fee</label>
                            <input name="feeGroup" value={form.feeGroup} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Languages Spoken (comma separated)</label>
                            <input name="languages" value={form.languages} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Specialities (comma separated)</label>
                            <input name="specialties" value={form.specialties} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input name="location" value={form.location} onChange={handleChange} disabled={!editable} />
                        </div>

                        <div className="form-group">
                            <label>About</label>
                            <textarea name="about" value={form.about} onChange={handleChange} disabled={!editable} />
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
                        <h2 className="section-title">Change your password</h2>
                        <div className="password-wrapper">
                            {!showPasswordChange ? (
                                <button className="password-btn" onClick={() => setShowPasswordChange(true)}>
                                    Change Password
                                </button>
                            ) : (
                                <div className="password-change-form">
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button className="password-save-btn" onClick={handleChangePassword}>
                                        Save Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
