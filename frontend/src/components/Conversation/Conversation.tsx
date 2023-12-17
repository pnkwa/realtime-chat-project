import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequests";
interface UserData {
    username: string;
    profileImage: string;
}

interface ConversationProps {
    data: {
        members: string[];
    };
    currentUserId: string;
}

const Conversations: React.FC<ConversationProps> = ({ data, currentUserId }) => {
    const [userData, setUserData] = useState<UserData | null>(null);

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
    
    // const defaultProfileImage = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg";
    // const profileImage =
    //     userData && userData.profileImage
    //         ? `${process.env.REACT_APP_PUBLIC_FOLDER}${userData.profileImage}`
    //         : defaultProfileImage;

    // console.log("First Image URL:", profileImage);
    // console.log("Second Image URL:", `http://localhost:5001/Images/${userData?.profileImage}`);
    // console.log(process.env);
    return (
        <>
            <div className="follower conversation">
                <div className="online-dot"></div>
                <img 
                    src={"http://localhost:5001/Images/" + userData?.profileImage }
                    alt="profile" 
                    className="followerImage"
                    style={{width: "70px"}}
                />
                <div className="name" style={{fontSize: "0.8rem"}}>
                    <span>{userData?.username}</span>
                    <span> Online</span>
                </div>
            </div>
            <hr />
        </>
    );
};

export default Conversations;
