'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EncryptionExplainer } from '@/components/EncryptionExplainer';
import { Shield, Lock, Key, Eye, Fingerprint, Zap, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden transition-colors">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-30 px-6 py-4 border-b-[3px] border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 flex items-center justify-center bg-[var(--yellow)] border-[3px] border-[var(--border)] shadow-[2px_2px_0_var(--shadow-color)]"
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--shadow-color)' }}
              whileTap={{ x: 1, y: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </motion.div>
            <span className="text-xl font-bold text-[var(--text)]">
              Password<span className="text-[var(--pink)]">Vault</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'How it works'].map((item) => (
              <motion.div key={item} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Link
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Decorative shapes */}
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: 12, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute top-32 left-16 w-24 h-24 bg-[var(--yellow)] border-[3px] border-[var(--border)] hidden lg:block"
        />
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: -6, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="absolute top-48 right-24 w-32 h-32 bg-[var(--pink)] border-[3px] border-[var(--border)] hidden lg:block"
        />
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: 45, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="absolute bottom-40 left-32 w-20 h-20 bg-[var(--sky)] border-[3px] border-[var(--border)] hidden lg:block"
        />
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: -12, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="absolute bottom-32 right-40 w-16 h-16 bg-[var(--mint)] border-[3px] border-[var(--border)] hidden lg:block"
        />

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[var(--mint)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]"
          >
            <Lock className="h-4 w-4" />
            <span className="text-sm font-bold">100% Secure • Your Data Stays Yours</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
          >
            <span className="block text-[var(--text)]">Your passwords,</span>
            <span className="block text-[var(--pink)]">totally safe.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Store all your passwords in one secure vault.
            <span className="font-bold text-[var(--text)]"> We never see your data</span> —
            <span className="text-[var(--pink)] font-bold"> ever.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/signup">
              <Button size="xl" className="min-w-[200px]">
                Start Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="#security">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { value: '256-bit', label: 'Encryption' },
              { value: '200K', label: 'Key Iterations' },
              { value: 'Zero', label: 'Knowledge', highlight: true },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-4 bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[4px_4px_0_var(--shadow-color)]"
                whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 var(--shadow-color)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className={`text-2xl md:text-3xl font-bold ${stat.highlight ? 'text-[var(--pink)]' : 'text-[var(--text)]'}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="h-6 w-6 text-[var(--text-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 bg-[var(--surface)] border-t-[3px] border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[var(--lavender)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-6">
              Everything you need
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Simple, secure, and designed for everyone. No technical knowledge required.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Key, title: 'One Master Password', description: 'Remember one password to access all your accounts.', color: 'var(--yellow)' },
              { icon: Lock, title: 'Bank-Level Security', description: 'AES-256 encryption keeps your data safe from hackers.', color: 'var(--sky)' },
              { icon: Shield, title: 'Zero Knowledge', description: "We can't see your passwords. Even if someone hacks us.", color: 'var(--mint)' },
              { icon: Eye, title: 'Works Everywhere', description: 'Access your vault from any browser on any device.', color: 'var(--pink)' },
              { icon: Fingerprint, title: 'Strong Protection', description: '200,000 iterations make it impossible to guess.', color: 'var(--lavender)' },
              { icon: Zap, title: 'Auto-Lock', description: 'Your vault locks automatically when you leave.', color: 'var(--orange)' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ x: -3, y: -3 }}
                className="group p-6 bg-[var(--background)] border-[3px] border-[var(--border)] shadow-[6px_6px_0_var(--shadow-color)]"
              >
                <motion.div
                  className="w-14 h-14 flex items-center justify-center border-[3px] border-[var(--border)] mb-4 shadow-[3px_3px_0_var(--shadow-color)]"
                  style={{ backgroundColor: feature.color }}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-7 w-7 text-[#1a1a1a]" />
                </motion.div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Encryption Explainer Section */}
      <EncryptionExplainer />

      {/* How it works Section */}
      <section id="how-it-works" className="relative py-24 px-6 bg-[var(--surface)] border-t-[3px] border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[var(--sky)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]">
                <span className="text-sm font-bold">🔐 Get Started</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-8">
                Simple as<br />
                <span className="text-[var(--pink)]">1, 2, 3</span>
              </h2>
              <div className="space-y-6">
                {[
                  { num: 1, title: 'Create your vault', desc: 'Sign up and set your master password.', color: 'var(--yellow)' },
                  { num: 2, title: 'Add your passwords', desc: 'Save logins for all your accounts.', color: 'var(--sky)' },
                  { num: 3, title: 'Access anywhere', desc: 'Log in from any device securely.', color: 'var(--mint)' },
                ].map((step, index) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <motion.div
                      className="w-10 h-10 flex items-center justify-center border-[3px] border-[var(--border)] font-bold text-lg shrink-0 shadow-[2px_2px_0_var(--shadow-color)]"
                      style={{ backgroundColor: step.color }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.num}
                    </motion.div>
                    <div>
                      <p className="font-bold text-[var(--text)]">{step.title}</p>
                      <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10"
              >
                <Link href="/signup">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                className="p-8 bg-[var(--background)] border-[3px] border-[var(--border)] shadow-[8px_8px_0_var(--shadow-color)]"
                whileHover={{ x: -4, y: -4, boxShadow: '12px 12px 0 var(--shadow-color)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Mock vault UI */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--surface)] border-[2px] border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--yellow)] border-[2px] border-[var(--border)]" />
                      <div>
                        <div className="font-bold text-sm text-[var(--text)]">Gmail</div>
                        <div className="text-xs text-[var(--text-muted)]">me@email.com</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">••••••••</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--surface)] border-[2px] border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--pink)] border-[2px] border-[var(--border)]" />
                      <div>
                        <div className="font-bold text-sm text-[var(--text)]">Twitter</div>
                        <div className="text-xs text-[var(--text-muted)]">@username</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">••••••••</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--surface)] border-[2px] border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--sky)] border-[2px] border-[var(--border)]" />
                      <div>
                        <div className="font-bold text-sm text-[var(--text)]">GitHub</div>
                        <div className="text-xs text-[var(--text-muted)]">developer</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">••••••••</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-[var(--yellow)] border-t-[3px] border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
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
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-[var(--surface)] border-t-[3px] border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--yellow)] border-[3px] border-[var(--border)]">
              <Shield className="h-4 w-4 text-[#1a1a1a]" />
            </div>
            <span className="text-sm font-bold text-[var(--text)]">PasswordVault</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 PasswordVault • Your passwords, totally safe.
          </p>
        </div>
      </footer>
    </div>
  );
}
