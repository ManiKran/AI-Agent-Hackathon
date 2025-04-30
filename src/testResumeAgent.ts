import path from "path";
import dotenv from "dotenv";
import { extractTextFromWord } from "./utils/parseWord.js";
import { extractSkillsAndTools } from "./agents/ResumeSkillAgent.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const resumePath = path.join(__dirname, "../resume.docx");
  const resumeText = await extractTextFromWord(resumePath);
  const result = await extractSkillsAndTools(resumeText);
  console.log("🛠️ Extracted Skills & Tools:", result);
}

main();