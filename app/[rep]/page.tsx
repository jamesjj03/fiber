import { notFound, redirect } from "next/navigation";
import FiberPage from "@/components/FiberPage";
import { getFiberRep, getFiberRepStaticParams } from "@/lib/fiberReps";

type PageProps = {
  params: Promise<{
    rep: string;
  }>;
};

export function generateStaticParams() {
  return getFiberRepStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { rep: repSlug } = await params;
  const rep = getFiberRep(repSlug);

  if (!rep) {
    return {
      title: "Fiber Rep | The Fiber Crew",
    };
  }

  return {
    title: `${rep.name} | The Fiber Crew`,
    description: `Compare Kinetic and Frontier fiber with ${rep.name}, a personal fiber rep based around Dayton, Ohio.`,
  };
}

export default async function RepPage({ params }: PageProps) {
  const { rep: repSlug } = await params;
  const rep = getFiberRep(repSlug);

  if (!rep) {
    notFound();
  }

  if (rep.redirectUrl) {
    redirect(rep.redirectUrl);
  }

  return <FiberPage rep={rep} />;
}
