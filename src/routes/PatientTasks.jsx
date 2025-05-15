import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../services/authContext";
import TaskPopup from "../components/TaskDetailPopup";
import "../css/PatientTasks.css";

const PatientTasks = () => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [fileUpload, setFileUpload] = useState({});
    const [activeTask, setActiveTask] = useState(null);
    const [patientInfo, setPatientInfo] = useState(null);
    const [therapists, setTherapists] = useState({});

    useEffect(() => {
        if (currentUser?.uid) {
            fetchPatientInfo();
            fetchTherapistsAndTasks();
        }
    }, [currentUser]);

    const fetchPatientInfo = async () => {
        const snap = await getDoc(doc(db, "patients", currentUser.uid));
        if (snap.exists()) setPatientInfo(snap.data());
    };

    const fetchTherapistsAndTasks = async () => {
        const snapshot = await getDocs(collection(db, "therapists"));
        const map = {};
        snapshot.forEach((docSnap) => {
            map[docSnap.id] = { ...docSnap.data() };
        });
        setTherapists(map);
        await fetchTasks(); // after therapists loaded
    };

    const fetchTasks = async () => {
        const q = query(collection(db, "tasks"), where("patientId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTasks(list);
    };

    const handleMarkDone = async (taskId) => {
        await updateDoc(doc(db, "tasks", taskId), { status: "submitted" });
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "submitted" } : t));
        setActiveTask(null);
    };

    const handleFileChange = (taskId, file) => {
        setFileUpload((prev) => ({ ...prev, [taskId]: file }));
    };

    const handleUpload = async (task) => {
        const file = fileUpload[task.id];
        if (!file) return alert("Please select a file first");

        const storageRef = ref(storage, `tasks/${task.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "tasks", task.id), {
            status: "submitted",
            fileUrl: url,
        });

        setTasks(prev =>
            prev.map(t => t.id === task.id ? { ...t, status: "submitted", fileUrl: url } : t)
        );
        setActiveTask(null);
    };

    const assignments = tasks.filter((t) => t.status !== "submitted");
    const history = tasks.filter((t) => t.status === "submitted");
    const completionRate =
        tasks.length > 0 ? Math.round((history.length / tasks.length) * 100) : 0;

    return (
        <div className="dashboard-content">
            <h2 className="section-title">Assignments</h2>

            <div className="stats-container">
                <div className="stat-box"><p>Total Tasks</p><h3>{tasks.length}</h3></div>
                <div className="stat-box"><p>Completed</p><h3>{history.length}</h3></div>
                <div className="stat-box"><p>Completion Rate</p><h3>{completionRate}%</h3></div>
            </div>

            <div className="cards-container11">
                {assignments.map((task) => {
                    const therapist = therapists[task.therapistId];
                    return (
                        <div className="assignment-card" key={task.id}>
                            {therapist && (
                                <div className="therapist-info">
                                    <img src={therapist.photoURL} alt="pp" />
                                    <span>{therapist.firstName} {therapist.lastName}</span>
                                </div>
                            )}
                            <h4>{task.title}</h4>
                            <p>{task.type}</p>
                            <button onClick={() => setActiveTask(task)}>View Task</button>
                        </div>
                    );
                })}
            </div>

            <h2 className="section-title">Task History</h2>
            <div className="task-history">
                {history.map((task) => {
                    const therapist = therapists[task.therapistId];
                    if (!therapist) return null;
                    return (
                        <div key={task.id} className="task-row">
                            <div className="history-therapist">
                                <img src={therapist.photoURL} alt="pp" />
                                <span>{therapist.firstName} {therapist.lastName}</span>
                            </div>
                            <span>{task.title}</span>
                            <span>{task.type}</span>
                            <span className="status submitted">Submitted</span>
                            {task.fileUrl && (
                                <a href={task.fileUrl} target="_blank" rel="noreferrer">
                                    <button>View File</button>
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>

            {activeTask && patientInfo && (
                <TaskPopup
                    task={activeTask}
                    onClose={() => setActiveTask(null)}
                    onSubmit={() =>
                        activeTask.type === "essay"
                            ? handleUpload(activeTask)
                            : handleMarkDone(activeTask.id)
                    }
                    onFileChange={(file) => handleFileChange(activeTask.id, file)}
                    fileRequired={activeTask.type === "essay"}
                    patient={patientInfo}
                />
            )}
        </div>
    );
};

export default PatientTasks;
