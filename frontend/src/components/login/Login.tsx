import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ChatBox/Chatbox.css";
// import Chat from "../../page/Chat/Chat";
import { useNavigate } from "react-router-dom";

export default function Login() {
  interface User {
    userId: string;
    username: string;
    profileImage: string;
  }

  //   interface Chat {
  //     chatId: string;
  //     members: string[];
  //     groupName: string;
  //   }


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);


  const navigate = useNavigate(); // Hook to get the navigate function


  const handleLogin = async () => {
      try {
          const response = await axios.post("http://localhost:5001/user/login", {
              username: username,
              password: password,
          });

          setUser(response.data.user);
          console.log("user login" , response.data.user);
          navigate("/chat", { state: { user: response.data.user } });
      } catch (error) {
          console.error("Login failed: ", error);
      }
  };

  useEffect(() => {
      console.log("user login", user);
  }, [user]);


  return (
      <>
          {user ? (
          // If the user is logged in, display profile information
              null
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