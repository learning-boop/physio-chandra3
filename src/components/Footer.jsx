import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" style={{ background: '#081527', borderTop: '1px solid rgba(201,169,110,0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }} className="footer-g">
        <div>
          <p style={{ fontFamily: 'var(--font-accent)', fontSize: '20px', letterSpacing: '0.1em', color: 'var(--white)', marginBottom: '4px' }}>PHYSIO CHANDRA</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 300, marginBottom: '20px' }}>Registered Physiotherapist · British Columbia</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, lineHeight: 1.85, color: 'rgba(255,255,255,0.3)', maxWidth: '280px' }}>
            Registered physiotherapist practising in Surrey and Burnaby. Evidence-informed rehabilitation with an individualized approach.
          </p>
        </div>
        {[
          ['Navigation', [['Home', '/'], ['About', '/about'], ['Conditions', '/conditions'], ['Education', '/education']]],
          ['Clinics', [['Arka Physiotherapy', '/conditions'], ['BC Ice', '/conditions'], ['Performance Health Group', '/conditions']]],
          ['Contact', [['Call: (604) 555-0101', 'tel:+16045550101'], ['chandra@physiochandra.ca', 'mailto:chandra@physiochandra.ca']]],
        ].map(([title, items]) => (
          <div key={title} className="link-list">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 'clamp(14px, 4vw, 24px)', fontWeight: 400 }}>{title}</p>
            {items.map(([label, href]) => (
              href.startsWith('/') ? (
                <Link key={label} to={href} style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.35)', marginBottom: '12px', transition: 'color 0.3s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                >{label}</Link>
              ) : (
                <a key={label} href={href} style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.35)', marginBottom: '12px', transition: 'color 0.3s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                >{label}</a>
              )
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'clamp(22px, 6vw, 32px)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.22)' }}>© {new Date().getFullYear()} Physio Chandra. All rights reserved.</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.22)' }}>Registered Physiotherapist · British Columbia</p>
      </div>

      <style>{`
        .site-footer {
          padding: clamp(56px, 12vw, 80px) clamp(20px, 5vw, 80px) clamp(28px, 7vw, 40px);
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
          padding-bottom: calc(clamp(28px, 7vw, 40px) + env(safe-area-inset-bottom));
        }
        .footer-g { gap: clamp(32px, 7vw, 48px); margin-bottom: clamp(40px, 9vw, 64px); }
        @media (max-width: 900px) { .footer-g { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-g { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}