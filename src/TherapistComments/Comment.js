import React, { useState, useRef, useEffect } from "react";
import "./Comment.css";
import { formatDistanceToNow } from "date-fns";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../services/authContext";

export default function Comment({ id, content, createdAt, user, replies = [], therapistId, refreshComments }) {
    const displayTime = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    const { currentUser, userData } = useAuth();
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const replyRef = useRef(null);

    const isTherapist = currentUser?.uid === therapistId;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (replyRef.current && !replyRef.current.contains(event.target)) {
                setShowReplyInput(false);
                setReplyText("");
            }
        };
        if (showReplyInput) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showReplyInput]);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;

        const reply = {
            content: replyText,
            createdAt: new Date().toISOString(),
            user: {
                userId: currentUser.uid,
                name: userData.firstName,
                surname: userData.lastName,
                photoURL: userData.photoURL
            }
        };

        const commentRef = doc(db, "reviews", id);
        await updateDoc(commentRef, {
            replies: arrayUnion(reply)
        });

        setReplyText("");
        setShowReplyInput(false);
        refreshComments();
    };

    return (
        <div className="comment-container">
            <div className="comment">
                <div className="avatar">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User Avatar" className="avatar-image" />
                    ) : (
                        <span className="initials">
                            {user?.name?.[0] || "A"}{user?.surname?.[0] || "N"}
                        </span>
                    )}
                </div>
                <div className="comment-body">
                    <div className="comment-heading">
                        <p className="username">{user?.name} {user?.surname}</p>
                        <p className="date">{displayTime}</p>
                    </div>
                    <div className="comment-content">
                        <p>{content}</p>
                    </div>

                    {isTherapist && !showReplyInput && (
                        <button className="reply-toggle" onClick={() => setShowReplyInput(true)}>
                            Reply
                        </button>
                    )}

                    {showReplyInput && (
                        <div className="reply-box" ref={replyRef}>
                            <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                            <button onClick={handleReplySubmit}>Send</button>
                        </div>
                    )}

                    {replies.length > 0 && (
                        <div className="replies">
                            {replies.map((reply, index) => {
                                const replyTime = formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true });
                                return (
                                    <div key={index} className="reply">
                                        <div className="avatar">
                                            {reply.user?.photoURL ? (
                                                <img src={reply.user.photoURL} alt="User Avatar" className="avatar-image" />
                                            ) : (
                                                <span className="initials">
                                                    {reply.user?.name?.[0] || "A"}{reply.user?.surname?.[0] || "N"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="reply-body">
                                            <div className="comment-heading">
                                                <p className="username">{reply.user?.name} {reply.user?.surname}</p>
                                                <p className="date">{replyTime}</p>
                                            </div>
                                            <div className="comment-content">
                                                <p>{reply.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}