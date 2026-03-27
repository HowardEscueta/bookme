import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-warm">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold text-secondary tracking-tight">
          BookMe
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-secondary"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-secondary text-white px-5 py-2.5 rounded-full hover:bg-secondary/90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-block bg-primary-light text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            Free to start
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-secondary leading-[1.1] tracking-tight">
            Your clients book.
            <br />
            <span className="text-primary">You show up.</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
            A simple booking link for barbers, tutors, photographers, and anyone
            who runs on appointments. No more DM scheduling.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-primary text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-primary-hover shadow-sm hover:shadow-md"
            >
              Create Your Page
            </Link>
            <Link
              href="/demo"
              className="bg-bg text-secondary px-8 py-3.5 rounded-full text-base font-medium hover:bg-bg-soft shadow-sm"
            >
              Try the Demo
            </Link>
          </div>
        </section>

        {/* Mockup / Visual */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center text-lg font-bold">
                J
              </div>
              <div>
                <p className="font-semibold text-secondary">Juan&apos;s Barbershop</p>
                <p className="text-sm text-muted">Cavite, Philippines</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { name: "Regular Haircut", time: "30 min", price: "P150" },
                { name: "Haircut + Beard", time: "45 min", price: "P250" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="border border-border/60 rounded-xl p-4 hover:border-primary/30"
                >
                  <p className="font-medium text-secondary text-sm">{s.name}</p>
                  <p className="text-xs text-muted mt-1">
                    {s.time} &middot; {s.price}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 overflow-hidden">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                <div
                  key={d}
                  className={`w-14 py-2.5 rounded-xl text-center text-sm ${
                    i === 1
                      ? "bg-primary text-white font-medium"
                      : "bg-bg-soft text-muted"
                  }`}
                >
                  <p className="text-[10px] uppercase">{d}</p>
                  <p className="text-base font-bold mt-0.5">{28 + i}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-bg py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-sm font-medium text-primary text-center mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-secondary text-center mb-16">
              Three steps. Five minutes.
            </h2>
            <div className="grid sm:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Set up your page",
                  desc: "Add your services, prices, and the hours you're available. Takes about 2 minutes.",
                },
                {
                  step: "02",
                  title: "Share your link",
                  desc: "Send it via text, post it on social media, or print it as a QR code for your shop.",
                },
                {
                  step: "03",
                  title: "Clients book themselves",
                  desc: "They pick a service, choose an open slot, and confirm. You see it instantly.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <p className="text-4xl font-bold text-primary/15 mb-4">
                    {item.step}
                  </p>
                  <h3 className="font-semibold text-secondary text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <p className="text-sm font-medium text-primary text-center mb-3">
            Built for
          </p>
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Anyone who takes appointments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { role: "Barbers", emoji: "Haircuts & grooming" },
              { role: "Tutors", emoji: "Lessons & sessions" },
              { role: "Photographers", emoji: "Shoots & editing" },
              { role: "Clinics", emoji: "Checkups & consults" },
            ].map((item) => (
              <div
                key={item.role}
                className="card p-6 text-center"
              >
                <p className="font-semibold text-secondary text-lg">{item.role}</p>
                <p className="text-sm text-muted mt-1">{item.emoji}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="card p-12 sm:p-16 bg-secondary text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Stop losing clients to
              <br />
              unanswered DMs.
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Set up your booking page now. It&apos;s free.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-secondary px-8 py-3.5 rounded-full text-base font-medium hover:bg-white/90 shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 text-center text-sm text-muted">
        BookMe &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
