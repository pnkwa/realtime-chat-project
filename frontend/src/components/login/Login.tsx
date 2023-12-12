import React, { useState } from "react";
import axios from "axios";

export default function Login() {

    interface User {
        username: string;
        profileImage: string;
    }

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<User | null>(null);
    

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


    return (
        <>
            {user ? (
                // If the user is logged in, display profile information
                <div className="profile">
                    <img src={"http://localhost:5001/Images/" + user.profileImage }alt="profile" />
                    <p>{user.profileImage}</p>
                    <p>{user.username}</p>
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