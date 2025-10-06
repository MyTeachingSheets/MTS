import { useState } from 'react'
import Link from 'next/link'
import AuthModal from '../components/AuthModal'

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const featuredResources = [
    { id: 1, title: 'Math Worksheets Bundle', desc: 'Complete K-5 math practice sheets', icon: '🔢', rating: 4.9 },
    { id: 2, title: 'Reading Comprehension Pack', desc: 'Engaging stories with questions', icon: '📚', rating: 4.8 },
    { id: 3, title: 'Science Lab Activities', desc: 'Hands-on experiments for grades 3-6', icon: '🔬', rating: 4.9 },
    { id: 4, title: 'Grammar Practice Sheets', desc: 'Parts of speech & sentence structure', icon: '✏️', rating: 4.7 },
    { id: 5, title: 'Geography Maps & Quizzes', desc: 'World maps and country studies', icon: '🗺️', rating: 4.8 },
    { id: 6, title: 'Art & Creativity Projects', desc: 'Step-by-step art lessons', icon: '🎨', rating: 4.9 },
  ]

  const categories = [
    { name: 'Elementary', icon: '🎒' },
    { name: 'Middle School', icon: '📝' },
    { name: 'High School', icon: '🎓' },
    { name: 'Special Ed', icon: '💫' },
  ]

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Ready-Made Teaching Resources</h1>
            <p className="tagline">
              Save hours of prep time with high-quality worksheets, activities, and lesson plans created by teachers, for teachers.
            </p>
            <div className="hero-actions">
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="btn">Get Started Free</button>
              <Link href="#featured" className="btn btn-secondary">Browse Resources</Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="content-section">
          <h2 className="section-title">Explore by Grade Level</h2>
          <div className="category-grid">
            {categories.map(cat => (
              <div key={cat.name} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Resources */}
        <section id="featured" className="content-section" style={{background:'white'}}>
          <h2 className="section-title">Featured Resources</h2>
          <div className="resource-grid">
            {featuredResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-thumb">{resource.icon}</div>
                <div className="resource-body">
                  <h3>{resource.title}</h3>
                  <p>{resource.desc}</p>
                  <div className="resource-meta">
                    <span className="resource-rating">⭐ {resource.rating}</span>
                    <span style={{fontWeight:600,color:'var(--tpt-teal)'}}>FREE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
