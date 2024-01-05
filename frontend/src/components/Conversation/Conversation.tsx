import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequests";
import GroupConversations from "./GroupConversation";

interface UserData {
  username: string;
  profileImage: string;
}

interface ConversationProps {
  data: {
    groupName: string;
    members: string[];
  };
  currentUserId: string;
  online: boolean;
}

const Conversations: React.FC<ConversationProps> = ({ data, currentUserId, online }) => {
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const id = data.members.find((id) => String(id) != String(currentUserId));
        console.log("data: ", data);
        const getUserData = async () => {
            try {
                if (id) {
                    const response = await getUser(id);
                    const userData: UserData = await response.data;
                    setUserData(userData);
                    console.log(userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        getUserData();
    }, [data, currentUserId]);

    // Check if it's a group conversation
    if (data.members.length > 2) {
        return (
            <GroupConversations
                data={{
                    groupName: data.groupName,
                    members: data.members
                }}
                currentUserId={currentUserId}
            />
        );
    }
    
    
    return (
        <>
            <div className={"follower conversation bg-white border-2 border-black p-5 m-2 rounded-xl h-[100px] flex items-center transition duration-300 ease-in-out hover:shadow-md cursor-pointer"}>
                
                <img
                    src={`http://localhost:5001/Images/${userData?.profileImage}`}
                    alt="profile"
                    className="followerImage object-cover rounded-full w-12 h-12 border-2 border-black"
                />
                
                <div className="ml-3 text-sm">
                    <span className="font-bold text-darkGreen">{userData?.username}</span>
                    <span className={`text-xs ${online ? "text-green-500" : "text-gray-500"}`}>{online ? " Online" : " Offline"}</span>
                </div>

                {online && <div className="online-dot bg-green w-3 h-3 rounded-full mr-2 m-2" />}
            </div>
            <hr className="my-2" />
        </>
    );
};
    
export default Conversations;