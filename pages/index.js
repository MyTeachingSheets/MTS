export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || 'you@example.com'
  return (
    <main className="container">
      <section className="hero">
        <h1>Hi, I'm Sahith 👋</h1>
        <p className="tagline">A small, simple Next.js one-page site — starting point for your project.</p>
        <div className="actions">
          <a className="btn" href="#contact">Contact</a>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Get in touch</h2>
        <p>If you'd like to talk or hire me, email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Sahith. Built with Next.js.</footer>
    </main>
  )
}
