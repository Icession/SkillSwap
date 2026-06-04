import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Landing.css'

const STEPS = [
  { n: '1', title: 'Create your profile', text: "List the skills you can teach and the ones you'd love to learn." },
  { n: '2', title: 'Find a match',        text: 'Browse people and filter by skill, level, and availability.' },
  { n: '3', title: 'Swap & learn',        text: 'Send a request, agree on a time, and trade knowledge — no money involved.' },
]

const MARQUEE = [
  'UI Design', 'Python', 'Spanish', 'Photography', 'Calligraphy', 'Finance', 'React',
  'Japanese', 'Video Editing', 'Illustration', 'Excel', 'Guitar', 'Statistics', 'Copywriting',
]

const MATCHES = [
  { a: { i: 'MS', c: '#298C6E' }, b: { i: 'JC', c: '#F4A44A' }, teaches: 'UI Design',  learns: 'Photography' },
  { a: { i: 'HT', c: '#2F7D8C' }, b: { i: 'BS', c: '#C77DBB' }, teaches: 'Statistics', learns: 'Calligraphy' },
  { a: { i: 'AL', c: '#5A8F3C' }, b: { i: 'RW', c: '#E08A4B' }, teaches: 'Python',     learns: 'Spanish' },
  { a: { i: 'KM', c: '#298C6E' }, b: { i: 'DP', c: '#F4A44A' }, teaches: 'Figma',      learns: 'Video Editing' },
]

const FEATURES = [
  {
    title: 'Always free',
    bg: '#C8E6D8', fg: '#1A5C48',
    text: 'No payments, subscriptions, or hidden fees — you trade time and knowledge, never money.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8" /><path d="M16.5 8a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8" />
      </svg>
    ),
  },
  {
    title: 'Skill-level matching',
    bg: '#FCE9D2', fg: '#B26B16',
    text: "Every skill shows a proficiency level, so you know exactly who you're learning from.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Filter & discover',
    bg: '#D6E9EE', fg: '#2F7D8C',
    text: 'Search and filter by skill, category, level, and availability to find the right match fast.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: 'Built-in messaging',
    bg: '#F1E2EE', fg: '#9C5C90',
    text: 'Arrange each swap in a private conversation thread tied to your request.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      </svg>
    ),
  },
]

const CATEGORIES = ['Design', 'Programming', 'Languages', 'Music', 'Photography', 'Writing', 'Business', 'Cooking', 'Fitness', 'Art']

const FAQS = [
  { q: 'Is SkillSwap really free?', a: 'Yes. There are no payments, subscriptions, or fees. You exchange skills directly — your time and knowledge for someone else’s.' },
  { q: 'Do I have to be a student?', a: 'It’s built with students in mind, but anyone who wants to learn something new or share what they already know is welcome.' },
  { q: 'How does a swap actually work?', a: 'Find someone whose skills match what you want, send a swap request, and once they accept you can message each other to agree on a time.' },
  { q: 'What kind of skills can I offer?', a: 'Anything you can teach — programming, languages, music, design, photography, cooking, and plenty more.' },
  { q: 'Is my information safe?', a: 'Your data is protected with database-level security rules, so you only ever see and share what you choose to.' },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser, loading } = useApp()
  const [mi, setMi] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

  const [howRef, howIn] = useInView()
  const [featRef, featIn] = useInView()
  const [catRef, catIn] = useInView()
  const [faqRef, faqIn] = useInView()
  const [ctaRef, ctaIn] = useInView()

  useEffect(() => {
    if (!loading && currentUser) navigate('/feed', { replace: true })
  }, [loading, currentUser, navigate])

  useEffect(() => {
    const t = setInterval(() => setMi((i) => (i + 1) % MATCHES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const m = MATCHES[mi]

  return (
    <div className="lp">
      <div className="lp-aurora" aria-hidden="true">
        <span className="lp-blob lp-blob-1" />
        <span className="lp-blob lp-blob-2" />
        <span className="lp-blob lp-blob-3" />
      </div>

      <header className="lp-header">
        <div className="lp-logo">
          <div className="lp-logo-mark">S</div>
          <span className="lp-logo-name">SkillSwap</span>
        </div>
        <nav className="lp-nav">
          <button onClick={() => scrollTo('how')}>How it works</button>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('faq')}>FAQ</button>
        </nav>
        <div className="lp-header-actions">
          <button className="lp-btn-text" onClick={() => navigate('/login')}>Sign in</button>
          <button className="lp-btn-primary" onClick={() => navigate('/register')}>Get started</button>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-eyebrow lp-fade" style={{ animationDelay: '0.05s' }}>Skill exchange for students</div>
          <h1 className="lp-fade" style={{ animationDelay: '0.12s' }}>
            Trade what you know<br />for what you need.
          </h1>
          <p className="lp-fade" style={{ animationDelay: '0.2s' }}>
            SkillSwap connects students and learners to exchange skills directly — no money, just
            time and knowledge. Teach what you're great at, learn what you're not.
          </p>
          <div className="lp-cta lp-fade" style={{ animationDelay: '0.28s' }}>
            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate('/register')}>Get started — it's free</button>
            <button className="lp-btn-ghost lp-btn-lg" onClick={() => navigate('/login')}>I have an account</button>
          </div>
        </div>

        <div className="lp-hero-visual lp-fade" style={{ animationDelay: '0.32s' }}>
          <div className="lp-swapcard">
            <div className="lp-swap-content" key={mi}>
              <div className="lp-swap-row">
                <div className="lp-avatar" style={{ background: m.a.c }}>{m.a.i}</div>
                <div className="lp-swap-arrow">↔</div>
                <div className="lp-avatar" style={{ background: m.b.c }}>{m.b.i}</div>
              </div>
              <div className="lp-swap-line"><span className="lp-chip lp-chip-offer">Teaches: {m.teaches}</span></div>
              <div className="lp-swap-line"><span className="lp-chip lp-chip-want">Learns: {m.learns}</span></div>
            </div>
            <div className="lp-swap-foot"><span className="lp-livedot" /> New match found</div>
          </div>
        </div>
      </section>

      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((s, i) => (
            <span key={i} className="lp-marquee-item">{s}</span>
          ))}
        </div>
      </div>

      <section id="how" ref={howRef} className={`lp-how ${howIn ? 'lp-in' : ''}`}>
        <div className="lp-head">
          <div className="lp-kicker lp-rv">Get started</div>
          <h2 className="lp-rv">How it works</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="lp-step lp-rv">
              <div className="lp-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" ref={featRef} className={`lp-features ${featIn ? 'lp-in' : ''}`}>
        <div className="lp-head">
          <div className="lp-kicker lp-rv">Why SkillSwap</div>
          <h2 className="lp-rv">Everything you need to swap</h2>
          <p className="lp-section-sub lp-rv">A simple set of tools to find people, agree on a trade, and learn something new.</p>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature lp-rv">
              <div className="lp-feature-icon" style={{ background: f.bg, color: f.fg }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" ref={catRef} className={`lp-cats ${catIn ? 'lp-in' : ''}`}>
        <div className="lp-head">
          <div className="lp-kicker lp-rv">Discover</div>
          <h2 className="lp-rv">Explore by category</h2>
          <p className="lp-section-sub lp-rv">From code to cooking — there's something to learn in every corner.</p>
        </div>
        <div className="lp-cat-grid">
          {CATEGORIES.map((c) => (
            <button key={c} className="lp-cat lp-rv" onClick={() => navigate('/register')}>{c}</button>
          ))}
        </div>
      </section>

      <section id="faq" ref={faqRef} className={`lp-faq ${faqIn ? 'lp-in' : ''}`}>
        <div className="lp-head">
          <div className="lp-kicker lp-rv">Questions</div>
          <h2 className="lp-rv">Frequently asked</h2>
        </div>
        <div className="lp-faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`lp-faq-item lp-rv ${openFaq === i ? 'open' : ''}`}>
              <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                <span>{f.q}</span>
                <svg className="lp-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className="lp-faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section ref={ctaRef} className={`lp-ctaband ${ctaIn ? 'lp-in' : ''}`}>
        <div className="lp-ctaband-inner lp-rv">
          <div className="lp-kicker lp-kicker-light">Join SkillSwap</div>
          <h2>Ready to start swapping?</h2>
          <p>Create your free account and find your first match in minutes.</p>
          <button className="lp-btn-white lp-btn-lg" onClick={() => navigate('/register')}>Get started — it's free</button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <div className="lp-logo-mark">S</div>
              <span className="lp-logo-name">SkillSwap</span>
            </div>
            <p>Trade what you know for what you need.</p>
          </div>
          <div className="lp-footer-links">
            <button onClick={() => scrollTo('how')}>How it works</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
            <button onClick={() => navigate('/register')}>Sign up</button>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} SkillSwap — a student skill-exchange project.</span>
          <a href="https://github.com/Icession/SkillSwap" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
      </footer>
    </div>
  )
}