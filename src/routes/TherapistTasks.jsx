import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    Timestamp,
    doc,
    getDoc,
} from "firebase/firestore";
import { useAuth } from "../services/authContext";
import AssignTaskModal from "../components/AssignTaskModal";
import PatientNotePopup from "../components/PatientNotePopup";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import "../css/TherapistTasks.css";

const TherapistTasks = () => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState({});
    const [activePatientId, setActivePatientId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activeNotePatient, setActiveNotePatient] = useState(null);

    useEffect(() => {
        if (currentUser?.uid) {
            fetchAppointments();
            fetchTasks();
        }
    }, [currentUser]);

    const fetchAppointments = async () => {
        const q = query(
            collection(db, "appointments"),
            where("therapistId", "==", currentUser.uid),
            where("status", "==", "done")
        );
        const snapshot = await getDocs(q);
        const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(appts);

        const uniqueIds = [...new Set(appts.map(a => a.patientId))];
        const map = {};
        await Promise.all(uniqueIds.map(async (pid) => {
            const ref = doc(db, "patients", pid);
            const snap = await getDoc(ref);
            if (snap.exists()) map[pid] = snap.data();
        }));
        setPatients(map);
    };

    const fetchTasks = async () => {
        const q = query(
            collection(db, "tasks"),
            where("therapistId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleAssignTask = async (patientId, taskData) => {
        let fileUrl = "";

        if (taskData.file) {
            const storageRef = ref(storage, `taskFiles/${Date.now()}-${taskData.file.name}`);
            await uploadBytes(storageRef, taskData.file);
            fileUrl = await getDownloadURL(storageRef);
        }

        const task = {
            title: taskData.title,
            description: taskData.description,
            type: taskData.type,
            fileUrl: fileUrl || "",
            therapistId: currentUser.uid,
            patientId,
            createdAt: Timestamp.now(),
            status: "not submitted",
        };

        await addDoc(collection(db, "tasks"), task);
        setActivePatientId(null);
        fetchTasks();
    };

    const uniquePatientIds = [...new Set(appointments.map(a => a.patientId))];

    return (
        <div className="dashboard-content therapist-tasks-page">
            <h2 className="section-title">Assign Task</h2>
            <div className="patients-grid">
                {uniquePatientIds.map(pid => {
                    const p = patients[pid];
                    if (!p) return null;
                    return (
                        <div key={pid} className="patient-card">
                            <div className="patient-info">
                                <img src={p.photoURL} alt="avatar" />
                                <div>
                                    <span className="patient-name">{p.firstName} {p.lastName}</span>
                                </div>
                            </div>
                            <button onClick={() => setActivePatientId(pid)}>Assign Task</button>
                            <button
                                className="note-btn"
                                onClick={() =>
                                    setActiveNotePatient({ ...p, id: pid, therapistId: currentUser.uid })
                                }
                            >
                                Notes
                            </button>

                            {activePatientId === pid && (
                                <AssignTaskModal
                                    patient={p}
                                    onClose={() => setActivePatientId(null)}
                                    onSubmit={(data) => handleAssignTask(pid, data)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <h2 className="section-title">View Tasks</h2>
            <div className="task-table-wrapper">
                <div className="task-table-header">
                    <span>Patient</span>
                    <span>Task</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span>File</span>
                </div>
                <div className="task-table">
                    {tasks.map(task => {
                        const p = patients[task.patientId];
                        return (
                            <div className="task-row" key={task.id}>
                                <div className="patient-info">
                                    <img src={p?.photoURL} alt="pp" />
                                    <span className="patient-name">{p?.firstName} {p?.lastName}</span>
                                </div>
                                <div>{task.title}</div>
                                <div>{task.type}</div>
                                <div>
                                    <span className={`status-tag ${task.status.replace(" ", "-")}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div>
                                    {task.fileUrl ? (
                                        <a href={task.fileUrl} target="_blank" rel="noreferrer">
                                            <button>View</button>
                                        </a>
                                    ) : "-"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {activeNotePatient && (
                <PatientNotePopup
                    patient={activeNotePatient}
                    onClose={() => setActiveNotePatient(null)}
                />
            )}
        </div>
    );
};

export default TherapistTasks;
