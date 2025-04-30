import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function searchYouTubeVideos(query: string): Promise<{ title: string; url: string }[]> {
  try {
    const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        q: query,
        part: "snippet",
        type: "video",
        maxResults: 2,
        key: YOUTUBE_API_KEY,
      },
    });

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err: any) {
    console.error("❌ YouTube error:", err.message);
    return [];
  }
}