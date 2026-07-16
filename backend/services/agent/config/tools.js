export const TOOL_DEFINITIONS = {
  web_search: {
    name: "web_search",
    description: "Search the web for current information",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", description: "Maximum results", default: 5 },
      },
      required: ["query"],
    },
  },
  code_execution: {
    name: "code_execution",
    description: "Execute code in a sandboxed environment",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code to execute" },
        language: { type: "string", enum: ["python", "javascript"], default: "python" },
      },
      required: ["code"],
    },
  },
  file_operations: {
    name: "file_operations",
    description: "Read, write, and list files in workspace",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["read", "write", "list", "delete"] },
        path: { type: "string", description: "File path" },
        content: { type: "string", description: "Content for write operations" },
      },
      required: ["action", "path"],
    },
  },
  data_analysis: {
    name: "data_analysis",
    description: "Analyze CSV/JSON data with pandas",
    parameters: {
      type: "object",
      properties: {
        data: { type: "string", description: "CSV or JSON data" },
        operations: { type: "array", items: { type: "string" }, description: "Analysis steps" },
      },
      required: ["data", "operations"],
    },
  },
  image_generation: {
    name: "image_generation",
    description: "Generate images using DALL-E",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image description" },
        size: { type: "string", enum: ["1024x1024", "1792x1024", "1024x1792"], default: "1024x1024" },
        quality: { type: "string", enum: ["standard", "hd"], default: "standard" },
      },
      required: ["prompt"],
    },
  },
};

export const DEFAULT_AGENT_TEMPLATES = [
  {
    name: "General Assistant",
    description: "A helpful general-purpose AI assistant",
    systemPrompt: `You are a helpful, harmless, and honest AI assistant. Provide clear, accurate, and concise responses. If you don't know something, say so.`,
    model: "gpt-4o-mini",
    temperature: 0.7,
    capabilities: [],
    isDefault: true,
  },
  {
    name: "Code Expert",
    description: "Expert programmer for code review, debugging, and development",
    systemPrompt: `You are an expert software engineer. Help with:
- Code review and best practices
- Debugging and troubleshooting
- Architecture and design patterns
- Performance optimization
- Testing strategies

Write clean, well-documented code. Explain your reasoning.`,
    model: "gpt-4o",
    temperature: 0.3,
    capabilities: ["code_execution", "file_operations"],
    isDefault: false,
  },
  {
    name: "Research Analyst",
    description: "Research specialist with web search capabilities",
    systemPrompt: `You are a research analyst. Provide thorough, well-sourced answers.
- Search for current information when needed
- Cite sources with URLs
- Synthesize multiple perspectives
- Identify credibility of sources
- Structure findings clearly`,
    model: "gpt-4o-mini",
    temperature: 0.4,
    capabilities: ["web_search"],
    isDefault: false,
  },
  {
    name: "Data Scientist",
    description: "Data analysis, visualization, and ML assistance",
    systemPrompt: `You are a data scientist. Help with:
- Exploratory data analysis
- Statistical analysis
- Machine learning model selection
- Data visualization recommendations
- Feature engineering
- Model evaluation

Use code execution for analysis. Provide actionable insights.`,
    model: "gpt-4o",
    temperature: 0.3,
    capabilities: ["code_execution", "data_analysis"],
    isDefault: false,
  },
  {
    name: "Creative Writer",
    description: "Creative writing, content creation, and storytelling",
    systemPrompt: `You are a creative writer. Help with:
- Storytelling and narratives
- Content marketing copy
- Blog posts and articles
- Scripts and screenplays
- Poetry and creative prose

Match the requested tone and style. Be engaging and original.`,
    model: "gpt-4o-mini",
    temperature: 0.8,
    capabilities: [],
    isDefault: false,
  },
];