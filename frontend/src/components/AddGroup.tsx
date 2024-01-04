import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { getAllUsersExceptCurrent } from "../api/UserRequests";
import { findChats, createChatGroup } from "../api/ChatRequests";

interface AddGroupProps {
  currentUserId: string;
}

interface SearchResultsProps {
  userId: string;
  profileImage: string;
  username: string;
}

const AddGroup: React.FC<AddGroupProps> = ({ currentUserId }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultsProps[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const [userInChat, setUserInChat] = useState<boolean[]>([]);


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
    
    const handleCheckboxChange = (userId: string) => {
    
        setSelectedUsers((prevSelectedUsers) => {
            const updatedSelectedUsers = prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter((id) => id !== userId)
                : [...prevSelectedUsers, userId];
    
            console.log("selectedUsers : " + updatedSelectedUsers);
    
            return updatedSelectedUsers;
        });
    };
    

    const handleCreateGroup = () => {
        // Check if at least two users are selected
        if (selectedUsers.length < 2) {
            alert("Select at least two users to create a group");
            return;
        }

        // Check if a group name is entered
        if (!groupName.trim()) {
            alert("Enter a group name");
            return;
        }
    
        // Call the API to create a group
        const data = {
            members: [...selectedUsers, currentUserId], // Include the current user in the group
            groupName: groupName,
        };
    
        createChatGroup(data)
            .then((response) => {
                console.log("Group created successfully:", response.data);
            // Optionally, you can handle additional logic like redirecting or updating UI.
            })
            .catch((error) => {
                console.error("Error creating group:", error);
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
                    trigger={<FontAwesomeIcon icon={faSquarePlus} />}
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
                        <input
                            type="text"
                            placeholder="Group name"
                            className="input input-bordered w-full max-w-xs mb-4 p-2 sticky top-2"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <button
                            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={handleCreateGroup}
                        >
              Create group
                        </button>
                        <div
                            className="search-results-container"
                            style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                            }}
                        >
                            {searchResults.map((user, index) => (
                                <div key={user.userId} className="flex items-center mb-2">
                                    {userInChat[index] && (

                                        <>
                                            <img
                                                src={"http://localhost:5001/Images/" + user.profileImage}
                                                alt=""
                                                className="w-12 h-12 rounded-full mr-2"
                                            />
                                            <h1 className="text-lg font-semibold">{user.username}</h1>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.userId)}
                                                className="checkbox"
                                                onChange={() => handleCheckboxChange(user.userId)}
                                            />
                                        </>
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

export default AddGroup;