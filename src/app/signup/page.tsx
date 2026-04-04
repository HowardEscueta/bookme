"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get("email") as string,
      password: form.get("password") as string,
      name: form.get("name") as string,
      businessName: form.get("businessName") as string,
      slug: form.get("slug") as string,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setError(json.error || "Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-xl font-bold text-secondary tracking-tight">
          BookMe
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-secondary mb-2 tracking-tight">
            Create your page
          </h1>
          <p className="text-muted mb-8">
            Takes about 2 minutes. Free forever to start.
          </p>

          {error && (
            <div className="bg-error-light text-error text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-secondary mb-2">
                Business name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                placeholder="Juan's Barbershop"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-secondary mb-2">
                Your booking link
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-bg-soft border border-r-0 border-border rounded-l-xl text-sm text-muted">
                  bookme.ph/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  placeholder="juanbarber"
                  pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
                  minLength={3}
                  className="flex-1 px-4 py-3 rounded-r-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted mt-1.5">
                Lowercase letters, numbers, and hyphens
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-hover disabled:opacity-50 shadow-sm mt-1"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
