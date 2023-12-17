import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5001"});

export const createChat = (data: { senderId: string; receiverId: string }) => API.post("/chat", data);
export const userChats = (id: string) => API.get(`/chat/${id}`);
export const findChats = (firstId: string, secondId: string) => API.get(`chat/find/${firstId}/${secondId}`);