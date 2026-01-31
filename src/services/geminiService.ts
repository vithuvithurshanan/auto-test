
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const analyzeTestingRequirement = async (url: string, credentials?: { username: string, password: string }, instructions?: string, pageCtx?: any) => {
  const authText = credentials?.username
    ? `The site requires login. Use these credentials for the Selenium script: Username: "${credentials.username}", Password: "${credentials.password}". Ensure the script performs a login step first.`
    : "No authentication credentials provided.";

  const instructionsText = instructions
    ? `Strictly follow these user-defined workflow instructions: "${instructions}".`
    : "Test primary user flows.";

  const contextText = pageCtx
    ? `PAGE CONTEXT (Use these ACTUAL selectors):
       Title: ${pageCtx.title}
       Inputs: ${JSON.stringify(pageCtx.inputs)}
       Buttons: ${JSON.stringify(pageCtx.buttons)}
       Links: ${JSON.stringify(pageCtx.links)}
       Summary: ${pageCtx.textSummary}`
    : "No live page context available. Infer selectors based on standard conventions.";

  const prompt = `Analyze this URL for automation testing: ${url}. 
  ${authText}
  ${instructionsText}
  ${contextText}
  
  Provide the following in JSON format:
  1. A professional Jenkinsfile (Pipeline-as-code).
  2. A Selenium Python script.
  3. A detailed UI testing analysis.
  4. A reliability score.
  5. "puppeteerActions": A JSON array of steps to execute this workflow using Puppeteer. 
     - CRITICAL: Use the EXACT IDs/Classes from the PAGE CONTEXT above. Do not guess selectors if provided.
     - Actions can be: "click", "type", "wait", "navigate", "submit".
     - If the user instruction is "login", match the input fields from Page Context.
  6. "unitTestFocusSelector": The single best CSS selector that encapsulates the area being tested (e.g. valid form, specific div, or body).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Use stable flash model
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jenkinsfile: { type: Type.STRING },
            seleniumScript: { type: Type.STRING },
            analysis: { type: Type.STRING },
            score: { type: Type.NUMBER },
            puppeteerActions: {
              type: Type.ARRAY,
              description: "List of executable actions for Puppeteer",
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, enum: ["click", "type", "wait", "navigate", "submit", "check_text", "press_key"] },
                  selector: { type: Type.STRING, description: "CSS selector for the element" },
                  value: { type: Type.STRING, description: "Text to type or verify" },
                  description: { type: Type.STRING, description: "Description of what this step does" }
                },
                required: ["action", "description"]
              }
            },
            unitTestFocusSelector: { type: Type.STRING, description: "The primary CSS selector to focus on/screenshot for a Unit Test." }
          },
          required: ["jenkinsfile", "seleniumScript", "analysis", "score", "puppeteerActions"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);

    // Fallback for Quota Exceeded (429) or other API errors
    console.warn("Returning fallback data due to AI API limitation.");
    return {
      score: 85,
      analysis: "AI Service is currently overloaded (Quota Exceeded). Running with standard safe defaults.\n\nThe target application appears to be a web interface. Standard automated testing protocols will be applied. \n\nCheck back later for full AI diagnostics.",
      jenkinsfile: "// Standard Fallback Pipeline\npipeline {\n    agent any\n    stages {\n        stage('Test') {\n            steps {\n                echo 'Running safe mode tests...'\n            }\n        }\n    }\n}",
      seleniumScript: "# Fallback Selenium Script\nfrom selenium import webdriver\nprint('Running fallback test...')",
      puppeteerActions: [
        { action: "wait", description: "Wait for page load" },
        { action: "check_text", value: "body", description: "Verify page content exists" }
      ],
      unitTestFocusSelector: "body"
    };
  }
};
