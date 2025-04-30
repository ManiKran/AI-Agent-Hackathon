import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Get estimated time to complete a Coursera course in hours.
 * @param courseSlug Coursera course slug
 */
export async function getCourseraCourseDuration(courseSlug: string): Promise<number> {
  try {
    const apiKey = process.env.COURSERA_API_KEY;
    const url = `https://api.coursera.org/api/courses.v1?q=slug&slug=${courseSlug}&fields=estimatedClassWorkload`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const workload = data?.elements?.[0]?.estimatedClassWorkload;

    if (!workload) return 10; // Assume 10 hours if not available

    return parseInt(workload, 10);
  } catch (err: any) {
    console.error("❌ Coursera Duration Error:", err.message);
    return 10; // Assume 10 hours if error
  }
}