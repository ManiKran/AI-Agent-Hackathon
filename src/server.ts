// src/server.ts

import express from "express";
import type { Request, Response, RequestHandler } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { extractTextFromWord } from "./utils/parseWord.js";
import { extractSkillsAndTools } from "./agents/ResumeSkillAgent.js";
import { findMissingSkillsAndTools } from "./agents/missingSkillsAgent.js";
import { recommendLearningResources } from "./agents/LearningResourceAgent.js";
import { generateWeeklyStudyPlan } from "./agents/StudyPlanAgent.js"; // ✅ Added import

declare global {
  namespace Express {
    interface Request {
      files?: fileUpload.FileArray;
    }
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Serve static files if needed (optional)
app.use("/files", express.static(path.join("outputs")));

app.post(
  "/generate",
  (async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt } = req.body;
      const resumeFile = req.files?.resume as UploadedFile;
      const jdFile = req.files?.jobDescription as UploadedFile;

      if (!prompt || !resumeFile || !jdFile) {
        res.status(400).json({ message: "Missing files or prompt" });
        return;
      }

      const uploadsDir = path.join("uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const resumePath = path.join(uploadsDir, "resume.docx");
      const jdPath = path.join(uploadsDir, "job-description.txt");

      await resumeFile.mv(resumePath);
      await jdFile.mv(jdPath);

      const resumeText = await extractTextFromWord(resumePath);
      const jobDescription = fs.readFileSync(jdPath, "utf8");

      // Run first agent: skills and tools extraction
      const { skills, tools } = await extractSkillsAndTools(resumeText);

      // Run second agent: find missing skills and tools
      const missing = await findMissingSkillsAndTools({ skills, tools, jobDescription });

      // Run third agent: recommend learning resources
      const recommendationsRaw = await recommendLearningResources(
        missing.missing_skills,
        missing.missing_tools
      );

      let recommendations: any[] = [];
      if (recommendationsRaw) {
        recommendations =
          typeof recommendationsRaw === "string"
            ? JSON.parse(recommendationsRaw.replace(/```json|```/g, "").trim())
            : recommendationsRaw;
      }

      // ✅ Run fourth agent: generate weekly study plan
      const weeklyStudyPlan = await generateWeeklyStudyPlan(recommendations, prompt);

      // ✅ Return everything to frontend (nothing saved as file anymore)
      res.json({
        extractedSkills: skills,
        extractedTools: tools,
        missingSkills: missing.missing_skills,
        missingTools: missing.missing_tools,
        learningResources: recommendations,
        weeklyStudyPlan: weeklyStudyPlan,
      });
    } catch (error: any) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }) as RequestHandler
);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});