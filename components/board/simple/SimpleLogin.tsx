"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { chapterConfig, type ChapterId } from "@/lib/board/chapters";
import { api, setApiChapter } from "../util";

// The simple layout's sign-in: one password field and a full-width button,
// then the links to the other chapters' hubs.
export function SimpleLogin({ chapter }: { chapter: ChapterId }) {
  const config = chapterConfig(chapter);
  setApiChapter(chapter);
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
    <div className="sb">
      <main className="gate">
        <p className="brand">
          VINdicated <span>/ {config.simple?.brand ?? config.loginSub}</span>
        </p>
        <h1>Sign in</h1>
        <p className="muted">{config.simple?.loginHelp ?? `Ask ${config.contact} for the board password.`}</p>
        <form onSubmit={submit} noValidate>
          <label className="f" htmlFor="board-password">
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
          <button className="b full" type="submit" disabled={busy}>
            {busy ? "Checking…" : "Sign in"}
          </button>
          {error && (
            <p className="err" role="alert" style={{ marginTop: 12 }}>
              {error}
            </p>
          )}
        </form>
        <div className="chuz">
          <p>{config.otherHub.prompt}</p>
          <div className="row-btns">
            {config.otherHub.links.map((l) => (
              <a key={l.path} className="b soft" href={l.path}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
