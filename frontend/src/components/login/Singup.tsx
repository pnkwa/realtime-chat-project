import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";

export default function Singup() {
    const [image, setImage] = useState<File | null>(null);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setImage(selectedFile);
        }
    };

    const inputRef = useRef<HTMLInputElement>(null!);
    const hangleImageClick = () => {
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
            <h1>Singup</h1>

            <div onClick={hangleImageClick}>
                {image ? <img src={URL.createObjectURL(image)} alt="" /> : <img src="https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg" alt="" />}
                <input 
                    type="file" 
                    onChange={handleImageChange}
                    ref={inputRef}
                    style={{display: "none"}}
                />

            </div>


            <div>
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

            <button type="button" onClick={upload}>Singup</button>

        </>
    );
}