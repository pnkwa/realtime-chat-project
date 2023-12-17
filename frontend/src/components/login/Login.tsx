import React, { useEffect, useState } from "react";
import axios from "axios";
import { userChats } from "../../api/ChatRequests";
import Conversations from "../Conversation/Conversation";
import "../ChatBox/Chatbox.css";
import ChatBox from "../ChatBox/Chatbox";

export default function Login() {

    interface User {
        userId: string;
        username: string;
        profileImage: string;
    }

    interface Chat {
        chatId: string;
        members: string[];
    }
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [chat, setChat] = useState<{ members: string[] }>({ members: [] });
    const [user, setUser] = useState<User | null>(null);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5001/user/login", {
                username: username,
                password: password,
            });

            setUser(response.data.user);

        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

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
    


    return (
        <>
            {user ? (
                // If the user is logged in, display profile information
                <div className="profile">
                    <img src={"http://localhost:5001/Images/" + user.profileImage }alt="profile" style={{width:"120px", borderRadius: "100px"}}/>
                    <p>{user.userId}</p>
                    <p>{user.username}</p>

                    <div className="Chat">
                        {/* Left side */}
                        <div className="Left-side-chat">
                            <div className="Chat-container">
                                <h2>Chats</h2>
                                <div className="Chat-List">
                                    {Array.isArray(chat) && chat.map((chatItem) => (
                                        <div key={chatItem.members.join("_")} onClick={() => setCurrentChat(chatItem)}>
                                            <Conversations data={chatItem} currentUserId={user?.userId || ""}></Conversations>
                                        </div>
                                    ))}
                                </div>
                                
                            </div>
                   
                        </div>

                        {/* Right side */}
                        <div className="Right-side-chat">
                            <ChatBox chat={currentChat} currentUserId = {user.userId}></ChatBox>
                        </div>
                    </div>
                </div>


            ) : (
                // If the user is not logged in, display the login form
                <div className="input-login">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            )}
        </>
    );
}