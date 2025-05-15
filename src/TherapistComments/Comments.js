import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import NewComment from "./NewComment";
import { collection, query, where, orderBy, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../services/authContext";

export default function Comments({ therapistId }) {
    const [comments, setComments] = useState([]);
    const { currentUser, userData } = useAuth();

    const fetchComments = async () => {
        const q = query(
            collection(db, "reviews"),
            where("therapistId", "==", therapistId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(data);
    };

    useEffect(() => {
        fetchComments();
    }, [therapistId]);

    const addComment = async (text) => {
        const newComment = {
            therapistId,
            content: text,
            createdAt: new Date().toISOString(),
            user: {
                userId: currentUser.uid,
                name: userData.firstName,
                surname: userData.lastName,
                photoURL: userData.photoURL
            }
        };
        await addDoc(collection(db, "reviews"), newComment);
        fetchComments();
    };

    const isOwnProfile = currentUser?.uid === therapistId;

    return (
        <div className="comments-wrapper">
            <h3 className="comments-title">Reviews</h3>

            <div className="comments-list">
                {comments.map(comment => (
                    <Comment key={comment.id} {...comment} therapistId={therapistId} refreshComments={fetchComments} />
                ))}

            </div>

            {!isOwnProfile && <NewComment handleSubmit={addComment} />}
        </div>
    );

}