// client/src/lib/openai.ts
import OpenAI from "openai";

// ✅ Safely resolve API key for both environments
const apiKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENAI_API_KEY) ||
  (typeof process !== "undefined" ? process.env?.OPENAI_API_KEY : undefined) ||
  "default_key";

// Add validation to provide a clearer error message
const isApiKeyValid = !!(apiKey && apiKey !== "default_key");

if (!isApiKeyValid) {
  console.warn("OpenAI API key is not set. AI features will not work properly.");
}

let openai: OpenAI | null = null;

// Only initialize OpenAI client if API key is valid
if (isApiKeyValid) {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // required for client-side use
  });
}

export interface TrainingRecommendation {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "training" | "nutrition" | "recovery" | "analysis";
  points: number;
  estimatedDuration: string;
}

export async function generateTrainingRecommendations(
  sport: string,
  currentMetrics: { speed: number; strength: number; stamina: number; technique: number },
  skillLevel: string,
  recentPerformance: any[]
): Promise<TrainingRecommendation[]> {
  // Return early if OpenAI is not configured
  if (!openai || !isApiKeyValid) {
    console.warn("OpenAI not configured. Returning fallback recommendations.");
    return [
      {
        title: "Complete 30-minute skill practice",
        description: "Focus on core techniques with deliberate practice.",
        difficulty: "medium",
        category: "training",
        points: 25,
        estimatedDuration: "30 minutes",
      },
      {
        title: "Log nutrition data",
        description: "Track your food intake and hydration levels daily.",
        difficulty: "easy",
        category: "nutrition",
        points: 10,
        estimatedDuration: "10 minutes",
      },
    ];
  }

  try {
    const prompt = `You are an AI sports coach. Generate 5 personalized training recommendations for an athlete with the following profile:

    Sport: ${sport}
    Current Metrics (out of 10): Speed: ${currentMetrics.speed}, Strength: ${currentMetrics.strength}, Stamina: ${currentMetrics.stamina}, Technique: ${currentMetrics.technique}
    Skill Level: ${skillLevel}
    Recent Performance: ${JSON.stringify(recentPerformance)}

    Provide recommendations that target their weakest areas while maintaining their strengths. Each recommendation should include:
    - title
    - description (2-3 sentences)
    - difficulty (easy, medium, hard)
    - category (training, nutrition, recovery, analysis)
    - points (10–50)
    - estimatedDuration`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert AI sports coach. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];
  } catch (error) {
    console.error("Failed to generate training recommendations:", error);
    // Return fallback recommendations
    return [
      {
        title: "Complete 30-minute skill practice",
        description: "Focus on core techniques with deliberate practice.",
        difficulty: "medium",
        category: "training",
        points: 25,
        estimatedDuration: "30 minutes",
      },
      {
        title: "Log nutrition data",
        description: "Track your food intake and hydration levels daily.",
        difficulty: "easy",
        category: "nutrition",
        points: 10,
        estimatedDuration: "10 minutes",
      },
    ];
  }
}

export async function analyzeInjuryRisk(athleteData: {
  age: number;
  sport: string;
  recentMetrics: any[];
  trainingLoad: string;
  previousInjuries: string[];
}): Promise<{
  riskLevel: "low" | "medium" | "high" | "critical";
  bodyParts: string[];
  recommendations: string[];
  confidence: number;
}> {
  // Return early if OpenAI is not configured
  if (!openai || !isApiKeyValid) {
    console.warn("OpenAI not configured. Returning fallback injury analysis.");
    return {
      riskLevel: "low",
      bodyParts: [],
      recommendations: ["Regular rest and recovery", "Proper warm-up and cool-down"],
      confidence: 0.5,
    };
  }

  try {
    const prompt = `Analyze injury risk for this athlete:

    Age: ${athleteData.age}
    Sport: ${athleteData.sport}
    Recent Metrics: ${JSON.stringify(athleteData.recentMetrics)}
    Training Load: ${athleteData.trainingLoad}
    Previous Injuries: ${athleteData.previousInjuries.join(", ") || "None"}

    Respond with JSON in this format:
    { "riskLevel": "...", "bodyParts": [...], "recommendations": [...], "confidence": 0.xx }`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an AI sports medicine expert specializing in injury prevention.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      riskLevel: result.riskLevel || "low",
      bodyParts: result.bodyParts || [],
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("Failed to analyze injury risk:", error);
    return {
      riskLevel: "low",
      bodyParts: [],
      recommendations: ["Regular rest and recovery", "Proper warm-up and cool-down"],
      confidence: 0.5,
    };
  }
}