import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { githubTool } from "../tools/githubTool.js";
import { youtubeTool } from "../tools/youtubeTool.js";
import { courseraTool } from "../tools/courseraTool.js";
import dotenv from "dotenv";
dotenv.config();

const tools = [githubTool, youtubeTool, courseraTool];

const llm = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-4o",
  configuration: {
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: "https://models.inference.ai.azure.com",
  },
});

export async function recommendLearningResources(skills: string[], toolsList: string[]) {
  const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-functions-agent")

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt // ✅ fixed
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: false,
    maxIterations: 20,
    returnIntermediateSteps: true
  });

  const input = `Return learning resources for the following topics: ${[...skills, ...toolsList]
    .slice(0, 10)
    .join(", ")}. Output a JSON array with keys: topic, certification, youtube, github`;

  const result = await executor.invoke({ input });

  return result.output; // This will be a JSON string
}