import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Message from "./Message";


interface Message {
  username: string;
  text: string;
}

interface AppProps {}

const socket = io("http://localhost:8000");

const App: React.FC<AppProps> = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState<string>("");

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
        </div>
    );
};

export default App;
