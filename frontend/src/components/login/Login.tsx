import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { userChats } from "../../api/ChatRequests";
import Conversations from "../Conversation/Conversation";
import "../ChatBox/Chatbox.css";
import ChatBox from "../ChatBox/Chatbox";
import { io, Socket } from "socket.io-client"; // Import Socket type from socket.io-client

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

  interface Message {
    chatId: string;
    senderId: string;
    text: string;
  }

  interface ReceiveMessage {
    // msgId: string;
    msgId: string;
    senderId: string;
    text: string;
    createAt: string;
    chatId: string;
    receiverId: string;
  }
  
  interface OnlineUser {
    userId: string;
    socketId: string;
  }

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [chat, setChat] = useState<{ members: string[] }>({ members: [] });
  const [user, setUser] = useState<User | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null);
  const [sendMessage, setSendMessage] = useState<Message | null>(null);
  const [receiveMessage, setReceiveMessage] = useState<ReceiveMessage>({ msgId: "", senderId: "", text: "", createAt: "", chatId: "", receiverId: "" });

  const socket = useRef<Socket | null>(null);



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

  useEffect(() => {
      // Initialize the socket only if the user is logged in
      if(user !== null){
          socket.current = io("http://localhost:5001");
          socket.current.emit("new-user-add", user.userId);
          socket.current.on("get-users", (users: OnlineUser[]) => {
              setOnlineUsers(users);
              console.log("Updated onlineUsers: ", onlineUsers);
          });
      }
      
  }, [user]);


  // sending message from socket server
  useEffect(() => {
      if (sendMessage !== null && socket.current !== null) {
          socket.current.emit("send-message", sendMessage);
      }
  }, [sendMessage]);

  // receive message from socket server
  useEffect(() => {
      if(socket.current !== null) {
          socket.current.on("receive-message", (data) => {
              console.log("Data Received in parent Chat.ts " , data);
              setReceiveMessage(data);
          });
      }
     
  }, []);

  return (
      <>
          {user ? (
          // If the user is logged in, display profile information
              <div className="profile">
                  <img
                      src={"http://localhost:5001/Images/" + user.profileImage}
                      alt="profile"
                      style={{ width: "120px", borderRadius: "100px" }}
                  />
                  <p>{user.userId}</p>
                  <p>{user.username}</p>

                  <div className="Chat">
                      {/* Left side */}
                      <div className="Left-side-chat">
                          <div className="Chat-container">
                              <h2>Chats</h2>
                              <div className="Chat-List">
                                  {Array.isArray(chat) &&
                    chat.map((chatItem) => (
                        <div
                            key={chatItem.members.join("_")}
                            onClick={() => setCurrentChat(chatItem)}
                        >
                            <Conversations
                                data={chatItem}
                                currentUserId={user?.userId || ""}
                            ></Conversations>
                        </div>
                    ))}
                              </div>
                          </div>
                      </div>

                      {/* Right side */}
                      <div className="Right-side-chat">
                          <ChatBox
                              chat={currentChat}
                              currentUserId={user.userId}
                              setSendMessage={setSendMessage}
                              receiveMessage={receiveMessage}
                          ></ChatBox>

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
                  <button onClick={handleLogin} >Login</button>
              </div>
          )}
      </>
  );
}
