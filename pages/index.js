import { useState } from 'react'

export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || 'you@example.com'
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = Object.fromEntries(form.entries())
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Network error')
      setStatus('success')
      e.target.reset()
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div>
      <header className="top-nav" role="banner">
        <div className="nav-inner">
          <a className="nav-brand" href="/">MyTeachingSheets</a>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="nav-search" style={{maxWidth:420}}>
              <input aria-label="Search" placeholder="Search worksheets, grades, lessons..." />
            </div>
            <div className="nav-actions">
              <a className="nav-btn" href="#features">Features</a>
              <a className="nav-btn nav-btn--active" href="#contact">Contact</a>
            </div>
          </div>
        </div>
      </header>

      <main className="homepage" role="main">
        <section className="hero-banner" aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-eyebrow">Trusted by teachers</div>
              <h1 id="hero-title" className="hero-title">Beautiful, ready-to-use worksheets for every lesson</h1>
              <p className="hero-sub">Save time with high-quality, printable worksheets and full answer keys — built for modern classrooms.</p>
              <div style={{display:'flex',gap:12}}>
                <a className="hero-cta" href="#features">Browse worksheets</a>
                <a className="btn-package" href="#packages">View packages</a>
              </div>
            </div>
            <div className="hero-media">
              <div className="hero-preview">
                <div className="preview-frame">Worksheet Preview</div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={{maxWidth:1100, width:'100%', paddingTop:28}}>
          <h2 className="homepage-title">Featured worksheets</h2>
          <div className="slideshow" aria-hidden>
            <article className="slide" data-active="true">
              <div className="slide-thumb">Math — Fractions</div>
              <div className="slide-meta"><h3>Fraction practice</h3><p>Five printable pages with answers</p></div>
            </article>
            <article className="slide"><div className="slide-thumb">Science — Cells</div><div className="slide-meta"><h3>Cell structure</h3><p>Visual activities and lab worksheet</p></div></article>
            <article className="slide"><div className="slide-thumb">English — Comprehension</div><div className="slide-meta"><h3>Reading comprehension</h3><p>Passage + guided questions</p></div></article>
          </div>
        </section>

        <section id="about" style={{maxWidth:1100, width:'100%', marginTop:40}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:28,alignItems:'start'}}>
            <div>
              <h2>Why teachers love our resources</h2>
              <ul>
                <li>Ready to print and use in class</li>
                <li>Aligned with common standards</li>
                <li>Detailed answer keys for quick grading</li>
              </ul>
            </div>

            <aside id="contact" className="auth-right" aria-labelledby="contact-heading">
              <h3 id="contact-heading" className="auth-heading">Get in touch</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" rows={4} required />
                </div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button className="btn-form" type="submit">Send message</button>
                  <a className="ghost-btn" href={`mailto:${contactEmail}`}>Email us</a>
                </div>
              </form>
              {status === 'loading' && <div style={{marginTop:8,color:'#666'}}>Sending…</div>}
              {status === 'success' && <div style={{marginTop:8,color:'var(--success)'}}>Thanks — we'll be in touch.</div>}
              {status === 'error' && <div style={{marginTop:8,color:'var(--error)'}}>Sorry, there was an error. Try again later.</div>}
            </aside>
          </div>
        </section>

        <section id="testimonials" style={{maxWidth:1100, width:'100%', marginTop:48}}>
          <h2 className="homepage-title">What teachers say</h2>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <div style={{flex:'1 1 280px',background:'#fff',padding:16,borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
              "These worksheets saved me hours of prep time." — Ms. Patel
            </div>
            <div style={{flex:'1 1 280px',background:'#fff',padding:16,borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
              "Clear, printable and very well structured." — Mr. James
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" style={{padding:28,textAlign:'center'}}>
        <div>© {new Date().getFullYear()} MyTeachingSheets</div>
        <div style={{marginTop:8}}><small>Built with Next.js · <a href="/privacy">Privacy</a></small></div>
      </footer>
    </div>
  )
}
