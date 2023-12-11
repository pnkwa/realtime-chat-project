import React, { useState, useEffect, ChangeEvent } from "react";
import io from "socket.io-client";
import Message from "./Message";
import axios from "axios";

interface Message {
  username: string;
  text: string;
}

interface AppProps {}

const socket = io("http://localhost:8000");

const App: React.FC<AppProps> = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    useEffect(() => {
        socket.on("message", (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Clean up the socket listener when the component unmounts
        return () => {
            socket.off("message");
        };
    }, []);

    const sendMessage = () => {
        socket.emit("sendMessage", { text: messageText });
        setMessageText("");
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const upload = () => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("username", username);
            formData.append("password", password);

            axios.post("http://localhost:5001/user/myprofile", formData)
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error("Error uploading file:", error);
                });
        } else {
            console.error("No file selected");
        }
    };

    return (
        <div className="App">
            <h1>Real-Time Chat App</h1>
            <div className="messages">
                {messages.map((message, index) => (
                    <Message key={index} username={message.username} text={message.text} />
                ))}
            </div>
            <div className="input-box">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            <div>
                <input type="file" onChange={handleFileChange}></input>
                <button type="button" onClick={upload}>Upload</button>
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

            </div>
        </div>
    );
};

export default App;
