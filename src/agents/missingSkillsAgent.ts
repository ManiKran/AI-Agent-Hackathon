// agents/missingSkillsAgent.ts
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4o",
  configuration: {
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: "https://models.inference.ai.azure.com"
  }
});

export async function findMissingSkillsAndTools(input: {
  skills: string[];
  tools: string[];
  jobDescription: string;
}): Promise<{ missing_skills: string[]; missing_tools: string[] }> {
  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are a career coach AI that compares resume data with job descriptions to find missing technical skills and tools."),
    new HumanMessage(
      `Given the candidate's skills and tools, and the job description below, return a valid JSON of the missing skills and tools.

{
  "missing_skills": [array of technical skills(no soft skills) not in resume but mentioned in JD],
  "missing_tools": [array of tools and technologies not in resume but mentioned in JD]
}

Return only JSON.

Candidate Skills: ${input.skills.join(", ")}
Tools & Technologies: ${input.tools.join(", ")}

Job Description:
${input.jobDescription}`
    )
  ]);

  const chain = prompt.pipe(model);
  const result = await chain.invoke({});
  let text = String(result.content).trim();

  if (text.startsWith("```")) {
    text = text.replace(/```json|```/g, "").trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Failed to parse output:", text);
    return { missing_skills: [], missing_tools: [] };
  }
}