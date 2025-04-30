import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  temperature: 0.2,
  modelName: "gpt-4o", // GitHub-hosted model
  configuration: {
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: "https://models.inference.ai.azure.com"
  }
});

export async function extractSkillsAndTools(resumeText: string): Promise<{ skills: string[], tools: string[] }> {
  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are an AI assistant that extracts technical skills and tools from resumes."),
    new HumanMessage(
      `Extract the following details from this resume and return them as valid JSON:\n
{
  "skills": [array of technical skills only, no soft skills],
  "tools": [array of tools and technologies]
}

Return **only** a valid JSON response. Do not include any explanation or markdown formatting.

Resume:
${resumeText}`
    )
  ]);

  const chain = prompt.pipe(model);
  const result = await chain.invoke({});

  let text = String(result.content).trim();

  // Strip markdown formatting if accidentally included
  if (text.startsWith("```")) {
    text = text.replace(/```json|```/g, "").trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Failed to parse output:", text);
    return { skills: [], tools: [] };
  }
}