import express , {Request, Response}from "express";
const router = express.Router();

import { AppDataSource } from "../config/data-source";
import { Message } from "./message.model";

const msgRespository = AppDataSource.getRepository(Message);

//add message
router.post("/message",async (req:Request, res:Response) => {
	try{
		const { chatId, senderId, text } = req.body;
		const msg = new Message();
		msg.chatId = chatId;
		msg.senderId = senderId;
		msg.text = text;

		await msgRespository.save(msg);
		res.status(200).json(msg);
	}catch (error) {
		console.log(error);
		res.status(500).json(error);
	}    
});

// get message
router.get("/message/:chatId",async (req:Request, res:Response) => {
	const chatId:number = parseInt(req.params.chatId);

	try{
		const result = await msgRespository.find({
			where: {
				chatId: chatId
			}
		});
		res.status(200).json(result);
	}catch(error){
		console.error(error);
		res.status(500).json(error);
	}
});

export default router;