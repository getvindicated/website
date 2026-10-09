"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "./util";

export function BoardLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password) return setError("Enter the board password.");
    setBusy(true);
    setError("");
    const err = await api("/api/board/login", "POST", { password });
    setBusy(false);
    if (err) return setError(err);
    router.refresh();
  }

  return (
    <main className="wrap">
      <h1>VINDICATED</h1>
      <p className="sub">UC Berkeley chapter board</p>
      <form className="stack login" onSubmit={submit} noValidate>
        <label htmlFor="board-password">
          Board password
          <input
            id="board-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Open the board"}
        </button>
        {error && (
          <p className="msg err" role="alert">
            {error}
          </p>
        )}
        <p>Ask Rana if you need the password.</p>
      </form>
    </main>
  );
}
