import React from "react";
// import io from "socket.io-client";
// import Message from "./Message";
// import axios from "axios";
import { Routes, Route } from "react-router-dom";
// import Singup from "./components/login/Singup";
import Login from "./components/login/Login";
import Chat from "./page/Chat/Chat";
// import Chat from "./page/Chat/Chat";

// interface Message {
//   username: string;
//   text: string;
//}

interface AppProps {}

// const socket = io("http://localhost:8000");

const App: React.FC<AppProps> = () => {
    

    return (
        <>
            <h1 className="text-3xl font-bold underline">Real-Time Chat</h1>
            

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>

        </>
    );
};

export default App;
