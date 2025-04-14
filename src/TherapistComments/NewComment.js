import React, { useState } from "react";
import "./Comment.css";

export default function NewComment({ handleSubmit }) {
    const [text, setText] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            handleSubmit(text);
            setText("");
        }
    };

    return (
        <form className="comment-form" onSubmit={onSubmit}>
            <textarea
                className="comment-input"
                placeholder="Write your comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button className="comment-submit-btn" type="submit">Send</button>
        </form>
    );
}
