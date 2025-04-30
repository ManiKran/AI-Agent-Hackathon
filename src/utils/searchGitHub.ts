import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_PAT;

export async function searchGitHubProjects(query: string): Promise<{ name: string; url: string }[]> {
  try {
    const { data } = await axios.get("https://api.github.com/search/repositories", {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      params: {
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 2,
      },
    });

    return data.items.map((repo: any) => ({
      name: repo.full_name,
      url: repo.html_url,
    }));
  } catch (err: any) {
    console.error("❌ GitHub API error:", err.message);
    return [];
  }
}