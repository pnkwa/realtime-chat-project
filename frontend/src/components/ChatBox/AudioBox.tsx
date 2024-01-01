import React, { useState } from "react";
import { getAudioUrl } from "../../api/UrlRequests";

interface AudioBoxProps {
  audioKey: string;
}

const AudioBox: React.FC<AudioBoxProps> = ({ audioKey }: AudioBoxProps) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const fetchObjectAudio = async () => {
        try {
            if (audioKey) {
                const data = await getAudioUrl(audioKey);
                setAudioUrl(data);
                // console.log("audio url box : ", data);
            }
        } catch (error) {
            console.error("Error fetching audio:", error);
        }
    };

    fetchObjectAudio();

  
    return (
        <>
            {audioUrl ? (
                <audio controls>
                    <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio tag.
                </audio>
            ) : (
                <div>No audio available</div>
            )}
        </>
    );
};
  
export default AudioBox;
  