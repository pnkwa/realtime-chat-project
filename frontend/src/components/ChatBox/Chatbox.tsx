import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { addMessages, getMassages } from "../../api/MessageRequets";
import InputEmoji from "react-input-emoji";
import TimeAgo from "react-timeago";

interface chatBoxProps {
  chat: {
    chatId: string;
    members: string[];
  } | null;
  currentUserId: string;
  setSendMessage: (
    message: {
      chatId: string;
      senderId: string;
      text: string;
      receiverId: string;
    }
  ) => void;

  receiveMessage: ReceiveMessage;
}

interface Message {
  msgId: string;
  senderId: string;
  text: string;
  createAt: string;
  chatId: string
}

interface UserData {
  username: string;
  profileImage: string;
}

interface ReceiveMessage {
    msgId: string;
    senderId: string;
    text: string;
    createAt: string;
    chatId: string;
    receiverId: string;
}

const ChatBox: React.FC<chatBoxProps> = ({
    chat,
    currentUserId,
    setSendMessage,
    receiveMessage,
}) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
    // Fetch user data when the chat changes
        const getUserData = async () => {
            try {
                if (chat?.members) {
                    const userId = chat.members.find((id) => id != currentUserId);
                    if (userId) {
                        const response = await getUser(userId);
                        const userData: UserData = await response.data;
                        setUserData(userData);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        getUserData();
    }, [chat, currentUserId]);

    useEffect(() => {
    // Fetch messages when the chat changes
        const fetchMessages = async () => {
            try {
                if (chat) {
                    const { data } = await getMassages(chat.chatId);
                    setMessages(data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchMessages();
    }, [chat]);

    useEffect(() => {
    // Receive a new message and update state
        if (receiveMessage !== null && receiveMessage.chatId == chat?.chatId) {
            console.log("Data received in child ChatBox: ", receiveMessage);
            setMessages([...messages, receiveMessage]);
        }
    }, [receiveMessage]);

    const handleChange = (newMessages: string) => {
        setNewMessage(newMessages);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = {
            chatId: chat?.chatId || "",
            senderId: currentUserId,
            text: newMessage,
        };
    
        try {
           
            // Send the message to the socket server
            const receiverId = chat?.members.find((id) => id != currentUserId);
            if (receiverId) {
                setSendMessage({...message, receiverId});
            }

            // Send the message to the database
            const { data } = await addMessages(message);
            setMessages([...messages, data]);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    

    if (!chat) {
        return <div>Tap on a Chat to start Conversation</div>;
    }

    return (
        <div className="ChatBox-container">
            <div className="chat-header">
                <div className="follower">
                    <img
                        src={"http://localhost:5001/Images/" + userData?.profileImage}
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
            <div className="chat-body">
                {messages.map((message) => (
                    <div
                        key={message.msgId}
                        className={
                            message.senderId === currentUserId ? "message own" : "message"
                        }
                    >
                        <span>{message.text}</span>
                        <span>
                            <TimeAgo date={message.createAt} />
                        </span>
                    </div>
                ))}
            </div>

            <div className="chat-sender">
                <div>+</div>
                <div style={{ width: "900px" }}>
                    <InputEmoji value={newMessage} onChange={handleChange} />
                </div>
                <div className="send-button button" onClick={handleSend}>
          Send
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
