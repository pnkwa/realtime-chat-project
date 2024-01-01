/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { addMessages, getMassages } from "../../api/MessageRequets";
import InputEmoji from "react-input-emoji";
import TimeAgo from "react-timeago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { addUrl } from "../../api/UrlRequests";
import AudioBox from "./AudioBox";

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
      receiverIds: string[];
      key_video: string | null
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
  key_video: string;
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
    const [newURl, setNewUrl] = useState("");
    const [audioKey, setAudioKey] = useState("");
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
            key_video: null
        };

        try {
            const receiverIds = chat?.members.filter((id) => id != currentUserId) || [];
            if (receiverIds.length > 0) {
                setSendMessage({ ...message, receiverIds });
            }

            const { data } = await addMessages(message);
            setMessages((prevMessages) => [...prevMessages, data]);
            setNewMessage("");
            setNewUrl("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setNewUrl(newUrl);
    };

    const handleUrlSend =async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isYouTubeLink(newURl)) {
            try {
                const response = await addUrl(newURl);
                const key = response;
                console.log("get key : " , key);
                setAudioKey(key);

                const message = {
                    chatId: chat?.chatId || "",
                    senderId: currentUserId,
                    text: "send voice",
                    key_video: key,
                };
        
                try {
                    const receiverIds = chat?.members.filter((id) => id !== currentUserId) || [];
                    if (receiverIds.length > 0) {
                        setSendMessage({ ...message, receiverIds });
                    }
        
                    const { data } = await addMessages(message);
                    setMessages((prevMessages) => [...prevMessages, data]);
                    setNewMessage("");
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            } catch (error) {
                console.error("Error adding YouTube link:", error);
                return;
            }
        }
    };
      
    if (!chat) {
        return <div>Tap on a Chat to start Conversation</div>;
    }

    const isYouTubeLink = (text: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    
        return youtubeRegex.test(text);
    };

    const getYouTubeVideoId = (text: string): string | null => {
        const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      
        return match ? match[1] : null;
    };

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
                        {isYouTubeLink(message.text) ? (
                            <>
                                <span>{message.text}</span>
                                <iframe
                                    width="384"
                                    height="216"
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(message.text)}`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>

                            </>
                        ) : (
                            <>
                                <span>{message.text}</span>

                                {message.key_video && (
                                    <AudioBox audioKey={message.key_video}></AudioBox>
                                )}
                            </>
                        )}
                        <span>
                            <TimeAgo date={message.createAt} />
                        </span>
                    </div>
                ))}
            </div>


            <div className="chat-sender">
                <div>
                    <Popup 
                        trigger={<FontAwesomeIcon icon={faHeadphones} />} 
                        modal
                        nested
                        contentStyle={{
                            borderRadius: "10px",
                            width: "80%",
                            height: "300px"
                        }}
                    >
                        <div>
                            <h1>music player</h1>
                            <input 
                                type="text" 
                                placeholder="link" 
                                className="input input-bordered w-full max-w-xs" 
                                onChange={handleUrlChange}
                            />
                            {/* <input type="file" className="file-input file-input-bordered w-full max-w-xs" /> */}
                            <input 
                                type="button" 
                                value="Send" 
                                className="btn" 
                                onClick={handleUrlSend}
                            />
                        </div>
                    </Popup>
                    
                    

                </div>
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