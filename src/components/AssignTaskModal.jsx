import React, { useState } from "react";
import "../css/AssignTaskModal.css";

const AssignTaskModal = ({ patient, onClose, onSubmit }) => {
    const [data, setData] = useState({ title: "", description: "", type: "", file: null });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = () => {
        if (!data.title || !data.type) return;
        onSubmit(data);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Assign Task to {patient.firstName}</h3>
                <input name="title" type="text" placeholder="Task Title" onChange={handleChange} />
                <textarea name="description" placeholder="Description" onChange={handleChange} />
                <select name="type" onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option value="research">Research</option>
                    <option value="essay">Essay</option>
                    <option value="reading">Reading</option>
                </select>
                {data.type === "reading" && (
                    <input name="file" type="file" onChange={handleChange} />
                )}
                <div className="modal-buttons">
                    <button className="cancel" onClick={onClose}>Cancel</button>
                    <button className="submit" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default AssignTaskModal;
