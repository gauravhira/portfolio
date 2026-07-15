"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OpsLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/ops/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
      <div className="w-full max-w-[360px] bg-white border border-black/[0.08] rounded-2xl px-9 py-10">
        <h1 className="font-serif text-xl text-[var(--navy)] mb-6">Ops</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            autoFocus
            className="w-full rounded-xl bg-black/[0.03] border border-black/[0.15] px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)] box-border"
          />
          {error && <p className="text-red-600 text-[13px] mt-2.5">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[var(--navy)] text-white font-semibold text-sm py-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
