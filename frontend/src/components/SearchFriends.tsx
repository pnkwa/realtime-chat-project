import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { getAllUsersExceptCurrent } from "../api/UserRequests";
import { createChat } from "../api/ChatRequests";

interface SearchFriendsProps {
  currentUserId: string;
}

interface SearchResultsProps {
  userId: string;
  profileImage: string;
  username: string;
}

const SearchFriends: React.FC<SearchFriendsProps> = ({ currentUserId }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultsProps[]>([]);

    const handleSearch = async (query: string) => {
        try {
            // Call the new endpoint to get all users except the current user
            const response = await getAllUsersExceptCurrent(currentUserId);
            const allUsers = response.data;

            // Filter users based on the search query
            const filteredUsers = allUsers.filter(
                (user: { username: string }) =>
                    user.username.toLowerCase().includes(query.toLowerCase())
            );

            setSearchResults(filteredUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
    };

    const handleAddUser = (userId: string) => {
        console.log("Add user with userId:", userId);
    
        const data = {
            senderId: currentUserId,
            receiverId: userId,
        };
    
        createChat(data)
            .then((response) => {
                // Handle the response if needed
                console.log("Chat created successfully:", response.data);
            })
            .catch((error) => {
                console.error("Error creating chat:", error);
            });
    };

    return (
        <>
            <div>
                <Popup
                    trigger={<FontAwesomeIcon icon={faUserPlus} />}
                    modal
                    nested
                    contentStyle={{
                        borderRadius: "10px",
                        width: "80%",
                        height: "500px",
                    }}
                >
                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Search"
                            className="input input-bordered w-full max-w-xs mb-4 p-2 sticky top-0"
                            value={searchQuery}
                            onChange={handleChange}
                        />

                        {/* Display search results */}
                        <div
                            className="search-results-container"
                            style={{
                                maxHeight: "400px", // Set a maximum height for the scrollable container
                                overflowY: "auto", // Enable vertical scrolling
                            }}
                        >
                            {searchResults.map((user) => (
                                <div key={user.userId} className="flex items-center mb-2">
                                    <img src={"http://localhost:5001/Images/" + user.profileImage} alt="" className="w-12 h-12 rounded-full mr-2" /> 
                                    <h1 className="text-lg font-semibold">{user.username}</h1>
                                    <button
                                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleAddUser(user.userId)}
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} /> Add
                                    </button>

                                </div>
                            ))}
                        </div>
                    </div>
                </Popup>
            </div>
        </>
    );
};

export default SearchFriends;
