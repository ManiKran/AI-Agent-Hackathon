// src/agents/WeeklyStudyPlanAgent.ts
import { getYouTubeVideoDuration } from "../utils/youtubeDuration.js";
import { getCourseraCourseDuration } from "../utils/courseraDuration.js";
import { v4 as uuidv4 } from "uuid";

interface StudyTask {
  id: string;
  topic: string;
  type: "Certification" | "YouTube" | "GitHub";
  title: string;
  link: string;
  estimatedMinutes: number;
}

interface StudyPlanWeek {
  week: number;
  tasks: StudyTask[];
}

/**
 * Generates a weekly study plan based on learning resources and a user prompt.
 * Returns an object with { prompt, weeks } structure.
 */
export async function generateWeeklyStudyPlan(
  resources: any[],
  prompt: string
): Promise<{ prompt: string; weeks: StudyPlanWeek[] }> {
  console.log("🧠 Preparing study plan...");

  const studyTasks: StudyTask[] = [];

  // 1️⃣ Loop through each learning topic
  for (const res of resources) {
    const topic = res.topic || "Unknown Topic";

    // Certification
    if (res.certification) {
      const slug = extractCourseraSlug(res.certification);
      const durationHours = await getCourseraCourseDuration(slug);
      studyTasks.push({
        id: uuidv4(),
        topic,
        type: "Certification",
        title: res.certification.split("-")[0].trim(),
        link: res.certification.split("-")[1]?.trim() || res.certification,
        estimatedMinutes: (durationHours || 5) * 60, // fallback 5 hours if undefined
      });
    }

    // YouTube Videos
    if (res.youtube && Array.isArray(res.youtube)) {
      for (const vid of res.youtube) {
        const parts = vid.split("- https://www.youtube.com/watch?v=");
        if (parts.length === 2) {
          const title = parts[0].trim();
          const videoId = parts[1].split("&")[0]; // in case of extra params
          const durationMinutes = await getYouTubeVideoDuration(videoId);
          studyTasks.push({
            id: uuidv4(),
            topic,
            type: "YouTube",
            title,
            link: "https://www.youtube.com/watch?v=" + videoId,
            estimatedMinutes: durationMinutes || 20, // fallback 20 minutes
          });
        }
      }
    }

    // GitHub Projects
    if (res.github && Array.isArray(res.github)) {
      for (const repo of res.github) {
        studyTasks.push({
          id: uuidv4(),
          topic,
          type: "GitHub",
          title: repo.name,
          link: repo.url,
          estimatedMinutes: 120, // Assume 2 hours
        });
      }
    }
  }

  console.log(`📝 Total study tasks prepared: ${studyTasks.length}`);

  // 2️⃣ Distribute tasks across 4 weeks
  const plan = distributeTasksByWeek(studyTasks, prompt);

  // ✅ FINAL return (No file writing anymore ❌)
  return {
    prompt,
    weeks: plan,
  };
}

/**
 * Helper to extract Coursera course slug
 */
function extractCourseraSlug(link: string): string {
  const match = link.match(/learn\/([^\/\n\s]+)/);
  return match ? match[1] : "";
}

/**
 * Helper to distribute study tasks across 4 weeks
 */
function extractWeeksFromPrompt(prompt: string): number {
  const match = prompt.match(/(\d+)\s*week/i);
  if (match && match[1]) {
    const numWeeks = parseInt(match[1], 10);
    return isNaN(numWeeks) ? 4 : Math.max(1, numWeeks); // Avoid 0-week plans
  }
  return 4; // Default
}

function distributeTasksByWeek(tasks: StudyTask[], prompt: string): StudyPlanWeek[] {
  const numberOfWeeks = extractWeeksFromPrompt(prompt);
  const weeks: StudyTask[][] = Array.from({ length: numberOfWeeks }, () => []);
  let weekIndex = 0;

  for (const task of tasks) {
    weeks[weekIndex].push(task);
    weekIndex = (weekIndex + 1) % numberOfWeeks;
  }

  return weeks.map((tasks, index) => ({
    week: index + 1,
    tasks,
  }));
}