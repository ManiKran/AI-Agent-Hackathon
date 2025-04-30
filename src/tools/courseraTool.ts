import { Tool } from "@langchain/core/tools";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class CourseraTool extends Tool {
  name = "coursera_search";
  description = "Search Coursera for the top certification course on a topic";

  protected async _call(topic: string): Promise<string> {
    try {
      const apiKey = process.env.COURSERA_API_KEY;
      const { data } = await axios.get("https://api.coursera.org/api/courses.v1", {
        params: {
          q: "search",
          query: topic,
          limit: 1,
          fields: "courseId,name,slug",
        },
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      const course = data.elements?.[0];
      if (!course) return "No relevant certification found.";

      return `${course.name} - https://www.coursera.org/learn/${course.slug}`;
    } catch (err: any) {
      console.error("Coursera Tool Error:", err.message);
      return "Error fetching Coursera courses.";
    }
  }
}

export const courseraTool = new CourseraTool();