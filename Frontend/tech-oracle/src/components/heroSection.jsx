"use client";
import React, { useEffect, useRef } from "react";

const HeroSection = ({ formSectionId = "repair-form" }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hero-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedEls = heroRef.current?.querySelectorAll(".hero-animate");
    animatedEls?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleBookRepair = () => {
    const formEl = document.getElementById(formSectionId);
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const services = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28 }}>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 12h8M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      label: "Speed Boost",
      title: "SSD & RAM Upgrades",
      description: "Breathe new life into aging hardware with faster storage and expanded memory.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28 }}>
          <path d="M12 3C12 3 6 6 6 12a6 6 0 0012 0c0-6-6-9-6-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
      ),
      label: "Thermal Care",
      title: "Deep Clean & Re-paste",
      description: "Stop overheating with professional deep cleaning and thermal paste replacement.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28 }}>
          <rect x="3" y="3" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7 10l3 3 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "System Refresh",
      title: "OS Optimization & Clean Install",
      description: "Windows tuning and fresh OS installs for a snappy, bloat-free experience.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .hero-root {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #05080f;
          display: flex;
          align-items: center;
          padding: 80px 24px 60px;
          box-sizing: border-box;
        }

        /* Ambient background orbs */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          will-change: transform;
        }
        .hero-orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%);
          top: -120px; left: -100px;
          animation: orbFloat1 18s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation: orbFloat2 22s ease-in-out infinite;
        }
        .hero-orb-3 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%);
          top: 40%; right: 22%;
          animation: orbFloat3 14s ease-in-out infinite;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.06); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.04); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        /* Grid lines */
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Layout */
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
          align-items: center;
        }

        /* Badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37,99,235,0.12);
          border: 1px solid rgba(37,99,235,0.35);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          color: #93c5fd;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 8px #3b82f6;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }

        /* Headline */
        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 5.5vw, 4rem);
          font-weight: 800;
          color: #f0f4ff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
        }
        .hero-headline-accent {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 55%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Subheadline */
        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.15rem);
          font-weight: 300;
          color: #94a3b8;
          line-height: 1.7;
          max-width: 560px;
          margin: 0 0 36px;
        }

        /* CTA */
        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 15px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 24px rgba(37,99,235,0.35);
          position: relative;
          overflow: hidden;
        }
        .hero-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .hero-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(37,99,235,0.5);
        }
        .hero-cta-btn:hover::before { opacity: 1; }
        .hero-cta-btn:active { transform: translateY(0); }
        .hero-cta-arrow {
          display: inline-flex;
          transition: transform 0.2s ease;
        }
        .hero-cta-btn:hover .hero-cta-arrow {
          transform: translateX(4px);
        }

        /* Trust strip */
        .hero-trust {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }
        .hero-trust-check {
          color: #22d3ee;
          font-size: 14px;
        }

        /* Cards */
        .hero-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 500px) {
          .hero-cards { grid-template-columns: 1fr 1fr; }
          .hero-card:last-child { grid-column: 1 / -1; }
        }

        @media (min-width: 900px) {
          .hero-inner { grid-template-columns: 1fr 1fr; }
          .hero-cards { grid-template-columns: 1fr; }
          .hero-card:last-child { grid-column: auto; }
        }

        .hero-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: inherit;
        }
        .hero-card:hover {
          transform: translateY(-4px);
          border-color: rgba(96,165,250,0.3);
          background: rgba(255,255,255,0.07);
        }
        .hero-card:hover::before { opacity: 1; }

        .hero-card-icon {
          width: 48px; height: 48px;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(96,165,250,0.25);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #93c5fd;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .hero-card-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #60a5fa;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .hero-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 6px;
        }
        .hero-card-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0;
        }

        /* Animations */
        .hero-animate {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .hero-animate.hero-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-delay-1 { transition-delay: 0.1s; }
        .hero-delay-2 { transition-delay: 0.2s; }
        .hero-delay-3 { transition-delay: 0.3s; }
        .hero-delay-4 { transition-delay: 0.4s; }
        .hero-delay-5 { transition-delay: 0.5s; }
        .hero-delay-6 { transition-delay: 0.6s; }
        .hero-delay-7 { transition-delay: 0.7s; }
      `}</style>

      <section className="hero-root" ref={heroRef}>
        {/* Ambient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />

        <div className="hero-inner">
          {/* Left: Copy */}
          <div>
            <div className="hero-animate hero-delay-1">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Tech-Oracle - AI Powered Tech Repairs
              </div>
            </div>

            <h1 className="hero-headline hero-animate hero-delay-2">
              Revive Your Tech.{" "}
              <span className="hero-headline-accent">
                Repairs at Your Fingertips.
              </span>
            </h1>

            <p className="hero-sub hero-animate hero-delay-3">
              From performance-boosting SSD upgrades to deep thermal cleaning,
              we provide professional solutions for a faster, cooler, and more
              reliable device.
            </p>

            <div className="hero-animate hero-delay-4">
              <button className="hero-cta-btn" onClick={handleBookRepair}>
                Book a Repair
                <span className="hero-cta-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="hero-trust hero-animate hero-delay-5">
              {["AI powered repair diagnosis", "Always available for repairs", "24/7 communication with technician"].map((item) => (
                <span className="hero-trust-item" key={item}>
                  <span className="hero-trust-check">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Service Cards */}
          <div className="hero-cards">
            {services.map((service, i) => (
              <div
                key={service.label}
                className={`hero-card hero-animate hero-delay-${i + 5}`}
              >
                <div className="hero-card-icon">{service.icon}</div>
                <p className="hero-card-label">{service.label}</p>
                <h3 className="hero-card-title">{service.title}</h3>
                <p className="hero-card-desc">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;