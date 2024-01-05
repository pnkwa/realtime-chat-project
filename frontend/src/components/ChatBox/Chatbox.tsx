/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { addMessages, getMassages } from "../../api/MessageRequets";
import InputEmoji from "react-input-emoji";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones, faMagnifyingGlass, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { addUrl } from "../../api/UrlRequests";
import AudioBox from "./AudioBox";
import { format } from "date-fns";  


interface ChatBoxProps {
  chat: {
    chatId: string;
    members: string[];
    groupName: string;
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

    // Inside ChatBox search keyword component
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


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd MMM HH:mm"); // Customize the format as needed
    };
  


    return (
        <div className="ChatBox-container bg-white rounded-[30px] border-2 border-black w-full h-full">
            
            
            <div className="chat-header flex flex-row h-[10%] items-center px-4">

                {chat.members.length === 2 ? (
                    <>
                        <img
                            src={"http://localhost:5001/Images/" + userData?.profileImage}
                            alt="profile"
                            className="followerImage object-cover rounded-full w-12 h-12 border-2 border-black"
                        />

                        <div className="name ml-4 text-lg font-bold">
                            <span>{userData?.username}</span>
                        </div>
                    </>
                ) : (
                    <>
                        {chat.members.length > 2 && (

                            <div className="name ml-4 text-lg font-bold">
                                <span>{chat.groupName}</span>
                            </div>
                           
                        )}
                    </>
                )}
                
                <div className="chat-search ml-auto">
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search messages"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="bg-yellow border-2 border-black rounded-full py-1 px-2"
                        />
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="m-1 size-5"/>
                    </div>
                    
                    {isTyping && (
                    // Show search results only when typing
                        <ul className="search-results absolute bg-yellow border-2 border-black mt-1 w-[200px] z-10 rounded-xl">
                            {searchResults
                                .filter((result) =>
                                    result.text.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((result) => (
                                    <li
                                        key={result.msgId}
                                        onClick={() => scrollToMessage(result)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-xl"
                                    >
                                        {result.senderId === userData?.userId && (
                                            <h1 className="text-xl font-bold">{userData.username}</h1>
                                        )}

                                        {result.senderId === currentUserId && (
                                            <h1 className="text-xl font-bold">you</h1>
                                        )}
                                        <p className="text-base">{result.text}</p>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            </div>


            <hr />


            <div className="chat-body flex flex-col gap-2 p-6 overflow-auto h-[80%]">
                {messages.map((message) => (
                    <div
                        key={message.msgId}
                        ref={chatBodyRef}
                        className={`message  w-fit ${message.senderId === currentUserId 
                            ? "own self-end" 
                            : "friend self-start" 
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
                                    <h3 className="font-semibold">{userData?.username}</h3>
                                ) : (
                                    <>
                                        {chat.members.length > 2 && message.senderId !== currentUserId ? (

                                            <div>
                                                <h3>
                                                    {userGroupData
                                                        .filter(user => user.userId === message.senderId)
                                                        .map(user => (
                                                            <span key={user.userId} className="font-semibold">{user.username} </span>
                                                        ))}
                                                </h3>

                                                
                                            </div>
                                           
                                        ) : null}
                                    </>
                                )}
                                
                                
                                <h1 className={
                                    `message ${message.senderId === currentUserId 
                                        ? "own bg-cream self-end text-wrap hover:text-balance rounded-bl-3xl rounded-tl-3xl rounded-tr-xl" 
                                        : "friend bg-green self-start rounded-br-3xl rounded-tr-3xl rounded-tl-xl"}
                                    whitespace-normal text-balance border-2 border-black p-3
                                    `} 
                                style={{ 
                                    overflowWrap: "break-word",
                                    maxWidth: message.text.length > 50 ? "300px" : "auto" 
                                }}>
                                    {message.text}
                                    {message.key_video && (
                                        <AudioBox audioKey={message.key_video}></AudioBox>
                                    )}
                                </h1>


                               
                            </>
                        )}
                        <span className="text-darkGreen">{formatDate(message.createAt)}</span>
                    </div>
                ))}
            </div>


            <div className="chat-sender flex justify-between items-center h-16 p-4 h-[10%] ">
                <div>
                    <Popup 
                        trigger={<FontAwesomeIcon icon={faHeadphones} />} 
                        modal
                        nested
                        contentStyle={{
                            borderRadius: "10px",
                            width: "60%",
                            height: "500px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#C7DCA7",
                        }}
                    >
                        {/* Popup content */}
                        <div className="rounded-lg p-8 w-[80%] h-full">
                            <div className="flex flex-col items-center justify-center h-full">
                                <h1 className="text-2xl font-bold mb-4">Music Player</h1>
                                <input 
                                    type="text" 
                                    placeholder="Enter music link" 
                                    className="border-2 border-black rounded-full py-2 px-4 mb-4 w-full"
                                    onChange={handleUrlChange}
                                />
                                <input 
                                    type="button" 
                                    value="Send" 
                                    className="bg-blue text-white py-2 px-4 rounded-full cursor-pointer border-2 border-black"
                                    onClick={handleUrlSend}
                                />
                            </div>
                        </div>
                    </Popup>

                    
                    

                </div>
                <div className="w-full">                    
                    <InputEmoji 
                        value={newMessage} 
                        onChange={handleChange}
                        borderColor="white"
                        inputClass="bg-yellow border-2 rounded-full border-black"
                        
                    />
                </div>
                <div className="send-button button" onClick={handleSend}>
                    <FontAwesomeIcon icon={faPaperPlane} />                
                </div>
                

            </div>
        </div>
    );
};

export default ChatBox;