import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequests";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
interface UserData {
    username: string;
    profileImage: string;
}

interface ConversationProps {
    data: {
        groupName: string | null;
        members: string[];
    };
    currentUserId: string;
}

const GroupConversations: React.FC<ConversationProps> = ({ data, currentUserId }) => {
    const [, setUserData] = useState<UserData | null>(null);

    useEffect(() => {

        const id = data.members.find((id) => String(id) !== String(currentUserId));
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
    

    return (
        <>
            <div className={"group bg-white conversation border-2 border-black p-2 m-2 rounded-xl h-[100px] flex items-center transition duration-300 ease-in-out hover:shadow-md cursor-pointer"}>
                
                <div className="ml-3 text-sm flex items-center">
                    <FontAwesomeIcon icon={faUserGroup} className="size-7 bg-green p-2 rounded-full border-2 border-black"/>
                    <span className="font-bold text-darkGreen m-2">{data.groupName}</span>
                    
                </div>
            </div>
            
        </>
    );
};

export default GroupConversations;