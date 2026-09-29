export type MealPeriod = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export type ChefMeal = {
  id: string;
  period: MealPeriod;
  name: string;
  description: string;
  calories: number;
  price: number;
};

export type HomeChef = {
  id: string;
  name: string;
  description: string;
  city: string;
  area: string;
  speciality: string;
  rating: number;
  monthlyStartingPrice: number;
  availableMealTypes: MealPeriod[];
  availability: "Available this week" | "Limited slots";
  meals: ChefMeal[];
};

// Prototype data only. These fields intentionally mirror a future `homeChefs`
// MongoDB collection so the UI can later read the same shape from the database.
export const homeChefs: HomeChef[] = [
  {
    id: "sana-khan",
    name: "Chef Sana Khan",
    description: "Wholesome desi meals with lighter cooking methods and familiar flavours.",
    city: "Lahore",
    area: "Johar Town",
    speciality: "Healthy Punjabi home cooking",
    rating: 4.9,
    monthlyStartingPrice: 14500,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Available this week",
    meals: [
      { id: "sana-breakfast", period: "Breakfast", name: "Besan chilla with mint raita", description: "Two gram-flour chillas with cucumber mint raita.", calories: 320, price: 280 },
      { id: "sana-lunch", period: "Lunch", name: "Chicken daal with brown rice", description: "Light chicken daal, brown rice and seasonal kachumber.", calories: 510, price: 520 },
      { id: "sana-snack", period: "Snack", name: "Roasted chana chaat", description: "Roasted chickpeas tossed with tomato, onion and lemon.", calories: 190, price: 170 },
      { id: "sana-dinner", period: "Dinner", name: "Palak chicken with chapati", description: "Home-style spinach chicken with one whole-wheat chapati.", calories: 460, price: 480 },
    ],
  },
  {
    id: "amina-rashid",
    name: "Chef Amina Rashid",
    description: "Comforting family recipes portioned for balanced everyday eating.",
    city: "Lahore",
    area: "Gulberg",
    speciality: "Protein-focused Pakistani meals",
    rating: 4.8,
    monthlyStartingPrice: 15800,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Limited slots",
    meals: [
      { id: "amina-breakfast", period: "Breakfast", name: "Anda paratha roll", description: "Egg, spinach and tomato roll in a lightly brushed whole-wheat paratha.", calories: 380, price: 310 },
      { id: "amina-lunch", period: "Lunch", name: "Keema matar with chapati", description: "Lean chicken keema, peas and two small chapatis.", calories: 540, price: 540 },
      { id: "amina-snack", period: "Snack", name: "Fruit and yogurt bowl", description: "Fresh seasonal fruit with plain yogurt and seeds.", calories: 220, price: 210 },
      { id: "amina-dinner", period: "Dinner", name: "Grilled fish tikka plate", description: "Grilled fish tikka, sautéed vegetables and lemon rice.", calories: 490, price: 590 },
    ],
  },
  {
    id: "maryam-ali",
    name: "Chef Maryam Ali",
    description: "Everyday Karachi flavours made with less oil and plenty of vegetables.",
    city: "Karachi",
    area: "DHA Phase 6",
    speciality: "Karachi coastal and desi cuisine",
    rating: 4.9,
    monthlyStartingPrice: 16500,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Available this week",
    meals: [
      { id: "maryam-breakfast", period: "Breakfast", name: "Masala oats with egg", description: "Vegetable masala oats topped with a boiled egg.", calories: 330, price: 290 },
      { id: "maryam-lunch", period: "Lunch", name: "Fish curry rice bowl", description: "Tangy fish curry, steamed rice and cucumber salad.", calories: 530, price: 560 },
      { id: "maryam-snack", period: "Snack", name: "Baked chicken samosa", description: "Two baked chicken samosas with tamarind chutney.", calories: 240, price: 220 },
      { id: "maryam-dinner", period: "Dinner", name: "Lauki chana daal", description: "Lauki chana daal with one chapati and salad.", calories: 410, price: 430 },
    ],
  },
  {
    id: "farah-naqvi",
    name: "Chef Farah Naqvi",
    description: "Simple Islamabad home cooking for busy routines and family-style dinners.",
    city: "Islamabad",
    area: "F-11",
    speciality: "Low-oil family meals",
    rating: 4.7,
    monthlyStartingPrice: 15000,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Available this week",
    meals: [
      { id: "farah-breakfast", period: "Breakfast", name: "Daliya with dates", description: "Warm milk daliya with dates and crushed almonds.", calories: 300, price: 260 },
      { id: "farah-lunch", period: "Lunch", name: "Rajma quinoa pulao", description: "Rajma and vegetable pulao with a cooling raita.", calories: 500, price: 490 },
      { id: "farah-snack", period: "Snack", name: "Hummus veggie cup", description: "Homemade hummus with carrot and cucumber sticks.", calories: 180, price: 200 },
      { id: "farah-dinner", period: "Dinner", name: "Chicken yakhni soup meal", description: "Chicken yakhni soup with a small whole-wheat roll.", calories: 390, price: 450 },
    ],
  },
  {
    id: "nida-aziz",
    name: "Chef Nida Aziz",
    description: "Budget-friendly homemade tiffins inspired by classic Punjabi kitchens.",
    city: "Lahore",
    area: "DHA Phase 4",
    speciality: "Value tiffins and vegetarian options",
    rating: 4.8,
    monthlyStartingPrice: 13200,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Available this week",
    meals: [
      { id: "nida-breakfast", period: "Breakfast", name: "Aloo egg bhurji toast", description: "Lightly spiced egg bhurji with potato and whole-wheat toast.", calories: 360, price: 270 },
      { id: "nida-lunch", period: "Lunch", name: "Daal chawal tiffin", description: "Moong daal, rice, salad and homemade achar.", calories: 480, price: 390 },
      { id: "nida-snack", period: "Snack", name: "Corn bhel cup", description: "Sweet corn, chickpeas, vegetables and lemon dressing.", calories: 200, price: 160 },
      { id: "nida-dinner", period: "Dinner", name: "Vegetable qorma with roti", description: "Seasonal vegetable qorma with two small chapatis.", calories: 430, price: 400 },
    ],
  },
  {
    id: "zoya-hassan",
    name: "Chef Zoya Hassan",
    description: "Thoughtful comfort food with options for balanced weight-management goals.",
    city: "Karachi",
    area: "Gulshan-e-Iqbal",
    speciality: "Balanced desi meal prep",
    rating: 4.6,
    monthlyStartingPrice: 14800,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Limited slots",
    meals: [
      { id: "zoya-breakfast", period: "Breakfast", name: "Chana shakshuka", description: "Chickpea and egg masala with one whole-wheat pita.", calories: 370, price: 320 },
      { id: "zoya-lunch", period: "Lunch", name: "Tandoori chicken bowl", description: "Tandoori chicken, herbed rice and crunchy salad.", calories: 520, price: 550 },
      { id: "zoya-snack", period: "Snack", name: "Date and nut ladoo", description: "Two naturally sweet date and nut bites.", calories: 210, price: 180 },
      { id: "zoya-dinner", period: "Dinner", name: "Karela chicken with roti", description: "Mild karela chicken with one chapati and salad.", calories: 440, price: 460 },
    ],
  },
  {
    id: "hiba-saeed",
    name: "Chef Hiba Saeed",
    description: "Fresh, practical meals that bring familiar Pakistani staples to weekday schedules.",
    city: "Islamabad",
    area: "Bahria Town",
    speciality: "Fresh seasonal home meals",
    rating: 4.7,
    monthlyStartingPrice: 14200,
    availableMealTypes: ["Breakfast", "Lunch", "Snack", "Dinner"],
    availability: "Available this week",
    meals: [
      { id: "hiba-breakfast", period: "Breakfast", name: "Paneer vegetable wrap", description: "Paneer, vegetables and green chutney in a whole-wheat wrap.", calories: 350, price: 300 },
      { id: "hiba-lunch", period: "Lunch", name: "Methi chicken with millet", description: "Methi chicken served with fluffy millet and salad.", calories: 510, price: 530 },
      { id: "hiba-snack", period: "Snack", name: "Spiced makhana mix", description: "Roasted makhana with peanuts and mild chaat masala.", calories: 170, price: 170 },
      { id: "hiba-dinner", period: "Dinner", name: "Masoor daal with sabzi", description: "Masoor daal, seasonal sabzi and one chapati.", calories: 420, price: 410 },
    ],
  },
];
