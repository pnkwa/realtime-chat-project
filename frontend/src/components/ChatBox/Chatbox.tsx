import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { getMassages } from "../../api/MessageRequets";
import InputEmoji from "react-input-emoji";

interface chatBoxProps {
    chat: { 
        chatId: string;
        members: string[];
    } | null; // Make chat prop nullable
    currentUserId: string;
}

interface Message {
    messageId: string;
    senderId: string;
    text: string;
    createAt: string;
}

interface UserData {
    username: string;
    profileImage: string;
}

const ChatBox: React.FC<chatBoxProps> = ({ chat, currentUserId }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    useEffect(() => {
        console.log("Chat:", chat);
        console.log("Current User ID:", currentUserId);

        const userId = chat?.members?.find((id) => String(id) !== String(currentUserId));
        console.log("Found User ID:", userId);

        const getUserData = async () => {
            try {
                if (userId) {
                    console.log("Fetching user data for user ID:", userId);
                    const response = await getUser(userId);
                    console.log("API response:", response);

                    const userData: UserData = await response.data;
                    setUserData(userData);
                    console.log("Chat box user data:", userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (chat !== null) {
            getUserData();
        }
    }, [chat, currentUserId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (chat) {
                    console.log("chat ID: "+chat.chatId);
                    const { data } = await getMassages(chat.chatId);
                    setMessages(data);
                    console.log("msg: " , data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [chat]);

    if (!chat) {
        return <div>No chat selected</div>;
    }

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { 
            year: "numeric", 
            month: "short", 
            day: "numeric", 
            hour: "numeric", 
            minute: "numeric", 
            second: "numeric" 
        };
    
        const formattedDate = new Date(dateString).toLocaleDateString("en-US", options);
        return formattedDate;
    };
    
    const handleChange = (newMessages: string) => {
        setNewMessage(newMessages);
    };

    return (
        <>
            <div className="ChatBox-container">
                <div className="chat-header">
                    <div className="follower">
                        <img 
                            src={"http://localhost:5001/Images/" + userData?.profileImage }
                            alt="profile" 
                            className="followerImage"
                            style={{ width: "70px" }}
                        />
                        <div className="name" style={{ fontSize: "0.8rem" }}>
                            <span>{userData?.username}</span>
                        </div>
                    </div>
                </div>
                <hr />
            </div>

            <div className="chat-body">
                {messages.map((message) => (
                    <div key={message.messageId} className={message.senderId === currentUserId ? "message own" : "message"}>
                        <span>{message.text}</span>
                        <span>{formatDate(message.createAt)}</span>
                    </div>
                ))}
            </div>

            <div className="chat-sender">
                <div>+</div>
                <div style={{ width:"900px"}}>
                    <InputEmoji
                        value={newMessage}
                        onChange={handleChange}
                    />
                </div>
                <div className="send-button button">Send</div>
            </div>
        </>
    );
};

export default ChatBox;
