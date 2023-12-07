import React from "react";

interface MessageProps {
  username: string;
  text: string;
}

const Message: React.FC<MessageProps> = ({ username, text }) => {
    return (
        <div className="message">
            <p className="message-username">{username}</p>
            <p className="message-text">{text}</p>
        </div>
    );
};

export default Message;
