import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'About',      to: '/about' },
  { label: 'Conditions', to: '/conditions' },
  // { label: 'Pain Mapper', to: '/pain-mapper' },
  //{ label: 'Education',  to: '/education' },
  { label: 'Locations',  to: '/conditions' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden,   setHidden]   = useState(false)
  const [open,     setOpen]     = useState(false)
  const lastY = useRef(0)
  const location = useLocation()

  // On pages with a light background (conditions, about) we always show the dark bg
  const lightBgPages = ['/conditions', '/about', '/education']
  const isLightPage  = lightBgPages.includes(location.pathname)

  useEffect(() => {
    // Reset scroll state on route change
    setScrolled(false)
    setHidden(false)
    setOpen(false)
    lastY.current = 0
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden(y > 200 && y > lastY.current + 4)
      if (y < lastY.current - 4) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page behind the full-screen mobile menu — otherwise the body
  // keeps scrolling under the overlay on iOS.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // The bar never hides while the menu is open — the close button must stay put.
  const barHidden = hidden && !open

  const navBg = (scrolled || isLightPage || open)
    ? 'rgba(8,21,39,0.96)'
    : 'transparent'

  const showBorder = (scrolled || isLightPage) && !open

  return (
    <>
      <motion.nav
        className="nav-bar"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: barHidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: barHidden ? 0.4 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px',
          background: navBg,
          backdropFilter: (scrolled || isLightPage || open) ? 'blur(20px) saturate(1.4)' : 'none',
          borderBottom: showBorder ? '1px solid rgba(201,169,110,0.12)' : 'none',
          transition: 'background 0.5s, border 0.5s',
        }}
      >
        {/* Logo */}
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', lineHeight: 1, minWidth: 0, minHeight: 44 }}>
          <img
            src="/images/logo2.png"
            alt="Physio Chandra logo"
            className="nav-logo-img"
            style={{
              objectFit: 'contain',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span className="nav-logo-text" style={{
              fontFamily: 'var(--font-accent)',
              letterSpacing: '0.13em',
              color: 'var(--white)', lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>PHYSIO-CHANDRA</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.label} to={l.to}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: location.pathname === l.to ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                transition: 'color 0.3s',
                position: 'relative',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = location.pathname === l.to ? 'var(--gold)' : 'rgba(255,255,255,0.6)'}
            >{l.label}</Link>
          ))}
          <a href="tel:+16045550101"
            style={{
              padding: '10px 28px',
              background: 'transparent',
              border: '1px solid rgba(201,169,110,0.55)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-body)', fontSize: '12px',
              fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
              transition: 'all 0.35s var(--ease)',
              borderRadius: '2px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gold)'
              e.currentTarget.style.color = 'var(--black)'
              e.currentTarget.style.borderColor = 'var(--gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--gold)'
              e.currentTarget.style.borderColor = 'rgba(201,169,110,0.55)'
            }}
          >Book Now</a>
        </div>

        {/* Hamburger — 48px tap target with the icon centred inside it */}
        <button onClick={() => setOpen(!open)} className="hide-desktop nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{
            display: 'flex', flexDirection: 'column', gap: '5px',
            alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', flexShrink: 0,
            marginRight: '-10px',   // optical alignment with the screen edge
          }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block',
              width: i === 1 ? '16px' : '24px',
              height: '1.5px',
              background: open ? 'var(--gold)' : 'rgba(255,255,255,0.8)',
              transition: 'all 0.35s var(--ease)',
              transform: open
                ? i === 0 ? 'rotate(45deg) translate(4.5px,4.5px)'
                : i === 1 ? 'scaleX(0)'
                : 'rotate(-45deg) translate(4.5px,-4.5px)'
                : 'none',
            }} />
          ))}
        </button>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="nav-overlay"
            style={{
              position: 'fixed', inset: 0, zIndex: 499,
              background: 'var(--black)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(16px, 4vh, 36px)',
              // Clear the fixed bar above and the home indicator below, and
              // stay scrollable if the list outgrows a short landscape screen.
              padding: 'calc(84px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom))',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}>
            {links.map((l, i) => (
              <motion.div key={l.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, ease: [0.16,1,0.3,1] }}
              >
                <Link to={l.to}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block', padding: '6px 12px',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 10vw, 44px)', fontWeight: 300,
                    color: 'var(--white)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.15,
                  }}
                >{l.label}</Link>
              </motion.div>
            ))}
            <motion.a href="tel:+16045550101" onClick={() => setOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{
                marginTop: '8px',
                padding: '16px 44px',
                background: 'var(--gold)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px', letterSpacing: '0.16em',
                textTransform: 'uppercase', fontWeight: 500,
                color: 'var(--black)',
                borderRadius: '2px',
                textAlign: 'center',
              }}>Book Now</motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-bar {
          padding: 20px clamp(20px, 5vw, 80px);
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
          padding-top: max(20px, env(safe-area-inset-top));
        }
        .nav-logo-img { width: 40px; height: 40px; }
        .nav-logo-text { font-size: 22px; }

        @media (max-width: 900px) {
          .nav-bar { padding-top: max(14px, env(safe-area-inset-top)); padding-bottom: 14px; }
          .nav-logo-img { width: 34px; height: 34px; }
          .nav-logo-text { font-size: 19px; }
          .nav-logo { gap: 9px; }
        }
        @media (max-width: 360px) {
          .nav-logo-img { width: 30px; height: 30px; }
          .nav-logo-text { font-size: 16.5px; letter-spacing: 0.1em; }
        }
      `}</style>
    </>
  )
}
