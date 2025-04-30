// src/tools/youtubeTool.ts
import { Tool } from "@langchain/core/tools";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class YouTubeTool extends Tool {
  name = "youtube_search";
  description = "Search YouTube for top tutorials on a given topic";

  protected async _call(topic: string): Promise<string> {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: apiKey,
          q: topic + " technology tutorial",
          part: "snippet",
          type: "video",
          maxResults: 2
        }
      });

      return data.items.map((item: any, i: number) => `${i + 1}. ${item.snippet.title} - https://www.youtube.com/watch?v=${item.id.videoId}`).join("\n");
    } catch (err: any) {
      console.error("YouTube Tool Error:", err.message);
      return "Error fetching YouTube videos.";
    }
  }
}

export const youtubeTool = new YouTubeTool();