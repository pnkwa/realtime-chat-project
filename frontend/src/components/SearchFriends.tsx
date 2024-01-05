import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { getAllUsersExceptCurrent } from "../api/UserRequests";
import { createChat, findChats } from "../api/ChatRequests";

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
    const [userInChat, setUserInChat] = useState<boolean[]>([]);
    console.log("current Id : ", currentUserId);

    const handleSearch = async (query: string) => {
        try {
            const response = await getAllUsersExceptCurrent(currentUserId);
            const allUsers = response.data;

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
                console.log("Chat created successfully:", response.data);
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error creating chat:", error);
            });
    };

    useEffect(() => {
        const fetchUserChatStatus = async () => {
            const chatStatusArray: boolean[] = await Promise.all(
                searchResults.map(async (user) => {
                    try {
                        const response = await findChats(currentUserId, user.userId);
                        const chats = response.data;
                        return chats.length > 0;
                    } catch (error) {
                        console.error("Error checking chat:", error);
                        return false;
                    }
                })
            );

            setUserInChat(chatStatusArray);
        };

        fetchUserChatStatus();
    }, [currentUserId, searchResults]);

    return (
        <>
            <div>
                <Popup
                    trigger={<FontAwesomeIcon icon={faUserPlus} className="w-6 h-6 p-2 bg-yellow rounded-[10px] border-2 border-black m-5 cursor-pointer"/>}
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

                        <div
                            className="search-results-container"
                            style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                            }}
                        >
                            {searchResults.map((user, index) => (
                                <div key={user.userId} className="flex items-center mb-2">
                                    <img src={"http://localhost:5001/Images/" + user.profileImage} alt="" className="w-12 h-12 rounded-full mr-2" />
                                    <h1 className="text-lg font-semibold">{user.username}</h1>
                                    {!userInChat[index] && (
                                        <button
                                            className="ml-2 bg-blue text-white px-2 py-1 rounded"
                                            onClick={() => handleAddUser(user.userId)}
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} /> Add
                                        </button>
                                    )}
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