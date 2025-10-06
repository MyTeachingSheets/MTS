export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || 'you@example.com'

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <header className="top-nav" role="banner">
        <div className="nav-inner">
          <a className="nav-brand" href="/">MyTeachingSheets</a>
          <nav className="nav-actions" aria-label="Main navigation">
            <a className="nav-btn nav-btn--active" href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="homepage" role="main" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <section style={{maxWidth:800,width:'100%',textAlign:'center',padding:'2rem 1rem'}}>
          <h1 style={{fontSize:'2.5rem',marginBottom:'1rem',color:'var(--fg)'}}>
            High-quality worksheets for teachers
          </h1>
          <p style={{fontSize:'1.1rem',color:'#6c757d',marginBottom:'2rem'}}>
            Ready-made, printable resources with answer keys. Save hours of prep time.
          </p>
          <p>
            <a className="hero-cta" href="#contact">Get in touch</a>
          </p>
        </section>
      </main>

      <footer id="contact" className="site-footer" style={{padding:'2rem 1rem',textAlign:'center',background:'#fff',borderTop:'1px solid #e9ecef'}}>
        <div>
          <strong>Contact</strong>
          <div style={{marginTop:8}}><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
        </div>
        <div style={{marginTop:16,fontSize:'0.9rem',color:'#6c757d'}}>
          © {new Date().getFullYear()} MyTeachingSheets
        </div>
      </footer>
    </div>
  )
}
