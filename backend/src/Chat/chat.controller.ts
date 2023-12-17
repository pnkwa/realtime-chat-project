import express , {Request, Response}from "express";
const router = express.Router();

import { AppDataSource } from "../config/data-source";
import { Chat } from "./chat.model";
import { ArrayContains } from "typeorm";

const chatRepository = AppDataSource.getRepository(Chat);

//create chat
router.post("/chat", async (req: Request, res: Response) => {
	try {
		const { senderId, receiverId } = req.body;

		const chat = new Chat();
		chat.members = [senderId, receiverId];

		await chatRepository.save(chat);
		res.status(200).json(chat);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});


//user chat (get all chats)
router.get("/chat/:userId", async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		console.log(userId);
  
		const chats = await chatRepository
			.createQueryBuilder("chat")
			.where(":userId = ANY(chat.members)", { userId })
			.getMany();
  
		res.json(chats);
	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
});

//find a chat
router.get("/chat/find/:firstId/:secondId", async(req:Request, res:Response) => {
	try {
		const firstId: string = req.params.firstId;
		const secondId: string = req.params.secondId;

		// if (isNaN(firstId || secondId)){
		// 	res.status(400).json({error: "Invalid user ID"});
		// 	return;
		// }

		const chat = await chatRepository.findBy({
			members: ArrayContains([firstId, secondId])            
		});

		res.json(chat);

	}catch(error){
		console.log(error);
		res.status(500).json(error);
	}
});

export default router;