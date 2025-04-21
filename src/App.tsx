
import React, { useRef, useState, useEffect } from "react";

type Meal = {
  id: string;
  imageUrl: string;
  calories: number;
  createdAt: string;
};

const LOCAL_STORAGE_KEY = "meal-tracker-meals-v1";

// Utility to persist and load meals
function usePersistentMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) setMeals(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meals));
  }, [meals]);
  return [meals, setMeals] as const;
}

function getRandomCalories() {
  // Simulate AI calorie detection
  return Math.floor(Math.random() * 600) + 200;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const accent = "from-green-400 to-lime-300";
const cardBg = "bg-white/90 dark:bg-zinc-900/80";
const border = "border border-green-100 dark:border-zinc-800";
const shadow = "shadow-xl shadow-green-100/40 dark:shadow-zinc-900/40";

export default function App() {
  const [meals, setMeals] = usePersistentMeals();
  const [uploading, setUploading] = useState(false);
  const [aiDetecting, setAIDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Handle photo upload
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setUploading(true);
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(false);
      setAIDetecting(true);
      // Simulate AI detection delay
      setTimeout(() => {
        const calories = getRandomCalories();
        const meal: Meal = {
          id: Date.now() + Math.random().toString(36),
          imageUrl: reader.result as string,
          calories,
          createdAt: new Date().toISOString(),
        };
        setMeals((prev) => [meal, ...prev]);
        setAIDetecting(false);
      }, 1200);
    };
    reader.onerror = () => {
      setUploading(false);
      setError("Failed to read image.");
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be uploaded again
    e.target.value = "";
  };

  // Remove meal
  const removeMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-lime-50 to-green-100 dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-500">
      <div
        className={`w-full max-w-md mt-10 mb-6 rounded-3xl p-8 ${cardBg} ${border} ${shadow} flex flex-col items-center`}
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-500 to-lime-500 bg-clip-text text-transparent mb-2 tracking-tight">
          AI Meal Tracker
        </h1>
        <p className="text-zinc-500 dark:text-zinc-300 mb-6 text-sm">
          Snap a photo of your meal and let AI (well, a friendly robot for now) estimate the calories!
        </p>
        <button
          className={`relative w-40 h-40 rounded-2xl border-2 border-dashed border-green-300 dark:border-lime-700 bg-gradient-to-br ${accent} flex items-center justify-center transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md`}
          onClick={() => fileInput.current?.click()}
          disabled={uploading || aiDetecting}
          aria-label="Upload meal photo"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="mt-2 text-green-700 font-medium">Uploading...</span>
            </div>
          ) : aiDetecting ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-lime-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="mt-2 text-lime-700 font-medium">Detecting calories...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg
                className="w-14 h-14 text-green-600 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v8.25M3 16.5A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5M3 16.5l4.72-4.72a2.25 2.25 0 013.18 0l.8.8a2.25 2.25 0 003.18 0l4.72-4.72"
                />
              </svg>
              <span className="text-green-700 font-semibold">Upload Meal Photo</span>
              <span className="text-xs text-green-500 mt-1">JPG, PNG, or GIF</span>
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
            disabled={uploading || aiDetecting}
          />
        </button>
        {error && (
          <div className="mt-4 text-red-600 text-sm font-medium">{error}</div>
        )}
      </div>
      <div className="w-full max-w-md">
        {meals.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl p-8 ${cardBg} ${border} ${shadow} mb-8`}
            style={{ minHeight: 180 }}
          >
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
              alt="Empty plate"
              className="w-24 h-24 object-cover rounded-full mb-4 opacity-80"
            />
            <div className="text-lg font-semibold text-zinc-500 dark:text-zinc-300 mb-1">
              No meals logged yet!
            </div>
            <div className="text-sm text-zinc-400">
              Upload your first meal photo to get started.
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center gap-4 rounded-2xl p-4 ${cardBg} ${border} ${shadow} transition hover:scale-[1.01]`}
              >
                <img
                  src={meal.imageUrl}
                  alt="Meal"
                  className="w-16 h-16 object-cover rounded-xl border border-green-200 shadow"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="text-lg font-bold text-green-700 dark:text-lime-300">
                    {meal.calories} kcal
                  </div>
                  <div className="text-xs text-zinc-400">{formatDate(meal.createdAt)}</div>
                </div>
                <button
                  className="ml-2 p-2 rounded-full hover:bg-red-50 dark:hover:bg-zinc-800 transition"
                  title="Delete meal"
                  onClick={() => removeMeal(meal.id)}
                  aria-label="Delete meal"
                >
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="text-xs text-zinc-400 mb-4">
        &copy; {new Date().getFullYear()} AI Meal Tracker &mdash; Powered by Blink
      </footer>
    </div>
  );
}