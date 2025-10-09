import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AuthModal from '../components/AuthModal'

export default function Home({ heroBg }) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const { auth } = router.query
    if (auth === 'login' || auth === 'register') {
      setAuthMode(auth)
      setShowAuthModal(true)
      // remove the query param to keep URL clean
      const { auth: _a, ...rest } = router.query
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true })
    }
  }, [router])
  // featuredResources removed per user request

  const categories = [
    { name: 'Elementary', icon: '🎒' },
    { name: 'Middle School', icon: '📝' },
    { name: 'High School', icon: '🎓' },
    { name: 'Special Ed', icon: '💫' },
  ]

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <main>
        {/* Category pills placed between header and hero */}
        <div style={{background:'transparent'}}>
          <div className="category-pills" aria-label="Browse categories" style={{maxWidth:1200,margin:'0 auto'}}>
            {['Grade','Resource type','Seasonal','ELA','Math','Science','Social studies','Languages','Arts','Special education','Speech therapy'].map(cat => (
              <button key={cat} className="pill" onClick={() => { /* future: filter by category */ }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section with background illustration */}
        <section className="hero-section hero-with-bg" role="region" aria-label="Hero">
          <div className="hero-bg" aria-hidden="true" style={heroBg ? {backgroundImage:`url('${heroBg}')`} : {}}></div>
          <div className="hero-content">
            <h1>Generate worksheets fast</h1>
            <p className="tagline">Custom worksheets, ready in seconds.</p>
            <div className="hero-actions">
              <Link href="/ai/generate" className="btn btn-generate" aria-label="Generate">
                Generate
              </Link>

              <Link href="#featured" className="btn btn-secondary">Browse Resources</Link>
            </div>
          </div>
        </section>

        {/* Explore by Grade Level removed per request */}

        {/* School-level resource sections */}
        <section className="content-section" aria-label="Elementary resources">
          <h2 className="section-title">Explore Elementary School Resources</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 1</h3>
                <p>Description for elementary worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 2</h3>
                <p>Description for elementary worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 3</h3>
                <p>Description for elementary worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 4</h3>
                <p>Description for elementary worksheet resource.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" aria-label="Middle school resources">
          <h2 className="section-title">Explore Middle School Resources</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 1</h3>
                <p>Description for middle school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 2</h3>
                <p>Description for middle school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 3</h3>
                <p>Description for middle school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 4</h3>
                <p>Description for middle school worksheet resource.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" aria-label="High school resources">
          <h2 className="section-title">Explore High School Resources</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 1</h3>
                <p>Description for high school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 2</h3>
                <p>Description for high school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 3</h3>
                <p>Description for high school worksheet resource.</p>
              </div>
            </div>

            <div className="resource-card">
              <div className="resource-thumb"></div>
              <div className="resource-body">
                <h3>Worksheet Placeholder 4</h3>
                <p>Description for high school worksheet resource.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resources removed per request */}

        {/* CTA Section */}
        <section className="content-section" style={{textAlign:'center',paddingTop:80,paddingBottom:80}}>
          <h2 style={{fontSize:'2.5rem',marginBottom:20}}>Join 7M+ Teachers Worldwide</h2>
          <p style={{fontSize:'1.2rem',color:'var(--text-secondary)',marginBottom:32,maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
            Create your free account and get access to thousands of teacher-created resources.
          </p>
          <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="btn" style={{fontSize:'1.1rem',padding:'14px 32px'}}>Sign Up Today</button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link href="/about">About</Link>
            <Link href="/help">Help Center</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} MyTeachingSheets. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </div>
  )
}

export async function getStaticProps() {
  // Detect if a custom hero background image exists in the public folder.
  // Look for common extensions: jpg, jpeg, png, webp
  const fs = require('fs')
  const path = require('path')
  const publicDir = path.join(process.cwd(), 'public')
  const candidates = ['hero-bg-custom.jpg', 'hero-bg-custom.jpeg', 'hero-bg-custom.png', 'hero-bg-custom.webp']
  let heroBg = null

  for (const c of candidates) {
    try {
      const p = path.join(publicDir, c)
      if (fs.existsSync(p)) {
        heroBg = `/${c}`
        break
      }
    } catch (e) {
      // ignore
    }
  }

  return { props: { heroBg } }
}
