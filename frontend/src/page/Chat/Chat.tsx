import React from "react";
import "./Chat.css";
// import { userChats } from "../../api/ChatRequests";
// import { useSelector } from "react-redux";
// import { io } from "socket.io-client";


const Chat = () => {

    // const [chats, setChats] = useState([]);
    // const {user} = useSelector((state) => state.user);
    return (
        <>
            <div className="Chat">
                {/* Left side */}
                <div className="Left-side-chat">
                    <div className="Chat-container">
                        <h2>Chats</h2>
                        <div className="Chats-list">
                            Conversations
                        </div>
                    </div>
                   
                </div>

                {/* Right side */}
                <div className="Right-side-chat">
                    Right side
                </div>
            </div>
        </>
    );   
};

export default Chat;