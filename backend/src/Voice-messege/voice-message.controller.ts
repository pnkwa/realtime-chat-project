/* eslint-disable no-mixed-spaces-and-tabs */
import express, { Request, Response } from "express";
import { S3Client, PutObjectCommand, GetObjectAclCommand } from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs/promises";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

const router = express.Router();
const currentDate = new Date().toISOString().split("T")[0]; 
let link: string;

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

router.post("/youtube-link", async (req: Request, res: Response) => {
	try {
	   ({ link } = req.body);
	   res.json(link);
	   console.log(link);
 
	   // Download audio from YouTube
	   const audioFilePath = await downloadAudio(link);
 
	   // Upload the MP3 file to S3
	   const key = `audios/${currentDate}/${path.basename(audioFilePath)}`;
	   await uploadToS3(audioFilePath, key);
 
	   console.log("Downloaded, converted, and uploaded to S3 successfully! 🎉");
	} catch (error) {
	   console.error(error);
	   res.status(500).json({ error: "Internal Server Error" });
	}
});
 
const downloadAudio = async (youtubeUrl: string): Promise<string> => {
	try {
	   const videoInfo = await ytdl.getInfo(youtubeUrl);
	   const audioFormat = ytdl.filterFormats(videoInfo.formats, "audioonly")[0];
 
	   if (!audioFormat) {
		  throw new Error("No audio stream found in the video.");
	   }
 
	   const audioStream = ytdl(youtubeUrl, { format: audioFormat });
	   const outputFilePath = `${__dirname}/downloads/${videoInfo.videoDetails.title}.mp3`;
 
	   const proc = ffmpeg({ source: audioStream })
			.withAudioCodec("libmp3lame")
			.toFormat("mp3")
			.on("end", () => {
				console.log("Video successfully converted to MP3");
			})
			.on("error", (error, stdout, stderr) => {
				console.error("Error converting video to MP3:", error);
				console.error("ffmpeg stdout:", stdout);
				console.error("ffmpeg stderr:", stderr);
			});
	
	   await new Promise<void>((resolve, reject) => {
			proc.saveToFile(outputFilePath)
				.on("end", resolve)
				.on("error", reject);
	   });
 
	   return outputFilePath;
 
	} catch (error) {
	   console.error("Error downloading audio:", error);
	   throw error;
	}
};
 
 
const uploadToS3 = async (audioFilePath: string, key: string) => {
	const uploadParams = {
	   Bucket: bucketName,
	   Key: key,
	   Body: await fs.readFile(audioFilePath), // Read the MP3 file from the local path
	};
 
	try {
	   const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
	   console.log("MP3 file uploaded to S3:", uploadResult);
	   await fs.unlink(audioFilePath);
	} catch (error) {
	   console.error("Error uploading MP3 file to S3:", error);
	   throw error;
	}
};

export default router;
