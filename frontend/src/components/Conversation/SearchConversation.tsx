
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

const SearchConversations: React.FC<ConversationProps> = ({ data, currentUserId, online }) => {
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
            <div className="follower conversation">
                {online && <div className="online-dot"/>}
                <img 
                    src={"http://localhost:5001/Images/" + userData?.profileImage }
                    alt="profile" 
                    className="followerImage"
                    style={{width: "70px"}}
                />
                <div className="name" style={{fontSize: "0.8rem"}}>
                    <span>{userData?.username}</span>
                    <span>{online ? " Online": " Offline"}</span>
                </div>
            </div>
            <hr />
        </>
    );
};

export default SearchConversations;