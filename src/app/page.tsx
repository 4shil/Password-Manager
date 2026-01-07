'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, Eye, Fingerprint, Zap, ArrowRight, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] overflow-hidden">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 border-b-[3px] border-[#1a1a1a] bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0_#1a1a1a]">
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <span className="text-xl font-bold text-[#1a1a1a]">
              Password<span className="text-[#FF6B9D]">Vault</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-[#666666] hover:text-[#1a1a1a] transition-colors">
              Features
            </Link>
            <Link href="#security" className="text-sm font-bold text-[#666666] hover:text-[#1a1a1a] transition-colors">
              Security
            </Link>
            <Link href="#how-it-works" className="text-sm font-bold text-[#666666] hover:text-[#1a1a1a] transition-colors">
              How it works
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="pink" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Decorative shapes */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-[#FFE156] border-[3px] border-[#1a1a1a] rotate-12 hidden lg:block animate-float" />
        <div className="absolute top-48 right-24 w-32 h-32 bg-[#FF6B9D] border-[3px] border-[#1a1a1a] -rotate-6 hidden lg:block" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-[#7DD3FC] border-[3px] border-[#1a1a1a] rotate-45 hidden lg:block" />
        <div className="absolute bottom-32 right-40 w-16 h-16 bg-[#A0F5D3] border-[3px] border-[#1a1a1a] -rotate-12 hidden lg:block animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-8 w-12 h-12 bg-[#C4B5FD] border-[3px] border-[#1a1a1a] rotate-6 hidden lg:block" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[#A0F5D3] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a]">
            <Lock className="h-4 w-4 text-[#1a1a1a]" />
            <span className="text-sm font-bold text-[#1a1a1a]">
              100% Secure • Your Data Stays Yours
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            <span className="block text-[#1a1a1a]">Your passwords,</span>
            <span className="block text-[#FF6B9D]">totally safe.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#666666] max-w-2xl mx-auto mb-12 leading-relaxed">
            Store all your passwords in one secure vault.
            <span className="font-bold text-[#1a1a1a]"> We never see your data</span> —
            <span className="text-[#FF6B9D] font-bold"> ever.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="xl" className="min-w-[200px]">
                Start Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a]">
              <div className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">256-bit</div>
              <div className="text-sm text-[#666666]">Encryption</div>
            </div>
            <div className="p-4 bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a]">
              <div className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">200K</div>
              <div className="text-sm text-[#666666]">Key Iterations</div>
            </div>
            <div className="p-4 bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#FFE156]">
              <div className="text-2xl md:text-3xl font-bold text-[#FF6B9D]">Zero</div>
              <div className="text-sm text-[#666666]">Knowledge</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="h-6 w-6 text-[#999999]" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 bg-white border-t-[3px] border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[#C4B5FD] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a]">
              <span className="text-sm font-bold text-[#1a1a1a]">
                ✨ Features
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-6">
              Everything you need
            </h2>
            <p className="text-[#666666] max-w-xl mx-auto">
              Simple, secure, and designed for everyone. No technical knowledge required.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Key,
                title: 'One Master Password',
                description: 'Remember one password to access all your accounts. Simple as that.',
                color: '#FFE156',
              },
              {
                icon: Lock,
                title: 'Bank-Level Security',
                description: 'AES-256 encryption keeps your data safe from hackers.',
                color: '#7DD3FC',
              },
              {
                icon: Shield,
                title: 'Zero Knowledge',
                description: "We can't see your passwords. Even if someone hacks us, your data is safe.",
                color: '#A0F5D3',
              },
              {
                icon: Eye,
                title: 'Works Everywhere',
                description: 'Access your vault from any browser on any device.',
                color: '#FF6B9D',
              },
              {
                icon: Fingerprint,
                title: 'Strong Protection',
                description: '200,000 iterations make it impossible to guess your password.',
                color: '#C4B5FD',
              },
              {
                icon: Zap,
                title: 'Auto-Lock',
                description: 'Your vault locks automatically when you leave. No traces left behind.',
                color: '#FFB74D',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-[#FFFDF5] border-[3px] border-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#1a1a1a]"
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 flex items-center justify-center border-[3px] border-[#1a1a1a] mb-4 shadow-[3px_3px_0_#1a1a1a]"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="h-7 w-7 text-[#1a1a1a]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="relative py-24 px-6 border-t-[3px] border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[#7DD3FC] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a]">
                <span className="text-sm font-bold text-[#1a1a1a]">
                  🔐 How it works
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8">
                Built for your<br />
                <span className="text-[#FF6B9D]">peace of mind</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] font-bold text-sm shrink-0">1</div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">Create your vault</p>
                    <p className="text-sm text-[#666666]">Sign up and set your master password. This is the only password you'll need to remember.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#7DD3FC] border-[3px] border-[#1a1a1a] font-bold text-sm shrink-0">2</div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">Add your passwords</p>
                    <p className="text-sm text-[#666666]">Store logins for all your accounts. Everything is encrypted on your device before it's saved.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#A0F5D3] border-[3px] border-[#1a1a1a] font-bold text-sm shrink-0">3</div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">Access anywhere</p>
                    <p className="text-sm text-[#666666]">Log in from any device and your passwords are ready. Only you can decrypt them.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/signup">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="p-8 bg-white border-[3px] border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a]">
                {/* Visual representation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
                      <span className="text-sm font-bold">You</span>
                    </div>
                    <div className="flex-1 h-[3px] bg-[#1a1a1a]" />
                    <span className="text-sm font-bold text-[#666666]">Master Password</span>
                  </div>

                  <div className="flex items-center gap-4 pl-8">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#7DD3FC] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
                      <span className="text-sm font-bold">Key</span>
                    </div>
                    <div className="flex-1 h-[3px] bg-[#1a1a1a]" />
                    <span className="text-sm font-bold text-[#666666]">Encryption</span>
                  </div>

                  <div className="flex items-center gap-4 pl-16">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#A0F5D3] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
                      <span className="text-sm font-bold">Vault</span>
                    </div>
                    <div className="flex-1 h-[3px] bg-[#1a1a1a]" />
                    <span className="text-sm font-bold text-[#666666]">Decryption</span>
                  </div>

                  <div className="flex items-center gap-4 pl-24">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#FF6B9D] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
                      <span className="text-sm font-bold">Data</span>
                    </div>
                    <div className="flex-1 h-[3px] bg-[#1a1a1a]" />
                    <span className="text-sm font-bold text-[#666666]">Your Passwords</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-[#FFE156] border-t-[3px] border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-6">
            Ready to get started?
          </h2>
          <p className="text-[#1a1a1a] mb-10 text-lg">
            Create your secure vault in under 60 seconds. It's free!
          </p>
          <Link href="/signup">
            <Button variant="outline" size="xl" className="min-w-[280px] bg-white">
              Create Free Account
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-white border-t-[3px] border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a]">
              <Shield className="h-4 w-4 text-[#1a1a1a]" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">
              PasswordVault
            </span>
          </div>
          <p className="text-sm text-[#666666]">
            © 2026 PasswordVault • Your passwords, totally safe.
          </p>
        </div>
      </footer>
    </div>
  );
}
