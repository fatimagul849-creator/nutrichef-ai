"use client";

import Link from "next/link";
import { useState } from "react";

interface MealCardData {
  id: string;
  step: number;
  label: string;
  defaultTime: string;
  icon: string;
  theme: {
    badge: string;
    border: string;
    bg: string;
    headerBg: string;
    itemBg: string;
    tipBg: string;
    tipBorder: string;
    tipText: string;
    accentText: string;
  };
  mealName: string;
  items: string[];
  nutritionTip: string;
}

const MEAL_CONFIGS: Record<
  "breakfast" | "lunch" | "snack" | "dinner",
  {
    step: number;
    label: string;
    defaultTime: string;
    icon: string;
    theme: MealCardData["theme"];
  }
> = {
  breakfast: {
    step: 1,
    label: "Breakfast",
    defaultTime: "8:00 AM – 10:00 AM",
    icon: "🌅",
    theme: {
      badge: "bg-amber-100 text-amber-900 border-amber-300/80",
      border: "border-amber-200/90 hover:border-amber-300",
      bg: "bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30",
      headerBg: "bg-amber-100/60 text-amber-950",
      itemBg: "bg-white text-stone-800 border-amber-200/60 shadow-sm",
      tipBg: "bg-amber-50/80",
      tipBorder: "border-amber-200",
      tipText: "text-amber-950",
      accentText: "text-amber-900",
    },
  },
  lunch: {
    step: 2,
    label: "Lunch",
    defaultTime: "1:00 PM – 2:30 PM",
    icon: "🥗",
    theme: {
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300/80",
      border: "border-emerald-200/90 hover:border-emerald-300",
      bg: "bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30",
      headerBg: "bg-emerald-100/60 text-emerald-950",
      itemBg: "bg-white text-stone-800 border-emerald-200/60 shadow-sm",
      tipBg: "bg-emerald-50/80",
      tipBorder: "border-emerald-200",
      tipText: "text-emerald-950",
      accentText: "text-emerald-900",
    },
  },
  snack: {
    step: 3,
    label: "Snack",
    defaultTime: "4:30 PM – 5:30 PM",
    icon: "🍏",
    theme: {
      badge: "bg-teal-100 text-teal-900 border-teal-300/80",
      border: "border-teal-200/90 hover:border-teal-300",
      bg: "bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/30",
      headerBg: "bg-teal-100/60 text-teal-950",
      itemBg: "bg-white text-stone-800 border-teal-200/60 shadow-sm",
      tipBg: "bg-teal-50/80",
      tipBorder: "border-teal-200",
      tipText: "text-teal-950",
      accentText: "text-teal-900",
    },
  },
  dinner: {
    step: 4,
    label: "Dinner",
    defaultTime: "7:30 PM – 9:00 PM",
    icon: "🍲",
    theme: {
      badge: "bg-indigo-100 text-indigo-900 border-indigo-300/80",
      border: "border-indigo-200/90 hover:border-indigo-300",
      bg: "bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30",
      headerBg: "bg-indigo-100/60 text-indigo-950",
      itemBg: "bg-white text-stone-800 border-indigo-200/60 shadow-sm",
      tipBg: "bg-indigo-50/80",
      tipBorder: "border-indigo-200",
      tipText: "text-indigo-950",
      accentText: "text-indigo-900",
    },
  },
};

function splitFoodItems(str: string): string[] {
  const clean = str
    .replace(/^(?:meal|items?|food|dish)[:\s-]*/i, "")
    .replace(/^[0-9]+[\.\)]\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .trim();

  const parts = clean
    .split(/\s+(?:and|with|served with|\+)\s+|[;,]/i)
    .map((item) =>
      item
        .trim()
        .replace(/^[-*•]\s*/, "")
        .replace(/\.$/, "")
    )
    .filter((item) => item.length > 1 && !/^(a|an|the)$/i.test(item));

  return parts.length > 0 ? parts : [clean];
}

function parseMealPlan(rawText: string): MealCardData[] {
  if (!rawText) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: Record<"breakfast" | "lunch" | "snack" | "dinner", string[]> = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  };

  let currentKey: "breakfast" | "lunch" | "snack" | "dinner" | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (/^(?:1\.?\s*)?breakfast[:\s-]*/i.test(lower)) {
      currentKey = "breakfast";
      const rest = line.replace(/^(?:1\.?\s*)?breakfast[:\s-]*/i, "").trim();
      if (rest) sections.breakfast.push(rest);
    } else if (/^(?:2\.?\s*)?lunch[:\s-]*/i.test(lower)) {
      currentKey = "lunch";
      const rest = line.replace(/^(?:2\.?\s*)?lunch[:\s-]*/i, "").trim();
      if (rest) sections.lunch.push(rest);
    } else if (/^(?:3\.?\s*)?(?:afternoon\s+)?snack[:\s-]*/i.test(lower)) {
      currentKey = "snack";
      const rest = line.replace(/^(?:3\.?\s*)?(?:afternoon\s+)?snack[:\s-]*/i, "").trim();
      if (rest) sections.snack.push(rest);
    } else if (/^(?:4\.?\s*)?dinner[:\s-]*/i.test(lower)) {
      currentKey = "dinner";
      const rest = line.replace(/^(?:4\.?\s*)?dinner[:\s-]*/i, "").trim();
      if (rest) sections.dinner.push(rest);
    } else if (currentKey) {
      sections[currentKey].push(line);
    }
  }

  const cards: MealCardData[] = [];
  const keys: Array<"breakfast" | "lunch" | "snack" | "dinner"> = [
    "breakfast",
    "lunch",
    "snack",
    "dinner",
  ];

  for (const key of keys) {
    const rawLines = sections[key];
    const config = MEAL_CONFIGS[key];

    if (!rawLines || rawLines.length === 0) continue;

    const mealName = rawLines[0].replace(/^(?:meal|dish)[:\s-]*/i, "").trim();
    let nutritionTip = "";
    const items: string[] = [];

    if (rawLines.length > 1) {
      const remaining = rawLines.slice(1);
      const tipLines: string[] = [];
      const itemCandidates: string[] = [];

      for (const l of remaining) {
        if (
          /^(?:explanation|why\s*(?:this\s*)?(?:helps)?|nutrition\s*tip|benefit|tip)[:\s-]*/i.test(
            l
          ) ||
          /\b(provides|helps|rich in|fuels|promotes|supports|great for|gives you|healthy fat|fiber|protein|digest|muscle)\b/i.test(
            l
          )
        ) {
          tipLines.push(
            l
              .replace(
                /^(?:explanation|why\s*(?:this\s*)?(?:helps)?|nutrition\s*tip|benefit|tip)[:\s-]*/i,
                ""
              )
              .trim()
          );
        } else {
          itemCandidates.push(l);
        }
      }

      if (tipLines.length > 0) {
        nutritionTip = tipLines.join(" ");
      } else if (itemCandidates.length > 0) {
        nutritionTip = itemCandidates.pop() || "";
      }

      for (const candidate of itemCandidates) {
        items.push(...splitFoodItems(candidate));
      }
    }

    if (items.length === 0 && mealName) {
      items.push(...splitFoodItems(mealName));
    }

    cards.push({
      id: key,
      step: config.step,
      label: config.label,
      defaultTime: config.defaultTime,
      icon: config.icon,
      theme: config.theme,
      mealName: mealName || `${config.label} Healthy Selection`,
      items: items.length > 0 ? items : [mealName || "Balanced home-cooked portion"],
      nutritionTip:
        nutritionTip ||
        "Provides sustained energy, essential micronutrients, and supports your personal fitness goal.",
    });
  }

  return cards;
}

export default function Home() {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [showPlan, setShowPlan] = useState(false);
  const [mealPlan, setMealPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [persistenceWarning, setPersistenceWarning] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  async function generateMealPlan() {
    const ageNumber = Number(age);
    const heightNumber = Number(height);
    const weightNumber = Number(weight);

    if (!ageNumber || !heightNumber || !weightNumber || !goal) {
      setErrorMessage("Please fill in your age, height, weight, and select a fitness goal.");
      return;
    }

    if (ageNumber < 13 || ageNumber > 120 || heightNumber < 90 || heightNumber > 250 || weightNumber < 25 || weightNumber > 300) {
      setErrorMessage("Please enter realistic values for age, height, and weight.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setPersistenceWarning("");
    setShowPlan(false);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: ageNumber,
          height: heightNumber,
          weight: weightNumber,
          goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate meal plan.");
      }

      setMealPlan(data.mealPlan || "No meal plan was returned. Please try again.");
      setPersistenceWarning(data.persistenceWarning || "");
      setShowPlan(true);

      // Smoothly scroll down to the generated plan
      setTimeout(() => {
        const planSection = document.getElementById("meal-plan-section");
        if (planSection) {
          planSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "We could not generate your meal plan. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate BMI for the user summary
  const hMeters = parseFloat(height) / 100;
  const wKg = parseFloat(weight);
  const bmiValue = hMeters > 0 && wKg > 0 ? (wKg / (hMeters * hMeters)).toFixed(1) : null;
  let bmiLabel = "";
  if (bmiValue) {
    const num = parseFloat(bmiValue);
    if (num < 18.5) bmiLabel = "Underweight";
    else if (num < 25) bmiLabel = "Normal Weight";
    else if (num < 30) bmiLabel = "Overweight";
    else bmiLabel = "Higher BMI";
  }

  const mealCards = parseMealPlan(mealPlan);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-stone-50/50 to-emerald-50/30 px-4 py-8 sm:px-6 sm:py-12 text-stone-800 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        {!isStarted ? (
          /* Welcome / Landing Screen */
          <div className="py-10 sm:py-16 text-center">
            {/* Tag Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-100/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs">
              <span>🌿</span>
              <span>NutriChef AI • Smart Nutrition System</span>
            </div>

            {/* Brand Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-emerald-950">
              NutriChef AI
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-xl sm:text-2xl font-bold text-emerald-700">
              Your Personalized Healthy Meal Companion
            </p>

            {/* Short Line */}
            <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
              Get a customized daily meal plan based on your age, body measurements, and fitness goal.
            </p>

            {/* How It Works Section */}
            <div className="mt-10 sm:mt-14 max-w-3xl mx-auto text-left">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-2xs">
                  <span>✨</span> Simple 3-Step Process
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-3 tracking-tight">
                  How It Works
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-stretch">
                {/* Step 1 */}
                <div className="flex flex-col justify-between h-full rounded-2xl border border-emerald-100/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                        1
                      </span>
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">
                      Enter Your Details
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Add your age, height, weight, and fitness goal.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col justify-between h-full rounded-2xl border border-emerald-100/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                        2
                      </span>
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">
                      AI Creates Your Plan
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      NutriChef AI generates a personalized daily meal plan.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col justify-between h-full rounded-2xl border border-emerald-100/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                        3
                      </span>
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">
                      Follow Your Daily Meals
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      View your breakfast, lunch, snack, and dinner sequence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="mt-10 sm:mt-12">
              <button
                type="button"
                onClick={() => setIsStarted(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] px-8 py-4 text-base sm:text-lg font-bold text-white shadow-xl shadow-emerald-700/25 transition-all duration-200 cursor-pointer"
              >
                <span>Get Started</span>
                <span className="text-xl">→</span>
              </button>
              <div className="mt-4">
                <Link
                  href="/home-chefs"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                >
                  Browse local home chefs
                </Link>
              </div>
              <p className="text-xs text-stone-400 mt-3 font-medium">
                No sign-up required • Instant AI routine
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Top Navigation Bar: Back to Welcome */}
            <div className="mb-6 flex items-center justify-between print:hidden">
              <button
                type="button"
                onClick={() => setIsStarted(false)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
              >
                <span>←</span>
                <span>Back to Home</span>
              </button>
              <span className="text-xs text-stone-400 font-medium">Personalized Planner</span>
            </div>

            {/* Brand Header */}
            <header className="mb-8 sm:mb-10 text-center print:hidden">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-100/70 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 shadow-sm">
                <span>🌿</span>
                <span>NutriChef AI • Smart Nutrition System</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-emerald-950">
                NutriChef AI
              </h1>

              <p className="mt-2.5 sm:mt-3 text-base sm:text-lg text-stone-600 max-w-xl mx-auto">
                Personalized, balanced, and budget-friendly home-cooked meal sequences designed for your wellness goals.
              </p>
            </header>

            {/* Input Form Card */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-950/5 transition-all print:hidden">
          <div className="mb-6 border-b border-stone-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Create Your Personalized Meal Plan
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Enter your physical profile to generate an aligned daily routine.
            </p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* Age */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-stone-700">
                Age <span className="text-stone-400 font-normal">(years)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                min="13"
                max="120"
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
              />
            </div>

            {/* Height */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-stone-700">
                Height <span className="text-stone-400 font-normal">(cm)</span>
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                min="90"
                max="250"
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-stone-700">
                Weight <span className="text-stone-400 font-normal">(kg)</span>
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                min="25"
                max="300"
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-stone-700">
                Fitness Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
                required
              >
                <option value="">Select your target goal</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Maintain Weight">Maintain Weight</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-sm text-rose-800">Please Note:</p>
                <p className="mt-0.5 text-xs sm:text-sm text-rose-700 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {persistenceWarning && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs sm:text-sm text-amber-900" role="status">
              {persistenceWarning}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={generateMealPlan}
            className={`w-full rounded-2xl py-4 px-6 text-base sm:text-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? "cursor-not-allowed bg-emerald-400 shadow-emerald-400/20"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-700/20 hover:shadow-emerald-700/30"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Generating Your Daily Routine... ⏳</span>
              </>
            ) : (
              <>
                <span>Generate My Meal Plan 🤖</span>
              </>
            )}
          </button>
        </div>

        {/* Meal Plan Results Section */}
        {showPlan && (
          <section
            id="meal-plan-section"
            className="mt-10 sm:mt-12 space-y-6 transition-all duration-300 print:mt-0 print:space-y-4"
          >
            {/* Print-Only Header */}
            <div className="hidden print:block text-center border-b border-stone-300 pb-4 mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                🌿 NutriChef AI • Smart Nutrition System
              </div>
              <h1 className="text-2xl font-black text-emerald-950 mt-1">
                Personalized Daily Meal Plan
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Target Goal: {goal} • Home-Cooked & Budget-Friendly Daily Routine
              </p>
            </div>

            {/* User Profile Summary Card */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-md shadow-emerald-950/5 print:border-stone-300 print:shadow-none">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <span>🎉</span> Personalized Plan Ready
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                    Your Tailored Daily Schedule
                  </h2>
                </div>

                <div className="inline-flex items-center self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
                  Target: {goal}
                </div>
              </div>

              {/* Physical Profile Badges */}
              <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3.5 py-1.5 text-stone-700">
                  <span className="text-stone-400 font-medium">Age:</span>{" "}
                  <strong>{age} yrs</strong>
                </div>
                <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3.5 py-1.5 text-stone-700">
                  <span className="text-stone-400 font-medium">Height:</span>{" "}
                  <strong>{height} cm</strong>
                </div>
                <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3.5 py-1.5 text-stone-700">
                  <span className="text-stone-400 font-medium">Weight:</span>{" "}
                  <strong>{weight} kg</strong>
                </div>
                {bmiValue && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 text-emerald-900">
                    <span className="text-emerald-700 font-medium">BMI:</span>{" "}
                    <strong>{bmiValue}</strong> ({bmiLabel})
                  </div>
                )}
              </div>
            </div>

            {/* Sequence Title */}
            <div className="pt-2 px-1">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                <span>🍽️</span> Daily Meal Sequence
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Structured in sequential courses to keep your metabolism active and cravings balanced.
              </p>
            </div>

            {/* Daily Cards Sequence */}
            {mealCards.length > 0 ? (
              <div className="space-y-5">
                {mealCards.map((card) => (
                  <article
                    key={card.id}
                    className={`rounded-3xl border ${card.theme.border} ${card.theme.bg} p-5 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md print:break-inside-avoid print:shadow-none print:border-stone-300 print:p-5`}
                  >
                    {/* Card Header: Step, Meal Label & Time Window */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/50 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{card.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                              Course {card.step} of 4
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${card.theme.badge}`}
                            >
                              {card.label}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-extrabold text-stone-900 mt-0.5">
                            {card.mealName}
                          </h4>
                        </div>
                      </div>

                      {/* Suggested Time Window */}
                      <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs">
                        <span>⏰</span>
                        <span>{card.defaultTime}</span>
                      </div>
                    </div>

                    {/* Food Items with Quantities */}
                    <div className="mb-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
                        <span>📋</span> Included Items & Quantities
                      </h5>

                      <div className="flex flex-wrap gap-2">
                        {card.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl border px-3 py-1.5 text-xs sm:text-sm font-medium ${card.theme.itemBg} flex items-center gap-1.5`}
                          >
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Tip / Why This Helps */}
                    <div
                      className={`rounded-2xl border ${card.theme.tipBorder} ${card.theme.tipBg} p-4 mt-4`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg">💡</span>
                        <div>
                          <h6
                            className={`text-xs font-bold uppercase tracking-wider ${card.theme.tipText} mb-0.5`}
                          >
                            Why This Helps & Nutritional Tip
                          </h6>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${card.theme.tipText} opacity-90`}
                          >
                            {card.nutritionTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Fallback view if output structure is unsegmented */
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h4 className="font-bold text-stone-900 text-lg mb-4">
                  Today&apos;s Recommended Plan
                </h4>
                <div className="space-y-3 text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {mealPlan}
                </div>
              </div>
            )}

            {/* Daily Wellness Recommendations Footer */}
            <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70 p-5 sm:p-6 shadow-xs text-stone-800">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2 mb-3">
                <span>🌟</span> Healthy Daily Habits for Pakistan Climate & Lifestyle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-white/80 p-3 border border-emerald-100 shadow-2xs">
                  <p className="font-bold text-emerald-900">💧 Hydration</p>
                  <p className="text-stone-600 mt-1">
                    Drink at least 8–10 glasses of water throughout the day.
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 border border-emerald-100 shadow-2xs">
                  <p className="font-bold text-emerald-900">🚶 Post-Meal Walk</p>
                  <p className="text-stone-600 mt-1">
                    A gentle 10–15 min stroll after lunch and dinner helps insulin sensitivity.
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 border border-emerald-100 shadow-2xs">
                  <p className="font-bold text-emerald-900">😴 Sleep & Digestion</p>
                  <p className="text-stone-600 mt-1">
                    Allow at least 2 hours between dinner and bedtime for optimal recovery.
                  </p>
                </div>
              </div>

              {/* Adjust plan button */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/80 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs hover:bg-emerald-50 transition"
                >
                  <span>✏️</span>
                  <span>Adjust Your Details & Regenerate</span>
                </button>
              </div>
            </div>
          </section>
        )}
          </div>
        )}
      </div>
    </main>
  );
}
