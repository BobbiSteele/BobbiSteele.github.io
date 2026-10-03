import Typewriter from "./Typewriter";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
      <div className="pt-8 pl-6 pr-6 pb-8 md:pt-12 md:pl-32 md:pr-16 md:pb-28">
        <p className="text-4xl font-semibold text-white sm:text-6xl lg:text-7xl italic" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Digital Marketing Specialist
        </p>

        <div className="mt-10 sm:mt-16">
          <Typewriter />
        </div>

        <p
          className="mt-10 max-w-4xl text-lg leading-relaxed text-zinc-300 sm:mt-16 sm:text-xl"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Senior digital marketing specialist with 6+ years of experience driving demand,
          positioning and go-to-market strategy for B2B SaaS and deep-tech products. This
          includes industrial AI and robotics, drones and insurtech.
        </p>

        <p
          className="mt-6 max-w-4xl text-lg leading-relaxed text-zinc-300 sm:text-xl"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          I specialise in ABM, messaging, and full-funnel content that engages technical
          buyers, from engineers to C-suite executives. With hands-on expertise in
          JavaScript, APIs, and SQL, I partner effectively with product and engineering
          teams to translate complex technology into credible, compelling market narratives.
        </p>
      </div>
    </main>
  );
}
