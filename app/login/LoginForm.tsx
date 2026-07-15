"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminTypography } from "../admin/theme";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setPending(false);
      setError("Wrong password");
      return;
    }

    // Replace so the back button doesn't return to the login form.
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
          style={adminTypography.input}
        />
      </div>

      {error && (
        <span style={{ ...adminTypography.label, color: "#a24b3f" }}>{error}</span>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit uppercase"
        style={adminTypography.buttonPrimary}
      >
        {pending ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
