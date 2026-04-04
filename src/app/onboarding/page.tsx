"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/category-presets";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSelect(categoryId: string) {
    setSelected(categoryId);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryId }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setLoading(false);
        setSelected(null);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-xl font-bold text-secondary tracking-tight">
          BookMe
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-secondary mb-2 tracking-tight">
            What type of business is this?
          </h1>
          <p className="text-muted mb-8">
            We&apos;ll set up your services and hours automatically. You can change everything later.
          </p>

          {error && (
            <div className="bg-error-light text-error text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORY_LIST.map((cat) => {
              const isSelected = selected === cat.id;
              const isLoading = loading && isSelected;

              return (
                <button
                  key={cat.id}
                  onClick={() => !loading && handleSelect(cat.id)}
                  disabled={loading}
                  className={`card p-5 text-left flex flex-col gap-3 transition-all ${
                    isSelected
                      ? "ring-2 ring-primary bg-primary-light/30"
                      : "hover:shadow-md"
                  } ${loading && !isSelected ? "opacity-40" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${cat.color}`}>
                    {cat.label[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary text-sm leading-tight">
                      {cat.label}
                    </p>
                    {cat.services.length > 0 ? (
                      <p className="text-xs text-muted mt-1">
                        {cat.services.length} services pre-filled
                      </p>
                    ) : (
                      <p className="text-xs text-muted mt-1">
                        Start from scratch
                      </p>
                    )}
                  </div>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted text-center mt-8">
            Already set up?{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              Skip to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
