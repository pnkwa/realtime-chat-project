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
    userId: string;
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
    const [userGroupData, setUserGroupData] = useState<UserData[]>([]);

    // Inside ChatBox component
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Always scroll to the last message
    useEffect(() => {
        
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    // Reset search term when chat prop changes
    useEffect(() => {
        setSearchTerm("");
        setIsTyping(false);
    }, [chat]);

    useEffect(() => {
        const getUserData = async () => {
            try {
                if (chat?.members) {
                    if(chat?.members.length === 2){
                        const userId = chat.members.find((id) => id != currentUserId);
                        if (userId) {
                            const response = await getUser(userId);
                            const userData: UserData = await response.data;
                            setUserData(userData);
                        }
                    }

                    else if (chat.members.length > 2) {
                        const receiverIds = chat.members.filter(
                            (id) => id != currentUserId
                        );
                        const groupData = await Promise.all(
                            receiverIds.map(async (id) => {
                                const response = await getUser(id);
                                return response.data;
                            })
                        );
                        setUserGroupData(groupData);
                        console.log("userGroupData : ", userGroupData);
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
            const receivedMessagesArray: Message[] = [receivedMessages];
    
            // Update the messages state only if the received message belongs to the current chat
            if (receivedMessagesArray[0]?.chatId == chat?.chatId) {
                setMessages((prevMessages) => [...prevMessages, ...receivedMessagesArray]);
            }
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

    const handleUrlSend = async (e: React.FormEvent) => {
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
                    const receiverIds = chat?.members.filter((id) => id != currentUserId) || [];
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

    // Inside ChatBox component
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setIsTyping(!!term); // Set isTyping to true if there is a search term, false otherwise

        const filteredMessages = messages.filter((msg) =>
            msg.text.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filteredMessages);
    };
  
    const scrollToMessage = (message: Message) => {
        const messageElement = document.querySelector(`.message-${message.msgId}`);
        setHighlightedMessageId(message.msgId);

        if (messageElement) {
            messageElement.classList.add("highlighted");

            if (message.senderId === currentUserId) {

                // If it's your own message, scroll to the message element directly
                messageElement.scrollIntoView({ behavior: "smooth" });
                setIsTyping(false);
                setSearchTerm("");
            } else {
                // For other users' messages, find the ".own" class and scroll to it
                const ownMessageElement = messageElement.querySelector(".own");
                if (ownMessageElement && ownMessageElement.scrollIntoView) {
                    ownMessageElement.scrollIntoView({ behavior: "smooth" });
                    setIsTyping(false);
                    setSearchTerm("");

                } else {
                    // If there's no ".own" class or scrollIntoView not supported, scroll to the message element
                    messageElement.scrollIntoView({ behavior: "smooth" });
                    setIsTyping(false);
                    setSearchTerm("");


                }
            }
        }
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

                    <div className="chat-search">
                        <input
                            type="text"
                            placeholder="Search messages"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {isTyping && ( // Show search results only when typing
                            <ul className="search-results">
                                {searchResults.map((result) => (
                                    <li key={result.msgId} onClick={() => scrollToMessage(result)}>
                                        {result.text}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <hr />
            <div className="chat-body" ref={chatBodyRef}>
                {messages.map((message) => (
                    <div
                        key={message.msgId}
                        ref={chatBodyRef}
                        className={`message ${message.senderId === currentUserId 
                            ? "own" 
                            : ""
                        } message-${message.msgId}`}
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
                                {chat.members.length === 2 && message.senderId !== currentUserId ? (
                                    <h3>username: {userData?.username}</h3>
                                ) : (
                                    <>
                                        {chat.members.length > 2 && message.senderId !== currentUserId ? (
                                            <h3>
                                                {userGroupData
                                                    .filter(user => user.userId === message.senderId)
                                                    .map(user => (
                                                        <span key={user.userId}>{user.username} </span>
                                                    ))}
                                            </h3>
                                        ) : null}
                                    </>
                                )}

                                {message.key_video && (
                                    <AudioBox audioKey={message.key_video}></AudioBox>
                                )}
                                <h1>{message.text}</h1>
                               
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