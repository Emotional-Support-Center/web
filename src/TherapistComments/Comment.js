import React from "react";
import "./Comment.css";
import { formatDistanceToNow } from "date-fns";

export default function Comment({ content, createdAt, user }) {
    const displayTime = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

    return (
        <div className="comment-container">
            <div className="comment">
                <div className="avatar">
                    <span className="initials">
                        {user?.name?.[0] || "A"}{user?.surname?.[0] || "N"}
                    </span>
                </div>
                <div className="comment-body">
                    <div className="comment-heading">
                        <p className="username">{user?.name} {user?.surname}</p>
                        <p className="date">{displayTime}</p>
                    </div>
                    <div className="comment-content">
                        <p>{content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
