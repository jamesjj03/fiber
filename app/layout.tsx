import "./globals.css";

export const metadata = {
  title: "The Fiber Crew",
  description: "A Dayton-based crew of personal Kinetic and Frontier fiber reps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
