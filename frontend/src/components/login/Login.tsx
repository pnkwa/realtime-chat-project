import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { userChats } from "../../api/ChatRequests";
import Conversations from "../Conversation/Conversation";
import "../ChatBox/Chatbox.css";
import ChatBox from "../ChatBox/Chatbox";
import { io, Socket } from "socket.io-client"; 

export default function Login() {
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [chat, setChat] = useState<{ members: string[] }>({ members: [] });
  const [user, setUser] = useState<User | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null);
  const [sendMessage, setSendMessage] = useState<Message | null>(null);
  const [receiveMessages, setReceiveMessages] = useState<ReceivedMessage[]>([]);

  const socket = useRef<Socket | null>(null);



  const handleLogin = async () => {
      try {
          const response = await axios.post("http://localhost:5001/user/login", {
              username: username,
              password: password,
          });

          setUser(response.data.user);
          console.log("user login" , response.data.user);
      } catch (error) {
          console.error("Login failed: ", error);
      }
  };

  useEffect(() => {
      console.log("user login", user);
  }, [user]);

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
                              <input type="text" placeholder="Search" className="input input-bordered w-full max-w-xs" />
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
                                                online = {checkOnlineUsers(chatItem)}
                                            ></Conversations>
                                        </div>
                                    ))}
                              </div>
                          </div>

                          {onlineUsers && (
                              <div>
                                  <h2>Online Users</h2>
                                  {onlineUsers.map((onlineUser) => (
                                      <div key={onlineUser.userId}>
                                          <p>{onlineUser.userId}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Right side */}
                      <div className="Right-side-chat">
                          <ChatBox
                              chat={currentChat}
                              currentUserId={user.userId}
                              setSendMessage={setSendMessage}
                              receivedMessages={receiveMessages}
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