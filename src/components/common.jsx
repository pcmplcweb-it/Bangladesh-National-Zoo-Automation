import { useEffect, useRef, useState } from 'react';
import { toBnDigits } from '../data/zoo';

export function SectionTitle({ kicker, title, children, center = true }) {
  return (
    <div className={`section-title ${center ? 'center' : ''}`}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function PageHero({ title, subtitle, emoji, crumbs, photo }) {
  const style = photo ? { backgroundImage: `linear-gradient(110deg, rgba(5,40,18,.94), rgba(10,70,32,.6)), url(${photo})` } : undefined;
  return (
    <section className={`page-hero ${photo ? 'photo' : ''}`} style={style}>
      <div className="page-hero-deco" aria-hidden>{emoji}</div>
      <div className="container">
        <span className="crumbs">Home / {crumbs || title}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

// Fades/slides children in when they scroll into view.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export function Counter({ to, suffix = '', bn = false }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1600);
        setVal(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{bn ? toBnDigits(val) : val.toLocaleString()}{suffix}</span>;
}
