import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { FiberRepProfile, repPasscode } from "@/lib/fiberReps";

type RouteContext = {
  params: Promise<{
    rep: string;
  }>;
};

const EDITABLE_FIELDS: Array<keyof FiberRepProfile> = [
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

export async function POST(request: Request, context: RouteContext) {
  try {
    const { rep: slug } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reps = await readReps();
    const index = reps.findIndex((rep) => rep.slug === slug);
    const current = reps[index];

    if (!current) {
      return NextResponse.json({ error: "Unknown rep." }, { status: 404 });
    }

    if (current.redirectUrl) {
      return NextResponse.json({ error: "This rep redirects to an external page." }, { status: 400 });
    }

    if (String(body.passcode || "").trim().toLowerCase() !== repPasscode(current).toLowerCase()) {
      return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
    }

    const patch = sanitizeRepPatch(body.rep || {});
    reps[index] = {
      ...current,
      ...patch,
      slug: current.slug,
      redirectUrl: current.redirectUrl,
    };

    const content = `${JSON.stringify(reps, null, 2)}\n`;
    const githubResult = await saveToGithub(content);
    const localResult = await saveLocally(content);

    if (!githubResult.saved && !localResult.saved) {
      throw new Error(localResult.error || githubResult.error || "Could not save reps.");
    }

    return NextResponse.json({
      saved: true,
      target: githubResult.saved ? "github" : "local",
      note: githubResult.saved
        ? "Saved to GitHub. Vercel should redeploy from the commit."
        : "Saved locally. On Vercel, add GitHub env vars for live saves.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save rep." },
      { status: 500 },
    );
  }
}

async function readReps() {
  const repsPath = path.join(process.cwd(), "data", "reps.json");
  return JSON.parse(await readFile(repsPath, "utf8")) as FiberRepProfile[];
}

async function saveLocally(content: string) {
  try {
    const repsPath = path.join(process.cwd(), "data", "reps.json");
    await writeFile(repsPath, content, "utf8");
    return { saved: true };
  } catch (error) {
    return {
      saved: false,
      error: error instanceof Error ? error.message : "Local save failed.",
    };
  }
}

async function saveToGithub(content: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    return { saved: false, error: "GitHub saving is not configured." };
  }

  try {
    const apiPath = "data/reps.json";
    const current = await fetch(`https://api.github.com/repos/${repo}/contents/${apiPath}?ref=${encodeURIComponent(branch)}`, {
      headers: githubHeaders(token),
    });
    const currentData = current.ok ? await current.json() : null;
    const updated = await fetch(`https://api.github.com/repos/${repo}/contents/${apiPath}`, {
      method: "PUT",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update rep profiles (${new Date().toISOString().slice(0, 10)})`,
        branch,
        sha: currentData?.sha,
        content: Buffer.from(content, "utf8").toString("base64"),
      }),
    });

    if (!updated.ok) {
      const error = await updated.json().catch(() => ({}));
      throw new Error(error.message || "GitHub save failed.");
    }

    return { saved: true };
  } catch (error) {
    return {
      saved: false,
      error: error instanceof Error ? error.message : "GitHub save failed.",
    };
  }
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function sanitizeRepPatch(value: unknown) {
  const source = value && typeof value === "object" ? value as Partial<FiberRepProfile> : {};

  return Object.fromEntries(
    EDITABLE_FIELDS.map((field) => [field, typeof source[field] === "string" ? String(source[field]).trim() : ""]),
  ) as Partial<FiberRepProfile>;
}
