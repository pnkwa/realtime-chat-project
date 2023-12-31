import express , {Request, Response}from "express";
const router = express.Router();

import { AppDataSource } from "../config/data-source";
import { Message } from "./message.model";

const msgRespository = AppDataSource.getRepository(Message);

//add message
router.post("/message",async (req:Request, res:Response) => {
	try{
		const { chatId, senderId, text, key_video } = req.body;
		const msg = new Message();
		msg.chatId = chatId;
		msg.senderId = senderId;
		msg.text = text;

		if ( key_video !== null){
			msg.key_video = key_video;
		}

		await msgRespository.save(msg);
		res.status(200).json(msg);
	}catch (error) {
		console.log(error);
		res.status(500).json(error);
	}    
});

// get message by chat id
router.get("/message/:chatId",async (req:Request, res:Response) => {
	const chatId:string = req.params.chatId;

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


//get all message 
router.get("/message",async (req:Request, res:Response) => {
	const word:string = req.query.word as string;
	try{
		let result = await msgRespository.find({
			select: {
				msgId: true,
				chatId: true,
				senderId: true,
				text: true,
				createAt: true,
				key_video: true
			}
		});

		if (word) {
			result = result.filter((msg) => msg.text.toLowerCase().includes(word.toLowerCase()));
		}

		res.json(result);
	}catch(error){
		console.log(error);
	}
});

export default router;