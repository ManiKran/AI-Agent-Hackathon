import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Get the duration of a YouTube video in minutes.
 * @param videoId YouTube Video ID
 */
export async function getYouTubeVideoDuration(videoId: string): Promise<number> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;
    
    const { data } = await axios.get(url);
    const duration = data.items[0]?.contentDetails?.duration; // ISO 8601 format (e.g., PT15M33S)

    if (!duration) return 0;

    // Convert ISO8601 to minutes
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    const totalMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);
    return totalMinutes;
  } catch (err: any) {
    console.error("❌ YouTube Duration Error:", err.message);
    return 0;
  }
}