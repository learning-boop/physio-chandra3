import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#081527', padding: '80px clamp(20px, 5vw, 80px) 40px', borderTop: '1px solid rgba(201,169,110,0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '64px' }} className="footer-g">
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
          <div key={title}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px', fontWeight: 400 }}>{title}</p>
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

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.22)' }}>© {new Date().getFullYear()} Physio Chandra. All rights reserved.</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 200, color: 'rgba(255,255,255,0.22)' }}>Registered Physiotherapist · British Columbia</p>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-g { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-g { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}