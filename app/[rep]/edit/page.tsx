import { notFound, redirect } from "next/navigation";
import RepEditor from "@/components/RepEditor";
import { getEditStaticParams, getFiberRep } from "@/lib/fiberReps";

type PageProps = {
  params: Promise<{
    rep: string;
  }>;
};

export function generateStaticParams() {
  return getEditStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { rep: repSlug } = await params;
  const rep = getFiberRep(repSlug);

  return {
    title: rep ? `Edit ${rep.name} | The Fiber Crew` : "Rep Editor | The Fiber Crew",
  };
}

export default async function EditRepPage({ params }: PageProps) {
  const { rep: repSlug } = await params;
  const rep = getFiberRep(repSlug);

  if (!rep) {
    notFound();
  }

  if (rep.redirectUrl) {
    redirect(rep.redirectUrl);
  }

  return <RepEditor rep={rep} />;
}
