
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const analyzeTestingRequirement = async (url: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Checks if API Key is missing or is the placeholder
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        console.warn("Using Mock Data Mode: No valid Gemini API Key found.");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        return {
            jenkinsfile: `pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git '${url}'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}`,
            seleniumScript: `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("${url}")
assert "Example Domain" in driver.title
driver.quit()`,
            analysis: `Mock Analysis for ${url}:
1. Homepage loads successfully.
2. Responsive design needs improvement on mobile viewports.
3. Login flow requires CAPTCHA verification (potential automation blocker).
4. Accessibility score is high (95/100).`,
            score: 85
        };
    }

    const prompt = `Analyze this URL for automation testing: ${url}. 
  Provide the following in JSON format:
  1. A professional Jenkinsfile (Pipeline-as-code) that includes checkout, build, and headless Selenium testing stages.
  2. A Selenium Python script using Headless Chrome to test the primary features of this site.
  3. A detailed UI testing analysis (what should be checked, common pitfalls for this specific site).
  4. A reliability score (0-100) based on perceived complexity.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        jenkinsfile: { type: Type.STRING },
                        seleniumScript: { type: Type.STRING },
                        analysis: { type: Type.STRING },
                        score: { type: Type.NUMBER }
                    },
                    required: ["jenkinsfile", "seleniumScript", "analysis", "score"]
                }
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
};
