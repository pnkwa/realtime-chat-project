import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5001"});

export const getUser = (userId: string) => API.get(`/user/myprofile/${userId}`);
export const updateUser = (id:string, formdata: {username: string, profileImage: string}) => API.put(`user/myprofile/${id}`, formdata);
export const getAllUser = () => API.get("/user/myprofile");
export const getAllUsersExceptCurrent = (currentUserId: string) => API.get(`/user/all?currentUserId=${currentUserId}`);
