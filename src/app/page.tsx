'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, Eye, Fingerprint, Zap, ArrowRight, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-mesh overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cyber-grid" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-[oklch(0.50_0.30_300)] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 flex items-center justify-center border-2 border-[oklch(0.55_0.28_280)]">
                <Shield className="h-5 w-5 text-[oklch(0.75_0.18_195)]" />
              </div>
            </div>
            <span className="text-xl font-bold uppercase tracking-[0.2em] text-white">
              VAULT<span className="text-[oklch(0.75_0.18_195)]">_X</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm uppercase tracking-widest text-[oklch(0.45_0.02_270)] hover:text-white transition-colors">
              Protocol
            </Link>
            <Link href="#security" className="text-sm uppercase tracking-widest text-[oklch(0.45_0.02_270)] hover:text-white transition-colors">
              Security
            </Link>
            <Link href="#architecture" className="text-sm uppercase tracking-widest text-[oklch(0.45_0.02_270)] hover:text-white transition-colors">
              Architecture
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                ACCESS
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="neon" size="sm">
                INITIALIZE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
      >
        {/* Parallax glow orbs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, oklch(0.55 0.28 280) 0%, transparent 70%)',
            left: '20%',
            top: '20%',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, oklch(0.75 0.18 195) 0%, transparent 70%)',
            right: '10%',
            bottom: '30%',
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-[oklch(0.55_0.28_280)/0.5] bg-[oklch(0.55_0.28_280)/0.1]">
            <Lock className="h-3 w-3 text-[oklch(0.75_0.18_195)]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.75_0.18_195)] font-mono">
              ZERO-KNOWLEDGE PROTOCOL
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[0.9] mb-8">
            <span className="block text-white">YOUR SECRETS</span>
            <span className="block bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-[oklch(0.75_0.18_195)] bg-clip-text text-transparent">
              YOUR CONTROL
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[oklch(0.45_0.02_270)] font-mono max-w-2xl mx-auto mb-12 leading-relaxed">
            Military-grade encryption meets brutal simplicity.
            <span className="text-white"> We never see your passwords.</span>
            <span className="text-[oklch(0.75_0.18_195)]"> Ever.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" className="min-w-[200px]">
                ENTER VAULT
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="#security">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                VIEW PROTOCOL
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-[oklch(0.25_0.02_270)/0.5]">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">256</div>
              <div className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)] mt-2">BIT AES-GCM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">200K</div>
              <div className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)] mt-2">PBKDF2 ITERATIONS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[oklch(0.75_0.18_195)] font-mono">0</div>
              <div className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)] mt-2">KNOWLEDGE</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="h-6 w-6 text-[oklch(0.45_0.02_270)]" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-[oklch(0.25_0.02_270)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.45_0.02_270)] font-mono">
                // CORE_PROTOCOL
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-6">
              ENCRYPTED BY DESIGN
            </h2>
            <p className="text-[oklch(0.45_0.02_270)] font-mono max-w-2xl mx-auto">
              Every component engineered for absolute privacy. No backdoors. No compromises.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Key,
                title: 'MASTER KEY',
                description: 'Your master password never leaves your device. Period.',
                accent: 'oklch(0.55 0.28 280)',
              },
              {
                icon: Lock,
                title: 'AES-256-GCM',
                description: 'Military-grade encryption for every credential you store.',
                accent: 'oklch(0.75 0.18 195)',
              },
              {
                icon: Shield,
                title: 'ZERO KNOWLEDGE',
                description: 'We cannot read your data. Even if we wanted to.',
                accent: 'oklch(0.72 0.19 155)',
              },
              {
                icon: Eye,
                title: 'LOCAL DECRYPT',
                description: 'All decryption happens in your browser. Nowhere else.',
                accent: 'oklch(0.65 0.28 340)',
              },
              {
                icon: Fingerprint,
                title: 'PBKDF2-SHA256',
                description: '200,000 iterations make brute force attacks infeasible.',
                accent: 'oklch(0.75 0.18 85)',
              },
              {
                icon: Zap,
                title: 'AUTO-LOCK',
                description: 'Memory wipe after inactivity. Zero traces left behind.',
                accent: 'oklch(0.60 0.25 25)',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-[oklch(0.08_0.01_270)/0.8] backdrop-blur-xl border-2 border-[oklch(0.20_0.02_270)] transition-all duration-300 hover:border-[oklch(0.55_0.28_280)] hover:-translate-y-2"
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center border-2 mb-6"
                  style={{ borderColor: feature.accent }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.accent }} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[oklch(0.45_0.02_270)] font-mono leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="relative py-32 px-6 border-t border-[oklch(0.20_0.02_270)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-[oklch(0.25_0.02_270)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.45_0.02_270)] font-mono">
                  // SYSTEM_ARCHITECTURE
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white mb-8">
                ENGINEERED FOR<br />
                <span className="text-[oklch(0.75_0.18_195)]">PARANOID SECURITY</span>
              </h2>
              <div className="space-y-6 font-mono text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[oklch(0.75_0.18_195)] mt-2" />
                  <p className="text-[oklch(0.45_0.02_270)]">
                    <span className="text-white">CLIENT-SIDE CRYPTOGRAPHY</span> — All encryption operations
                    execute in your browser using the Web Crypto API.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[oklch(0.55_0.28_280)] mt-2" />
                  <p className="text-[oklch(0.45_0.02_270)]">
                    <span className="text-white">WRAPPED KEY ARCHITECTURE</span> — Your Vault Key is
                    encrypted before it ever touches our servers.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[oklch(0.72_0.19_155)] mt-2" />
                  <p className="text-[oklch(0.45_0.02_270)]">
                    <span className="text-white">MEMORY-ONLY SESSION</span> — Keys exist only in RAM.
                    Auto-lock wipes everything after timeout.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/signup">
                  <Button size="lg">
                    INITIALIZE VAULT
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="aspect-square border-2 border-[oklch(0.20_0.02_270)] p-8 bg-[oklch(0.08_0.01_270)/0.5] backdrop-blur-xl">
                {/* Key hierarchy visualization */}
                <div className="h-full flex flex-col justify-center space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center border-2 border-[oklch(0.75_0.18_195)] bg-[oklch(0.75_0.18_195)/0.1]">
                      <span className="text-[oklch(0.75_0.18_195)] font-mono text-xs">USER</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[oklch(0.75_0.18_195)] to-transparent" />
                    <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">MASTER_PASS</span>
                  </div>

                  <div className="flex items-center gap-4 pl-8">
                    <div className="w-16 h-16 flex items-center justify-center border-2 border-[oklch(0.55_0.28_280)] bg-[oklch(0.55_0.28_280)/0.1]">
                      <span className="text-[oklch(0.55_0.28_280)] font-mono text-xs">KEK</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-transparent" />
                    <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">PBKDF2_DERIVE</span>
                  </div>

                  <div className="flex items-center gap-4 pl-16">
                    <div className="w-16 h-16 flex items-center justify-center border-2 border-[oklch(0.72_0.19_155)] bg-[oklch(0.72_0.19_155)/0.1]">
                      <span className="text-[oklch(0.72_0.19_155)] font-mono text-xs">VK</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[oklch(0.72_0.19_155)] to-transparent" />
                    <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">VAULT_DECRYPT</span>
                  </div>

                  <div className="flex items-center gap-4 pl-24">
                    <div className="w-16 h-16 flex items-center justify-center border-2 border-white bg-white/5">
                      <span className="text-white font-mono text-xs">DATA</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/50 to-transparent" />
                    <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">ACCESSIBLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 border-t border-[oklch(0.20_0.02_270)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-6">
            READY TO<br />
            <span className="text-[oklch(0.75_0.18_195)]">TAKE CONTROL?</span>
          </h2>
          <p className="text-[oklch(0.45_0.02_270)] font-mono mb-10">
            Initialize your zero-knowledge vault in under 60 seconds.
          </p>
          <Link href="/signup">
            <Button size="xl" className="min-w-[280px]">
              INITIALIZE VAULT_X
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[oklch(0.20_0.02_270)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-[oklch(0.55_0.28_280)]">
              <Shield className="h-4 w-4 text-[oklch(0.55_0.28_280)]" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
              VAULT_X
            </span>
          </div>
          <p className="text-xs font-mono text-[oklch(0.35_0.02_270)]">
            © 2026 VAULT_X // ZERO-KNOWLEDGE PASSWORD MANAGEMENT
          </p>
        </div>
      </footer>
    </div>
  );
}
