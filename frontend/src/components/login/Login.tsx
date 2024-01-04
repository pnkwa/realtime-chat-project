import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ChatBox/Chatbox.css";
// import Chat from "../../page/Chat/Chat";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  interface User {
    userId: string;
    username: string;
    profileImage: string;
  }

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
              <>    
                  <div className="flex flex-col gap-y-2 justify-center items-center h-screen bg-cream">
                      <div className="w-192 p-16 bg-green rounded-md border-2 border-black">
                          <h2 className="text-2xl font-bold mb-4 text-black">Login</h2>
                          <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Username"
                              className="w-full px-4 py-2 mb-4 rounded-md border-2 border-black focus:outline-none focus:border-yellow"
                          />
                          <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full px-4 py-2 mb-4 rounded-md border-2 border-black focus:outline-none focus:border-yellow"
                          />
                         
                          <button
                              onClick={handleLogin}
                              className="w-full bg-yellow text-black py-2 rounded-md border-2 border-black hover:bg-yellow focus:outline-none "
                          >
              Login
                          </button>
                      </div>

                      <div className="mt-4 text-center">
                          {/* Link to navigate to the Signup page */}
                          <Link
                              to="/signup"
                              className="text-blue hover:underline transition duration-300 focus:outline-none focus:ring focus:border-blue"
                          >
        Do not have an account? Signup here
                          </Link>
                      </div>
                  </div>
                  
              </>
              
          )}
      </>
  );
}