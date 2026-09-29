import { GoogleGenAI } from "@google/genai";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const goals = [
  "Weight Loss",
  "Weight Gain",
  "Maintain Weight",
  "General Fitness",
] as const;

type Meal = {
  name: string;
  explanation: string;
};

type GeneratedPlan = {
  breakfast: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
};

function isValidNumber(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isGeneratedPlan(value: unknown): value is GeneratedPlan {
  if (!value || typeof value !== "object") return false;

  return ["breakfast", "lunch", "snack", "dinner"].every((key) => {
    const meal = (value as Record<string, unknown>)[key];
    return (
      typeof meal === "object" &&
      meal !== null &&
      typeof (meal as Meal).name === "string" &&
      typeof (meal as Meal).explanation === "string"
    );
  });
}

function planAsText(plan: GeneratedPlan) {
  return [
    `Breakfast: ${plan.breakfast.name}`,
    `Explanation: ${plan.breakfast.explanation}`,
    `Lunch: ${plan.lunch.name}`,
    `Explanation: ${plan.lunch.explanation}`,
    `Snack: ${plan.snack.name}`,
    `Explanation: ${plan.snack.explanation}`,
    `Dinner: ${plan.dinner.name}`,
    `Explanation: ${plan.dinner.explanation}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "Meal-plan generation is not configured yet. Please try again later.",
        },
        { status: 500 }
      );
    }

    const body: unknown = await request.json();
    const { age, height, weight, goal } = (body ?? {}) as Record<string, unknown>;

    if (
      !isValidNumber(age, 13, 120) ||
      !isValidNumber(height, 90, 250) ||
      !isValidNumber(weight, 25, 300) ||
      !goals.includes(goal as (typeof goals)[number])
    ) {
      return Response.json(
        { error: "Please enter a valid age, height, weight, and fitness goal." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Create a personalized one-day healthy meal plan for a person in Pakistan.

Profile: age ${age}, height ${height} cm, weight ${weight} kg, fitness goal ${goal}.

Use affordable, common, home-cooked Pakistani food. Include breakfast, lunch, snack, and dinner. Each meal needs a specific meal name with sensible portions and a short, practical explanation of how it supports the goal. Do not make medical claims.`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            breakfast: { type: "object", properties: { name: { type: "string" }, explanation: { type: "string" } }, required: ["name", "explanation"] },
            lunch: { type: "object", properties: { name: { type: "string" }, explanation: { type: "string" } }, required: ["name", "explanation"] },
            snack: { type: "object", properties: { name: { type: "string" }, explanation: { type: "string" } }, required: ["name", "explanation"] },
            dinner: { type: "object", properties: { name: { type: "string" }, explanation: { type: "string" } }, required: ["name", "explanation"] },
          },
          required: ["breakfast", "lunch", "snack", "dinner"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const plan: unknown = JSON.parse(response.text);
    if (!isGeneratedPlan(plan)) {
      throw new Error("Gemini returned an incomplete meal plan.");
    }

    const generatedAt = new Date();
    let persistenceWarning: string | undefined;

    try {
      const database = await getDatabase();
      const profile = await database.collection("userProfiles").insertOne({
        age,
        heightCm: height,
        weightKg: weight,
        fitnessGoal: goal,
        createdAt: generatedAt,
      });

      await database.collection("mealPlans").insertOne({
        userProfileId: profile.insertedId,
        breakfast: plan.breakfast,
        lunch: plan.lunch,
        snack: plan.snack,
        dinner: plan.dinner,
        generatedAt,
      });
    } catch (error) {
      console.error("Meal plan persistence failed:", error instanceof Error ? error.name : "Unknown error");
      persistenceWarning = "Your meal plan is ready, but it could not be saved right now.";
    }

    return Response.json({
      mealPlan: planAsText(plan),
      generatedAt: generatedAt.toISOString(),
      persistenceWarning,
    });
  } catch (error) {
    console.error("Meal plan generation error:", error);

    return Response.json(
      { error: "We could not generate your meal plan right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
