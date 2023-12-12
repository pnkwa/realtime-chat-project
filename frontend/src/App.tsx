import React from "react";
// import io from "socket.io-client";
// import Message from "./Message";
// import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Singup from "./components/login/Singup";
import Login from "./components/login/Login";

// interface Message {
//   username: string;
//   text: string;
//}

interface AppProps {}

// const socket = io("http://localhost:8000");

const App: React.FC<AppProps> = () => {
    // const [messages, setMessages] = useState<Message[]>([]);
    // const [messageText, setMessageText] = useState<string>("");

    // useEffect(() => {
    //     socket.on("message", (message: Message) => {
    //         setMessages((prevMessages) => [...prevMessages, message]);
    //     });

    //     // Clean up the socket listener when the component unmounts
    //     return () => {
    //         socket.off("message");
    //     };
    // }, []);

    // const sendMessage = () => {
    //     socket.emit("sendMessage", { text: messageText });
    //     setMessageText("");
    // };

    return (
        <>
            <h1 className="text-3xl font-bold underline">Real-Time Chat</h1>
            {/* <div className="messages">
                {messages.map((message, index) => (
                    <Message key={index} username={message.username} text={message.text} />
                ))}
            </div> */}
            {/* <div className="input-box">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div> */}

            <Routes>
                <Route path="/signup" element={<Singup/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
            </Routes>

        </>
    );
};

export default App;
