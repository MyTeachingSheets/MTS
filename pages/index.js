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
      <header className="top-nav">
        <div className="nav-inner">
          <a className="nav-brand" href="/">MyTeachingSheets</a>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="nav-search" style={{maxWidth:420}}>
              <input placeholder="Search worksheets, grades, lessons..." />
            </div>
            <div className="nav-actions">
              <button className="nav-btn">Sign in</button>
              <button className="nav-btn nav-btn--active">Get started</button>
            </div>
          </div>
        </div>
      </header>

      <main className="homepage">
        <section className="hero-banner">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-eyebrow">Trusted by teachers</div>
              <h1 className="hero-title">Beautiful, ready-to-use worksheets for every lesson</h1>
              <p className="hero-sub">Save time with high-quality worksheets, answers and teaching resources curated for modern classrooms.</p>
              <div style={{display:'flex',gap:12}}>
                <button className="hero-cta">Browse worksheets</button>
                <button className="btn-package">View packages</button>
              </div>
            </div>
            <div className="hero-media">
              <div className="hero-preview">
                <div className="preview-frame">Preview</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{maxWidth:1100, width:'100%', paddingTop:28}}>
          <h2 className="homepage-title">Featured worksheets</h2>
          <div className="slideshow" aria-hidden>
            <article className="slide" data-active="true">
              <div className="slide-thumb">Math — Fractions</div>
              <div className="slide-meta"><h3>Fraction practice</h3><p>5 printable pages, answer key included</p></div>
            </article>
            <article className="slide"><div className="slide-thumb">Science — Cells</div><div className="slide-meta"><h3>Cell structure</h3><p>Visual activities and lab worksheet</p></div></article>
            <article className="slide"><div className="slide-thumb">English — Comprehension</div><div className="slide-meta"><h3>Reading comprehension</h3><p>Short passage + questions</p></div></article>
          </div>
        </section>

        <section style={{maxWidth:900, width:'100%', marginTop:40}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>
            <div>
              <h2>Why teachers love us</h2>
              <p>We create classroom-ready resources that are easy to use, printable, and standards-aligned. Save prep time and keep students engaged.</p>
            </div>

            <aside style={{background:'#fff',padding:18,borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,0.06)'}}>
              <h3 style={{marginTop:0}}>Contact</h3>
              <form onSubmit={handleSubmit}>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <label>Name <input name="name" required /></label>
                  <label>Email <input name="email" type="email" required /></label>
                  <label>Message <textarea name="message" rows={4} required /></label>
                  <button className="btn-form" type="submit">Send</button>
                </div>
              </form>
              {status === 'loading' && <div style={{marginTop:8,color:'#666'}}>Sending…</div>}
              {status === 'success' && <div style={{marginTop:8,color:'var(--success)'}}>Thanks — we'll be in touch.</div>}
              {status === 'error' && <div style={{marginTop:8,color:'var(--error)'}}>Sorry, there was an error. Try again later.</div>}
              <div style={{marginTop:12,fontSize:13,color:'#567'}}>Or email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer" style={{padding:20,textAlign:'center'}}>
        © {new Date().getFullYear()} MyTeachingSheets — Built with Next.js
      </footer>
    </div>
  )
}
