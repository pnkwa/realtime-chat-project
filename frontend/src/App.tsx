import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
    return (
        <div className="bg-gray-200 min-h-screen flex items-center justify-center">
            <header className="text-center">
                <img src={logo} className="h-40" alt="logo" />
                <p className="text-xl mt-4">
          Edit <code className="font-bold">src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="text-blue-500 hover:underline mt-2 block"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
          Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
