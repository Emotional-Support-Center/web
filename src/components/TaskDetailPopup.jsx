import React, { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../css/TaskDetailPopup.css";

const TaskDetailPopup = ({ task, onClose }) => {
    const [file, setFile] = useState(null);

    const handleMarkDone = async () => {
        await updateDoc(doc(db, "tasks", task.id), { status: "submitted" });
        onClose();
    };

    const handleFileUpload = async () => {
        if (!file) return alert("Please select a file");
        const storageRef = ref(storage, `tasks/${task.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "tasks", task.id), {
            status: "submitted",
            fileUrl: url,
        });
        onClose();
    };

    return (
        <div className="task-popup-overlay">
            <div className="task-popup-content">
                <h3 className="popup-title">{task.title}</h3>
                <p className="popup-description">{task.description}</p>
                <p className="popup-type"><strong>Type:</strong> {task.type}</p>

                {task.type === "reading" && (
                    <>
                        {task.fileUrl && (
                            <a href={task.fileUrl} target="_blank" rel="noreferrer">
                                <button className="popup-btn view-btn">View Material</button>
                            </a>
                        )}
                        <button className="popup-btn" onClick={handleMarkDone}>Mark as Done</button>
                    </>
                )}

                {task.type === "research" && (
                    <button className="popup-btn" onClick={handleMarkDone}>Mark as Done</button>
                )}

                {task.type === "essay" && (
                    <>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button className="popup-btn" onClick={handleFileUpload}>Submit Essay</button>
                    </>
                )}

                <button className="close-btn" onClick={onClose}>✕</button>
            </div>
        </div>
    );
};

export default TaskDetailPopup;
