"use client";

import { useMemo, useState } from "react";
import { FiberRepProfile, repPasscode } from "@/lib/fiberReps";

type EditableRep = Pick<
  FiberRepProfile,
  "name" | "fullName" | "role" | "city" | "phoneLabel" | "phoneHref" | "email" | "photoUrl" | "accent" | "tagline" | "heroHeadline" | "heroBody" | "heroNote" | "cardNote"
>;

const EDITABLE_FIELDS: Array<keyof EditableRep> = [
  "name",
  "fullName",
  "role",
  "city",
  "phoneLabel",
  "phoneHref",
  "email",
  "photoUrl",
  "accent",
  "tagline",
  "heroHeadline",
  "heroBody",
  "heroNote",
  "cardNote",
];

export default function RepEditor({ rep }: { rep: FiberRepProfile }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EditableRep>(() => buildDraft(rep));
  const expectedPasscode = useMemo(() => repPasscode(rep), [rep]);

  function unlock() {
    if (passcode.trim().toLowerCase() === expectedPasscode.toLowerCase()) {
      setUnlocked(true);
      setMessage("");
    } else {
      setMessage("Wrong passcode.");
    }
  }

  function update(field: keyof EditableRep, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/reps/${rep.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, rep: draft }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not save.");
      }

      setMessage(data.note || "Saved. If this was a GitHub save, Vercel should redeploy from the commit.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!unlocked) {
    return (
      <main className="editPage">
        <section className="editGate">
          <p className="hubEyebrow">Rep editor</p>
          <h1>{rep.name}</h1>
          <p>Enter the temporary passcode to edit this page.</p>
          <div className="editUnlock">
            <input value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder={`${rep.slug}69`} type="password" />
            <button type="button" onClick={unlock}>Unlock</button>
          </div>
          {message && <p className="editMessage">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="editPage">
      <section className="editPanel">
        <div className="editHeader">
          <div>
            <p className="hubEyebrow">Rep editor</p>
            <h1>{rep.name}</h1>
          </div>
          <a href={`/${rep.slug}`}>View page</a>
        </div>

        <div className="editGrid">
          <TextField label="Display name" value={draft.name} onChange={(value) => update("name", value)} />
          <TextField label="Full name" value={draft.fullName || ""} onChange={(value) => update("fullName", value)} />
          <TextField label="Role" value={draft.role || ""} onChange={(value) => update("role", value)} />
          <TextField label="City" value={draft.city || ""} onChange={(value) => update("city", value)} />
          <TextField label="Phone label" value={draft.phoneLabel || ""} onChange={(value) => update("phoneLabel", value)} placeholder="937-000-0000" />
          <TextField label="Phone digits" value={draft.phoneHref || ""} onChange={(value) => update("phoneHref", value)} placeholder="19370000000" />
          <TextField label="Email" value={draft.email || ""} onChange={(value) => update("email", value)} />
          <TextField label="Photo URL" value={draft.photoUrl || ""} onChange={(value) => update("photoUrl", value)} placeholder={`/reps/${rep.slug}.jpg`} />
          <label className="editField">
            <span>Accent color</span>
            <input value={draft.accent || "#1aa260"} onChange={(event) => update("accent", event.target.value)} type="color" />
          </label>
          <TextField label="Team-card tagline" value={draft.tagline || ""} onChange={(value) => update("tagline", value)} />
        </div>

        <label className="editField">
          <span>Headline</span>
          <input value={draft.heroHeadline || ""} onChange={(event) => update("heroHeadline", event.target.value)} />
        </label>
        <label className="editField">
          <span>Intro copy</span>
          <textarea value={draft.heroBody || ""} onChange={(event) => update("heroBody", event.target.value)} rows={4} />
        </label>
        <label className="editField">
          <span>Small note</span>
          <textarea value={draft.heroNote || ""} onChange={(event) => update("heroNote", event.target.value)} rows={3} />
        </label>
        <label className="editField">
          <span>Photo-card note</span>
          <textarea value={draft.cardNote || ""} onChange={(event) => update("cardNote", event.target.value)} rows={3} />
        </label>

        <div className="editActions">
          <button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <span>{message}</span>
        </div>
      </section>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="editField">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function buildDraft(rep: FiberRepProfile): EditableRep {
  return Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, rep[field] || ""])) as EditableRep;
}
