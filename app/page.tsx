import Link from "next/link";
import { FIBER_REPS } from "@/lib/fiberReps";

export default function Home() {
  const hostedCount = FIBER_REPS.filter((rep) => !rep.redirectUrl).length;
  const featuredReps = FIBER_REPS.slice(0, 7);

  return (
    <main className="hubPage">
      <section className="hubHero">
        <div className="hubHeroCopy">
          <p className="hubEyebrow">The Fiber Crew</p>
          <h1>Pick your person. Compare your internet bill.</h1>
          <p>
            A Dayton-based crew of personal reps for Kinetic and Frontier fiber.
            Faces first, quick quotes, real contact info, and QR pages that make
            the whole thing feel legit before anybody sends a text.
          </p>
          <div className="hubProviderBadges" aria-label="Fiber providers">
            <span className="frontier">Frontier</span>
            <span className="kinetic">Kinetic</span>
          </div>
          <div className="hubHeroStats">
            <span><strong>{FIBER_REPS.length}</strong> team cards</span>
            <span><strong>{hostedCount}</strong> rep pages</span>
            <span><strong>1</strong> QR kit</span>
          </div>
          <div className="hubHeroActions">
            <Link href="/qr">Open QR kit</Link>
            <a href="#team">Meet the crew</a>
          </div>
        </div>
        <div className="hubShowcase" aria-label="The Fiber Crew preview">
          <div className="hubShowcaseRing">
            {featuredReps.map((rep, index) => (
              <MiniRep key={rep.slug} rep={rep} index={index} />
            ))}
          </div>
          <div className="hubProofPanel">
            <span>Local, personal, still professional.</span>
            <p>
              Built for porch conversations, referrals, bill screenshots, and
              rep-specific QR codes that point to the right person every time.
            </p>
          </div>
        </div>
      </section>

      <section id="team" className="teamSection" aria-labelledby="team-heading">
        <div className="teamSectionHead">
          <div>
            <p className="hubEyebrow">The team</p>
            <h2 id="team-heading">Choose your rep</h2>
          </div>
          <p>Every page gets its own color, intro, photo slot, QR code, and contact path.</p>
        </div>

        <div className="repGrid">
          {FIBER_REPS.map((rep) => (
            <RepCard key={rep.slug} rep={rep} />
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniRep({ rep, index }: { rep: typeof FIBER_REPS[number]; index: number }) {
  const initials = rep.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="miniRep"
      style={{
        "--rep-accent": rep.accent || "#1aa260",
        "--mini-index": index,
      } as React.CSSProperties}
    >
      {rep.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rep.photoUrl} alt="" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function RepCard({ rep }: { rep: typeof FIBER_REPS[number] }) {
  const initials = rep.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const href = rep.redirectUrl || `/${rep.slug}`;
  const isExternal = Boolean(rep.redirectUrl);

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
        <span>{rep.role || "Personal fiber rep"}</span>
        <h3>{rep.name}</h3>
        <p>{rep.tagline || "Kinetic and Frontier fiber quotes, made less awkward."}</p>
      </div>
      <b>{isExternal ? "Open JJ's page" : "Open rep page"}</b>
    </article>
  );

  if (isExternal) {
    return <a className="repCardLink" href={href}>{card}</a>;
  }

  return <Link className="repCardLink" href={href}>{card}</Link>;
}
