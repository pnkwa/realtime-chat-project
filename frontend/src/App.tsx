import React from "react";

import { Routes, Route } from "react-router-dom";
import Singup from "./page/Singup";
import Chat from "./page/Chat/Chat";
import Login from "./page/Login";

interface AppProps {}

// const socket = io("http://localhost:8000");

const App: React.FC<AppProps> = () => {
    

    return (
        <>
            {/* <h1 className="text-3xl font-bold underline">Real-Time Chat</h1> */}
            

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/signup" element={<Singup />} />
            </Routes>

        </>
    );
};

export default App;
