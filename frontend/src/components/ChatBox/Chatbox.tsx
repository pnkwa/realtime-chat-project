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
import { addLink } from "../../api/UrlRequests";

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
    const [newLink, setNewLink] = useState("");
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

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLink = e.target.value;
        setNewLink(newLink);
    };

    const handleLinkSend =async (e: React.FormEvent) => {
        e.preventDefault();
        await addLink(newLink);
        console.log("add link: " , newLink);
    };

    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter" && !e.shiftKey) {
    //       e.preventDefault();
    //       handleSend(e as React.FormEvent);
    //     }
    //   };
      
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

                                {/* Audio element for YouTube video audio */}
                                {/* <audio controls>
                                    <source
                                        src="https://voice-messenger.s3.ap-southeast-1.amazonaws.com/test.mp4?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLXNvdXRoZWFzdC0xIkYwRAIgfzHfWawy7pbwHDg5TJu9rpLvsvrE7sLB1SmCMHczrAYCIGKT7JuJTKSUG9maM3WzlwqSuGgY6zOiTZFAq8VM7r4zKuQCCF4QABoMOTAwODY1MDEzOTUyIgxcAQBENXGAQvzQWP8qwQJzsgv4p%2F888zHLpblyhR3Cyikk6R1IFCBYMyTgQxtcnhf3abXWlQZ59kRy7RdTABqyyl2PXWy4fA9JPB3Zg4WHMvjASHCY%2FowlajRdt7oLaO35j0wUvsCoWr2RrFmWblqldheC0zjiGEp3NrKHLKhRGhSArfs6qa2dcBqn9ViQhMDyPZmB2nJKwr0TkeBO%2FtnI0ZmteEFH3eUaxFY%2BKalTSUr4YIwLNqwujAjWFAXMaMkhPIv3dC6b5OM3ik951SzLmaciU9Av2injZwyu%2BLqA39YGv2M8ds%2B2qW4n0Mk0EvaW6Ro6vmKL3%2BG8WKnz%2Ff3uIpIfD%2FShkMkqtdstowX82RkBkpnXu%2FhM%2BGRuqKZyTXD2Eo1Zpv8Zn3Z9CA8ql4zRQk6J6lHQsYgmGI8nJ5neRxmO0tJ8qJf9kQbQmNN2ci0wy8SgrAY6tALBjINZASBuGgtJNSAmJtMqMGdhVELjlHDNNOlHNmNSir5LpkdIGCm9vLN96gQlfO%2BT1Ldp%2B9IbX9KYjxDEIiECBhQoywFHbuhf07YFx3sO9uJq3evDsT0sJlQHiFw0mohso23VAnz3W2h64ONYI3z6PxTvPi35exQx9UdpvBS2JT%2BUnZiHnrT1RQ9ah%2Fxohld4RGGjw8QPSmyCHX7vdigmR3Zil5dNzuQvBNYFG87OLSBTicfKUIoLaatmeIiUc%2BTPm%2BPPi37auo0TtxEjCVTqiTFC7tGGpOEApRO8YFir%2FrdR2neTkIxflH9kw9hQ4aljkQslJa1y1IVBIdUCAxw7qsWs4AXCU3Fu5GK7p%2FWiAgny9OHl%2BqhPePO9NK50Z9tYO0lu38fOsS7akRSQjU0Kb2eUoQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20231224T181440Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIA5DP55HDAIUE3SJMX%2F20231224%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=071d55c32dba940608e870a00a075ef04cfc826c0fcd59419aa281fd15328881"
                                        type="audio/mp4"
                                    />
      Your browser does not support the audio element.
                                </audio> */}

                            </>
                        ) : (
                            <>
                                <span>{message.text}</span>
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
                                onChange={handleLinkChange}
                            />
                            {/* <input type="file" className="file-input file-input-bordered w-full max-w-xs" /> */}
                            <input 
                                type="button" 
                                value="Send" 
                                className="btn" 
                                onClick={handleLinkSend}
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
