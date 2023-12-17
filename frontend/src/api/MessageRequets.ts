import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5001"});

export const getMassages = (chatId:string) => API.get(`/message/${chatId}`);

export const addMessages = (data: {chatId:string, senderId:string, text:string}) => API.post("/message", data);