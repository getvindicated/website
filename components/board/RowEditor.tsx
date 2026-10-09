"use client";

import { useId, useState, type FormEvent } from "react";
import { api } from "./util";
import { useBoard } from "./BoardApp";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "url" | "email" | "tel" | "select" | "checkbox" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  // Fields sharing a `pair` value sit side by side.
  pair?: string;
};

type Values = Record<string, string | number | boolean | null>;

// Add/edit form for one row of an editable /board table. Saves through
// /api/board/<table>[/<id>] and refreshes the page data.
export function RowEditor({
  title,
  table,
  id,
  fields,
  initial,
  onClose,
  onSaved,
}: {
  title: string;
  table: string;
  id?: number;
  fields: FieldDef[];
  initial: Values;
  onClose: () => void;
  onSaved?: (values: Values) => void;
}) {
  const { refresh } = useBoard();
  const uid = useId();
  const [values, setValues] = useState<Values>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: string, v: Values[string]) => setValues((x) => ({ ...x, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await api(id ? `/api/board/${table}/${id}` : `/api/board/${table}`, id ? "PATCH" : "POST", values);
    setBusy(false);
    if (err) return setError(err);
    refresh();
    onSaved?.(values);
    onClose();
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    const err = await api(`/api/board/${table}/${id}`, "DELETE");
    setBusy(false);
    if (err) return setError(err);
    refresh();
    onClose();
  }

  const input = (f: FieldDef) => {
    const fid = `${uid}-${f.key}`;
    const v = values[f.key];
    if (f.type === "checkbox") {
      return (
        <label key={f.key} className="check" htmlFor={fid}>
          <input id={fid} type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />
          {f.label}
        </label>
      );
    }
    let control;
    if (f.type === "textarea") {
      control = (
        <textarea id={fid} value={String(v ?? "")} placeholder={f.placeholder} style={{ minHeight: 80 }} onChange={(e) => set(f.key, e.target.value)} />
      );
    } else if (f.type === "select") {
      control = (
        <select id={fid} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)}>
          {f.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    } else if (f.type === "number") {
      control = (
        <input id={fid} type="number" value={v === null || v === undefined ? "" : String(v)} onChange={(e) => set(f.key, e.target.value === "" ? null : Number(e.target.value))} />
      );
    } else {
      control = (
        <input id={fid} type={f.type ?? "text"} value={String(v ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
      );
    }
    return (
      <label key={f.key} htmlFor={fid}>
        {f.label}
        {control}
      </label>
    );
  };

  // Group paired fields into two-column rows.
  const rows: FieldDef[][] = [];
  for (const f of fields) {
    const last = rows[rows.length - 1];
    if (f.pair && last && last[0].pair === f.pair) last.push(f);
    else rows.push([f]);
  }

  return (
    <div className="card">
      <h3>{title}</h3>
      <form className="stack wide" onSubmit={save} noValidate>
        {rows.map((r) =>
          r.length > 1 ? (
            <div className="pair" key={r[0].key}>
              {r.map(input)}
            </div>
          ) : (
            input(r[0])
          ),
        )}
        <div className="bar" style={{ margin: 0 }}>
          <button className="btn" type="submit" disabled={busy}>
            Save
          </button>
          <button className="chip" type="button" onClick={onClose}>
            Cancel
          </button>
          {id && (
            <button className="chip" type="button" onClick={remove} disabled={busy} style={{ marginLeft: "auto" }}>
              {confirmDelete ? "Click again to delete" : "Delete"}
            </button>
          )}
        </div>
        {error && <p className="msg err" role="alert">{error}</p>}
      </form>
    </div>
  );
}
