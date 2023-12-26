/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Request, Response } from "express";
import youtubedl from "youtube-dl-exec";
import path from "path";
import AWS from "aws-sdk";

const router = express.Router();

let link: string;

// Configure AWS SDK with your credentials and region
AWS.config.update({
	accessKeyId: "YOUR_ACCESS_KEY_ID",
	secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
	region: "YOUR_REGION",
});

const s3 = new AWS.S3();

router.post("/youtube-link", async (req: Request, res: Response) => {
	try {
		({ link } = req.body);
		res.json(link);
		console.log(link);

		const outputTemplate = path.join(__dirname, "downloads", "%(fulltitle)s.%(ext)s");

		// Download video using youtube-dl
		const output = await youtubedl(link, {
			dumpSingleJson: true,
			noCheckCertificates: true,
			noWarnings: true,
			preferFreeFormats: true,
			addHeader: ["referer:youtube.com", "user-agent:googlebot"],
		});

		console.log(output.fulltitle);

		await youtubedl(link, {
			output: outputTemplate,
		});

		console.log("Audio downloaded successfully! 🔊🎉");

		// Upload the downloaded video to S3
		const videoFileName = `${output.fulltitle}.${output.ext}`;
		const videoFilePath = path.join(__dirname, "downloads", videoFileName);

		const params = {
			Bucket: "YOUR_S3_BUCKET_NAME",
			Key: videoFileName,
			Body: require("fs").createReadStream(videoFilePath),
		};

		await s3.upload(params).promise();

		console.log("Video uploaded to S3 successfully!");

	} catch (error) {
		console.log(error);
	}
});

export default router;
