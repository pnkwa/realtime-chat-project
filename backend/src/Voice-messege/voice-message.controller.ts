import express, { Request, Response } from "express";
import youtubedl from "youtube-dl-exec";
import path from "path";

const router = express.Router();

let link: string;

router.post("/youtube-link", async (req: Request, res: Response) => {
	try {
		({ link } = req.body);
		res.json(link);
		console.log(link);

		const outputTemplate = path.join(__dirname, "downloads", "%(fulltitle)s.%(ext)s");

		await youtubedl(link, {
			dumpSingleJson: true,
			noCheckCertificates: true,
			noWarnings: true,
			preferFreeFormats: true,
			addHeader: ["referer:youtube.com", "user-agent:googlebot"]
		}).then(output => console.log(output.fulltitle));

		await youtubedl(link, {
			"output": outputTemplate
		});

		console.log("Audio downloaded successfully! 🔊🎉");

	} catch (error) {
		console.log(error);
	}
});

export default router;
