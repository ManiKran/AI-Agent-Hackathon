import { useState } from "react";
import axios from "axios";

export function UploadForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [learningResources, setLearningResources] = useState<any[]>([]);
  const [weeklyStudyPlan, setWeeklyStudyPlan] = useState<{ prompt: string; weeks: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription || !prompt) {
      alert("Please upload both files and enter a prompt!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);
    formData.append("prompt", prompt);

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { missingSkills, learningResources, weeklyStudyPlan } = response.data;

      setMissingSkills(missingSkills || []);
      setLearningResources(learningResources || []);
      setWeeklyStudyPlan(weeklyStudyPlan || null);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Something went wrong! Please check server console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Mentor AI - Upload Your Resume & JD</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div>
          <label>Upload Resume (.docx): </label>
          <input type="file" accept=".docx" onChange={(e) => setResume(e.target.files?.[0] || null)} />
        </div>
        <br />
        <div>
          <label>Upload Job Description (.txt): </label>
          <input type="file" accept=".txt" onChange={(e) => setJobDescription(e.target.files?.[0] || null)} />
        </div>
        <br />
        <div>
          <label>Enter Your Custom Prompt: </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Plan to become a Data Scientist in 4 weeks"
            style={{ width: "400px" }}
          />
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Generate Learning Plan"}
        </button>
      </form>

      {missingSkills.length > 0 && (
        <div>
          <h2>🔍 Missing Skills:</h2>
          <ul>
            {missingSkills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      {learningResources.length > 0 && (
        <div>
          <h2>📚 Learning Resources:</h2>
          {learningResources.map((resource, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <h4>{resource.topic}</h4>
              {resource.certification && (
                <p>
                  <strong>Certification:</strong>{" "}
                  <a href={resource.certification.split("- ")[1]} target="_blank" rel="noopener noreferrer">
                    {resource.certification.split("- ")[0]}
                  </a>
                </p>
              )}
              {resource.youtube?.map((yt: string, index: number) => (
                <p key={index}>
                  <strong>YouTube:</strong>{" "}
                  <a href={yt.split("- ")[1]} target="_blank" rel="noopener noreferrer">
                    {yt.split("- ")[0]}
                  </a>
                </p>
              ))}
              {resource.github?.map((gh: any, index: number) => (
                <p key={index}>
                  <strong>GitHub:</strong>{" "}
                  <a href={gh.url} target="_blank" rel="noopener noreferrer">
                    {gh.name}
                  </a>
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {weeklyStudyPlan && weeklyStudyPlan.weeks && weeklyStudyPlan.weeks.length > 0 && (
        <div>
          <h2>🗓️ Weekly Study Plan</h2>
          <p><strong>Prompt:</strong> {weeklyStudyPlan.prompt}</p>
          {weeklyStudyPlan.weeks.map((week: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <h3>Week {week.week}</h3>
              <ul>
                {week.tasks.map((task: any, taskIdx: number) => (
                  <li key={taskIdx}>
                    {task.type}: <a href={task.link} target="_blank" rel="noopener noreferrer">{task.title}</a> ({task.estimatedMinutes} mins)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadForm;
