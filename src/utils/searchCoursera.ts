import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const COURSERA_API_KEY = process.env.COURSERA_API_KEY;

export async function searchCourseraCertifications(query: string): Promise<{ title: string; url: string }[]> {
  try {
    const { data } = await axios.get(`https://api.coursera.org/api/courses.v1`, {
      params: {
        q: "search",
        query,
      },
      headers: {
        Authorization: `Bearer ${COURSERA_API_KEY}`,
      },
    });

    return (data.elements || []).slice(0, 2).map((item: any) => ({
      title: item.name,
      url: `https://www.coursera.org/learn/${item.slug}`,
    }));
  } catch (err: any) {
    console.error("❌ Coursera API error:", err.message);
    return [];
  }
}