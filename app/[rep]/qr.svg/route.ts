import QRCode from "qrcode";
import { getFiberRep } from "@/lib/fiberReps";
import { getRepUrl } from "@/lib/site";

type RouteContext = {
  params: Promise<{
    rep: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { rep: repSlug } = await context.params;
  const rep = getFiberRep(repSlug);

  if (!rep) {
    return new Response("Unknown rep.", { status: 404 });
  }

  const targetUrl = getRepUrl(rep, request.url);
  const svg = await QRCode.toString(targetUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 8,
    color: {
      dark: "#07120f",
      light: "#ffffff",
    },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-QR-Target": targetUrl,
    },
  });
}
