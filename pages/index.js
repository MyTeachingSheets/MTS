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
          <nav className="nav-actions" aria-label="Main navigation">
            <a className="nav-btn" href="#features">Features</a>
            <a className="nav-btn" href="#pricing">Pricing</a>
            <a className="nav-btn nav-btn--active" href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="homepage" role="main">
        <section className="hero-banner" aria-labelledby="hero-title" style={{paddingTop:28}}>
          <div className="hero-inner" style={{alignItems:'center'}}>
            <div className="hero-content">
              <h1 id="hero-title" className="hero-title">Fast, high-quality worksheets for teachers</h1>
              <p className="hero-sub">Download ready-made worksheets, answer keys, and classroom packages that save hours of prep time each week.</p>
              <p style={{marginTop:18}}>
                <a className="hero-cta" href="#features">Explore worksheets</a>
                <a className="btn-package" href="#pricing" style={{marginLeft:12}}>See pricing</a>
              </p>
            </div>
            <div className="hero-media">
              <div className="preview-frame">Preview</div>
            </div>
          </div>
        </section>

        <section id="features" style={{maxWidth:900, width:'100%', paddingTop:36}}>
          <h2 className="homepage-title">Features</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:12}}>
            <div style={{background:'#fff',padding:16,borderRadius:10}}>
              <h3>Ready to use</h3>
              <p>Printable, editable PDFs and answer keys.</p>
            </div>
            <div style={{background:'#fff',padding:16,borderRadius:10}}>
              <h3>Standards aligned</h3>
              <p>Aligned to common curricula for quick planning.</p>
            </div>
            <div style={{background:'#fff',padding:16,borderRadius:10}}>
              <h3>Affordable packages</h3>
              <p>Flexible pricing for single teachers or schools.</p>
            </div>
          </div>
        </section>

        <section id="cta" style={{maxWidth:900, width:'100%', paddingTop:36, textAlign:'center'}}>
          <h2>Start saving time today</h2>
          <p style={{marginTop:8}}>Create an account and get three free worksheets to try.</p>
          <div style={{marginTop:12}}>
            <a className="hero-cta" href="#signup">Get started — it's free</a>
          </div>
        </section>

        <footer id="contact" className="site-footer" style={{padding:28, marginTop:36}}>
          <div style={{maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16}}>
            <div>
              <strong>Contact</strong>
              <div style={{marginTop:6}}><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
            </div>
            <div style={{textAlign:'right'}}>
              <div>© {new Date().getFullYear()} MyTeachingSheets</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
