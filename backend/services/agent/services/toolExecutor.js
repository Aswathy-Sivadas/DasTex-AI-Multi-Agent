import OpenAI from "openai";
import { TOOL_DEFINITIONS } from "../config/tools.js";

class ToolExecutor {
  constructor(openai) {
    this.openai = openai;
  }

  async execute(toolName, args) {
    switch (toolName) {
      case "web_search":
        return this.webSearch(args);
      case "code_execution":
        return this.codeExecution(args);
      case "file_operations":
        return this.fileOperations(args);
      case "data_analysis":
        return this.dataAnalysis(args);
      case "image_generation":
        return this.imageGeneration(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async webSearch({ query, maxResults = 5 }) {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await response.json();
      
      const results = [];
      if (data.Abstract) results.push({ title: "Summary", content: data.Abstract, url: data.AbstractURL });
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, maxResults).forEach(topic => {
          if (topic.Text) results.push({ title: topic.Text.split(" - ")[0], content: topic.Text, url: topic.FirstURL });
        });
      }
      return { results: results.slice(0, maxResults) };
    } catch (error) {
      return { error: error.message, results: [] };
    }
  }

  async codeExecution({ code, language = "python" }) {
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, version: "*", files: [{ content: code }] }),
      });
      const data = await response.json();
      return { output: data.run?.output || data.message || "No output", error: data.run?.stderr };
    } catch (error) {
      return { error: error.message, output: "" };
    }
  }

  async fileOperations({ action, path, content }) {
    const fs = await import("fs/promises");
    const fullPath = process.cwd() + "/workspace/" + path;
    
    try {
      switch (action) {
        case "read":
          const data = await fs.readFile(fullPath, "utf-8");
          return { content: data };
        case "write":
          await fs.mkdir(fullPath.split("/").slice(0, -1).join("/"), { recursive: true });
          await fs.writeFile(fullPath, content);
          return { success: true, path };
        case "list":
          const files = await fs.readdir(fullPath, { withFileTypes: true });
          return { files: files.map(f => ({ name: f.name, type: f.isDirectory() ? "dir" : "file" })) };
        case "delete":
          await fs.unlink(fullPath);
          return { success: true };
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  async dataAnalysis({ data, operations }) {
    try {
      const code = `
import pandas as pd
import json
import io

data = ${JSON.stringify(data)}
df = pd.read_json(io.StringIO(json.dumps(data))) if data.strip().startswith('[') or data.strip().startswith('{') else pd.read_csv(io.StringIO(data))

results = {}
${operations.map(op => `results['${op}'] = df.${op}()`).join("\n")}

print(json.dumps(results, default=str))
      `;
      return this.codeExecution({ code, language: "python" });
    } catch (error) {
      return { error: error.message };
    }
  }

  async imageGeneration({ prompt, size = "1024x1024", quality = "standard" }) {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        size,
        quality,
        n: 1,
      });
      return { url: response.data[0].url, revisedPrompt: response.data[0].revised_prompt };
    } catch (error) {
      return { error: error.message };
    }
  }

  getToolSchema(toolName) {
    return TOOL_DEFINITIONS[toolName] || null;
  }

  getAllToolSchemas() {
    return Object.values(TOOL_DEFINITIONS);
  }
}

export default ToolExecutor;