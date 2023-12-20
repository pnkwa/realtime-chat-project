/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { addMessages, getMassages } from "../../api/MessageRequets";
import InputEmoji from "react-input-emoji";
import TimeAgo from "react-timeago";

interface ChatBoxProps {
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

  receivedMessages: Message[];
}

interface Message {
  msgId: string;
  senderId: string;
  text: string;
  createAt: string;
  chatId: string;
}

interface UserData {
  username: string;
  profileImage: string;
}


const ChatBox: React.FC<ChatBoxProps> = ({
    chat,
    currentUserId,
    setSendMessage,
    receivedMessages,
}) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const chatBodyRef = useRef<HTMLDivElement>(null);
    
    // Always scroll to the last message
    useEffect(() => {
        
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    useEffect(() => {
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
        if (receivedMessages && typeof receivedMessages === "object" && !Array.isArray(receivedMessages)) {
            // Convert the object into an array
            const receivedMessagesArray = [receivedMessages];
    
            // Update the messages state with the received messages array
            setMessages((prevMessages) => [...prevMessages, ...receivedMessagesArray]);
        
        }
    }, [receivedMessages, chat]);
    
    

    const handleChange = (newMessage: string) => {
        setNewMessage(newMessage);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = {
            chatId: chat?.chatId || "",
            senderId: currentUserId,
            text: newMessage,
        };

        try {
            const receiverId = chat?.members.find((id) => id != currentUserId);
            if (receiverId) {
                setSendMessage({ ...message, receiverId });
            }

            const { data } = await addMessages(message);
            setMessages((prevMessages) => [...prevMessages, data]);
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
            <div className="chat-body" ref={chatBodyRef}>
                {messages.map((message) => (
                    <div
                        key={message.msgId}
                        ref={chatBodyRef}
                        className={message.senderId === currentUserId ? "message own" : "message"}
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
