import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5001"});

export const addUrl = async (link: string): Promise<string> => {
    const response = await API.post("/youtube-url", { link });
    return response.data;
};

export const getAudioUrl = async (key: string): Promise<string> => {
    // console.log("key url", key);
    const reqsponse = await API.get(`/youtube-url/${key}`);

    return reqsponse.data;
    
};