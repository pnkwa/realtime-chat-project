/* eslint-disable no-mixed-spaces-and-tabs */
import express, { Request, Response } from "express";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { AppDataSource } from "../../config/data-source";
import { Message } from "../Message/message.model";
const msgRespository = AppDataSource.getRepository(Message);

// import path from "path";
// import fs from "fs/promises";
import ytdl from "ytdl-core";
// import ffmpeg from "fluent-ffmpeg";

const router = express.Router();
// const currentDate = new Date().toISOString().split("T")[0]; 

const bucketName = "voice-messenger";
const region = "ap-southeast-1";
const accessKeyId = "AKIA5DP55HDAB4JV73M5";
const secretAccessKey = "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";

const s3Client = new S3Client({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
});

router.post("/youtube-url", async (req: Request, res: Response) => {
	try {
		const { link } = req.body;

		if (!link) {
		  return res.status(400).json({ error: "'link' property is missing in the request body" });
		}
		
		// Continue with the rest of the code
		//    res.json(link);
	   console.log(link);
 
	   // Download audio from YouTube
	   const key = await downloadAudio(link);
		res.json(key);
	} catch (error) {
	   console.error(error);
	   res.status(500).json({ error: "Internal Server Error" });
	}
});
 
const downloadAudio = async (youtubeUrl: string) => {
	try {
	   const videoInfo = await ytdl.getInfo(youtubeUrl);
	   const audioFormat = ytdl.filterFormats(videoInfo.formats, "audioonly")[0];
 
	   if (!audioFormat) {
		  throw new Error("No audio stream found in the video.");
	   }
 
	   const audioStream = ytdl(youtubeUrl, { filter: "audioonly" });
		
	   const buffers = [];

	   	audioStream.on("data", (chunk) => {
			buffers.push(chunk);
	  	});
		
		const key = `${videoInfo.videoDetails.title}.mp3`;

		await new Promise<void>((resolve, reject) => {
			audioStream.on("finish", async () => {
				const audioBuffer = Buffer.concat(buffers);
				try {
					await uploadToS3(audioBuffer, key);
					resolve(); // Resolve the Promise when the upload is complete
				} catch (error) {
					reject(error); // Reject the Promise if there is an error during upload
				}
			});
		});

		return key;
	   
 
	} catch (error) {
	   console.error("Error downloading audio:", error);
	   throw error;
	}
};
 
 
const uploadToS3 = async (audioFilePath, key) => {
	const uploadParams = {
	   Bucket: bucketName,
	   Key: key,
	   Body: audioFilePath, 
	};
 
	try {
	   const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
	   console.log("MP3 file uploaded to S3:", uploadResult);
	   console.log("Downloaded, converted, and uploaded to S3 successfully! 🎉");

	} catch (error) {
	   console.error("Error uploading MP3 file to S3:", error);
	   throw error;
	}
};

//get object from s3
router.get("/youtube-url/:key", async (req: Request, res: Response) => {

	const key: string = req.params.key;
	// console.log(key);

	try{
		if(key !== null){
			const result = await msgRespository.findOne({
				where: {
					key_video: key
				}
			});
	
			const getObjectParams = {
				Bucket: bucketName,
				Key: result.key_video
			};
	
			const command = new GetObjectCommand(getObjectParams);
			const url = await getSignedUrl(
				s3Client,
				command,
				{expiresIn: 18000}
			);
	
			res.json(url);
		}
		
	}catch(error){
		console.log(error);
		res.status(500).json(error);
	}
}); 

export default router;
