import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const [image, setImage] = useState<File | null>(null);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate(); // Hook to get the navigate function


    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setImage(selectedFile);
        }
    };

    const inputRef = useRef<HTMLInputElement>(null!);
    const handleImageClick = () => {
        inputRef.current.click();
    };

    const upload = () => {
        if (image) {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("username", username);
            formData.append("password", password);

            axios.post("http://localhost:5001/user/myprofile", formData)
                .then(response => {
                    console.log(response.data);
                    setShowSuccess(true);

                    setTimeout(() => {
                        navigate("/");
                    }, 3000);
                })
                .catch(error => {
                    console.error("Error uploading file:", error);
                });
        } else {
            console.error("No file selected");
        }
    };

    return (
        <>
            <div className="flex flex-col gap-y-2 justify-center items-center h-screen bg-cream">
                {showSuccess && (
                    <div role="alert" className="alert alert-success stick bg-green">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Your account has been created! Redirecting to login...</span>
                    </div>
                )}
                <div className="w-192 p-16 bg-green rounded-md border-2 border-black">
                    <h2 className="text-2xl font-bold mb-4 text-black">Signup</h2>
                    
                    <div onClick={handleImageClick} className="flex justify-center items-center mt-8">
                        {image ? (
                            <img
                                src={URL.createObjectURL(image)}
                                alt=""
                                className="w-64 h-64 object-cover rounded-full border-2 border-black"
                            />
                        ) : (
                            <img
                                src="https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg"
                                alt=""
                                className="w-64 h-64 object-cover rounded-full border-2 border-black"
                            />
                        )}
                        <input
                            type="file"
                            onChange={handleImageChange}
                            ref={inputRef}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div className="mt-8">
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
                    </div>

                    <button
                        type="button"
                        onClick={upload}
                        className="w-full bg-yellow text-black py-2 rounded-md border-2 border-black hover:bg-yellow focus:outline-none mt-4"
                    >
                        Done
                    </button>
                </div>
                <div className="mt-4 text-center">
                    {/* Link to navigate to the Login page */}
                    <Link
                        to="/"
                        className="text-blue hover:underline transition duration-300 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        Already have an account? Login here
                    </Link>
                </div>
            </div>
        </>
    );
}