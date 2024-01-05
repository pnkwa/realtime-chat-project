import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import SearchFriends from "../../components/SearchFriends";
import AddGroup from "../../components/AddGroup";
import ChatBox from "../../components/ChatBox/Chatbox";
import Conversations from "../../components/Conversation/Conversation";
import { Socket, io } from "socket.io-client";
import { userChats } from "../../api/ChatRequests";
import { useLocation } from "react-router-dom";


interface User {
    userId: string;
    username: string;
    profileImage: string;
}

interface Chat {
    chatId: string;
    members: string[];
    groupName: string;
}

interface Message {
    chatId: string;
    senderId: string;
    text: string;
    key_video: string | null;
    receiverIds: string[];
  }

  interface ReceivedMessage {
    msgId: string;
    senderId: string;
    text: string;
    createAt: string;
    chatId: string;
    key_video: string;
  }

  interface OnlineUser {
    userId: string;
    socketId: string;
  }

const Chat = () => {

    const [chat, setChat] = useState<{ members: string[] }>({ members: [] });
    const [user, setUser] = useState<User | null>(null);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null);
    const [sendMessage, setSendMessage] = useState<Message | null>(null);
    const [receiveMessages, setReceiveMessages] = useState<ReceivedMessage[]>([]);

    const socket = useRef<Socket | null>(null);

    const location = useLocation();
    const userLogin = location.state.user;

    useEffect(() => {
        if (userLogin) {
            setUser(userLogin); // Set user state when userLogin prop is provided
        }
    }, [userLogin]);


    useEffect(() => {
        const getChats = async () => {
            try {
                if (user?.userId !== undefined) {
                    const { data } = await userChats(user.userId);
                    setChat(data);
                    console.log("chat : ", chat);
                    console.log("data : ", data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getChats();
    }, [user]);
  
    useEffect(() => {
        // Initialize the socket only if the user is logged in
        if (user !== null) {
            socket.current = io("http://localhost:5001");
            socket.current.emit("new-user-add", user.userId);
            socket.current.on("get-users", (users: OnlineUser[]) => {
                setOnlineUsers(users);
                console.log("Updated onlineUsers: ", users);
            });
  
            // Set up the receive-message event listener
            socket.current.on("receive-message", (data) => {
                console.log("Received message from server: ", data);
                setReceiveMessages(data);
            });
        }
  
        // Clean up socket connection on component unmount
        return () => {
            if (socket.current !== null) {
                socket.current.disconnect();
            }
        };
    }, [user]);

    // sending message from socket server
    useEffect(() => {
        if (sendMessage !== null && socket.current !== null) {
            socket.current.emit("send-message", sendMessage);
        }
    }, [sendMessage]);


    // receive message from socket server
    useEffect(() => {
        if (socket.current !== null) {
            console.log("Setting up receive-message event listener");
            socket.current.on("receive-message", (data) => {
                console.log("Received message from socket: ", data);
                setReceiveMessages((prevMessages) => [...prevMessages, data]);
            });
        }

        return () => {
        // Clean up the event listener when the component unmounts
            if (socket.current !== null) {
                console.log("Cleaning up receive-message event listener");
                socket.current.off("receive-message");
            }
        };
    }, [socket]);

    const checkOnlineUsers = (chat: { members: string[], chatId: string }) => {
        const chatMember = chat.members.find((member) => member != user?.userId);
        const online = onlineUsers?.some((user) => user.userId == chatMember);
        return online ? true : false;
    };
    return (
        <>

            {user && (

                
                <div className="profile h-screen bg-cream">
                    {/*Nav bar*/}

                    <div className="grid grid-cols-12 grid-rows-1 gap-4 h-screen w-full p-5">

                        <div className="row-span-5 col-start-0 col-span-1 row-start-1 flex flex-col items-center justify-center">
                            <div className="w-[80%] h-[100%] bg-green rounded-[30px] border-2 border-black flex flex-col items-center">
                                <img
                                    src={"http://localhost:5001/Images/" + user.profileImage}
                                    alt="profile"
                                    className="followerImage object-cover rounded-full w-12 h-12 border-2 border-black mt-5"
                                />
                                <p className="h-[20%] mb-[100%]">{user.username}</p>
                                <div className="flex flex-col items-center">
                                    <SearchFriends currentUserId={user.userId}/>
                                    <AddGroup currentUserId={user.userId}></AddGroup>
                                </div>
                                
                            
                            </div>
                        </div>

                        <div className="row-span-5 col-start-2 col-span-4 row-start-1 h-[100%]">
                            <h2 className="font-extrabold text-4xl text-center text-darkGreen">CUCUMBER CHAT</h2>
                            <p className="text-center">your friends</p>
                            <div className="Left-side-chat">
                                <div 
                                    className="Chat-container"
                                    style={{
                                        maxHeight: "800px",
                                        overflowY: "auto",
                                    }}
                                >
                                    
                                    <div className="Chat-List max-h-[100%] overflow-y-auto">
                                        {Array.isArray(chat) &&
                                            chat.map((chatItem) => (
                                                <div key={chatItem.members.join("_")} onClick={() => setCurrentChat(chatItem)}>
                                                    <Conversations
                                                        data={chatItem}
                                                        currentUserId={user?.userId || ""}
                                                        online={checkOnlineUsers(chatItem)}
                                                    ></Conversations>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                
                            </div>
                        </div>

                        <div className="row-span-5 col-start-6 col-span-12 row-start-1">

                            <div className="Right-side-chat w-[100%] h-full">
                                <ChatBox
                                    chat={currentChat}
                                    currentUserId={user.userId}
                                    setSendMessage={setSendMessage}
                                    receivedMessages={receiveMessages}
                                ></ChatBox>

                            </div>
                        </div>
                    </div>
    
                   
                </div>
            )}

            
            
        </>
    );   
};

export default Chat;