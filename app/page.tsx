import Link from "next/link";
import { FIBER_REPS } from "@/lib/fiberReps";

export default function Home() {
  return (
    <main className="hubPage">
      <header className="hubTopbar">
        <Link href="/" className="hubBrand">The Fiber Crew</Link>
        <div className="hubProviderBadges" aria-label="Fiber providers">
          <span className="frontier">Frontier</span>
          <span className="kinetic">Kinetic</span>
        </div>
      </header>

      <section id="team" className="teamSection" aria-labelledby="team-heading">
        <div className="teamSectionHead">
          <p className="hubEyebrow">The team</p>
          <h1 id="team-heading">Dayton fiber reps.</h1>
        </div>

        <div className="repGrid">
          {FIBER_REPS.map((rep) => (
            <RepCard key={rep.slug} rep={rep} />
          ))}
        </div>
      </section>

      <footer className="hubFooter">
        <span>Local reps. Kinetic and Frontier fiber. Text your person.</span>
      </footer>
    </main>
  );
}

function RepCard({ rep }: { rep: typeof FIBER_REPS[number] }) {
  const initials = rep.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const href = rep.redirectUrl || `/${rep.slug}`;

  const card = (
    <article className="repCard" style={{ "--rep-accent": rep.accent || "#1aa260" } as React.CSSProperties}>
      <div className="repPortrait">
        {rep.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={rep.photoUrl} alt={rep.photoAlt || `${rep.name}, personal fiber rep`} />
        ) : (
          <div className="repInitials">{initials}</div>
        )}
      </div>
      <div className="repCardBody">
        <h3>{rep.name}</h3>
      </div>
    </article>
  );

  if (rep.redirectUrl) {
    return <a className="repCardLink" href={href}>{card}</a>;
  }

  return <Link className="repCardLink" href={href}>{card}</Link>;
}
