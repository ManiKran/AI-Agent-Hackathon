import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { extractTextFromWord } from "./utils/parseWord.js";
import { extractSkillsAndTools } from "./agents/ResumeSkillAgent.js";
import { findMissingSkillsAndTools } from "./agents/missingSkillsAgent.js";
import { recommendLearningResources } from "./agents/LearningResourceAgent.js";
import { generateLearningPDF } from "./utils/pdfGenerator.js";
import { generateWeeklyStudyPlan } from "./agents/StudyPlanAgent.js";
import { generateStudyPlanPDF } from "./utils/studyPlanPdfGenerator.js";

dotenv.config();

async function main() {
  try {
    console.log("Starting Mentor AI workflow...");

    // 1️⃣ Load Resume (Word file)
    const resumePath = path.join("resume.docx");
    const resumeText = await extractTextFromWord(resumePath);
    const jobDescription = fs.readFileSync("job-description.txt", "utf8");

    // 2️⃣ First Agent: Extract skills/tools
    console.log("Extracting skills and tools from resume...");
    const { skills, tools } = await extractSkillsAndTools(resumeText);
    console.log("Extracted Skills:", skills);
    console.log("Extracted Tools:", tools);

    // 3️⃣ Second Agent: Find Missing Skills/Tools
    console.log("Comparing extracted skills with job description...");
    const missing = await findMissingSkillsAndTools({
      skills,
      tools,
      jobDescription,
    });
    console.log("Missing Skills:", missing.missing_skills);
    console.log("Missing Tools:", missing.missing_tools);

    // 4️⃣ Third Agent: Recommend Learning Resources
    console.log("Recommending learning resources...");
    const recommendationsRaw = await recommendLearningResources(
      missing.missing_skills,
      missing.missing_tools
    );

    console.log("Raw Recommendations Output:", recommendationsRaw);

    if (!recommendationsRaw) {
      throw new Error("Failed to fetch learning resources. Output is undefined.");
    }

    // Proper parsing
    let recommendations: any[] = [];
    try {
      recommendations = typeof recommendationsRaw === "string"
        ? JSON.parse(recommendationsRaw.replace(/```json|```/g, "").trim())
        : recommendationsRaw;
    } catch (error) {
      console.error("❌ Error parsing recommendations output:", error);
      throw new Error("Failed to parse learning resources JSON.");
    }

    console.log("Final Recommendations:", recommendations);

    // Save to JSON
    fs.writeFileSync(
      "learning-resources.json",
      JSON.stringify(recommendations, null, 2)
    );
    console.log("Learning resources saved to learning-resources.json");

    // 5️⃣ Generate Learning Resources PDF
    await generateLearningPDF(recommendations);
    console.log("Learning resources PDF generated!");

    // 6️⃣ Fourth Agent: Generate Weekly Study Plan
    // 6️⃣ Fourth Agent: Generate Weekly Study Plan
    console.log("Reading custom study plan prompt from file...");
    const promptPath = path.join("study-plan-prompt.txt");
    const prompt = fs.readFileSync(promptPath, "utf8").trim();

    const studyPlan = await generateWeeklyStudyPlan(recommendations, prompt);

    // Save Study Plan PDF
    await generateStudyPlanPDF(studyPlan);
    console.log("Study plan PDF generated!");

    console.log("Workflow completed successfully.");
  } catch (error) {
    console.error("Workflow Error:", error);
  }
}

main();