// src/tools/githubTool.ts
import { Tool } from "@langchain/core/tools";
import axios from "axios";

class GitHubTool extends Tool {
  name = "search_github_projects";
  description = "Search GitHub repositories based on a skill or tool name and return the top repositories (best match).";

  protected async _call(topic: string): Promise<string> {
    console.log("🔁 GitHubTool called for:", topic);
    const refinedTopic = `${topic}`;

    try {
      const { data } = await axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(refinedTopic)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      return JSON.stringify(
        data.items.slice(0, 2).map((repo: any) => ({
          name: repo.full_name,
          url: repo.html_url,
        }))
      );
    } catch (err: any) {
      console.error("❌ GitHub tool error:", err.message);
      return "[]";
    }
  }
}

export const githubTool = new GitHubTool();