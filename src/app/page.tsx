import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Lock, Eye, Github, Sparkles, Zap, KeyRound, Fingerprint } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="hero-mesh" />
      <div className="noise" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-primary/10 glow-ring">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              ZK Vault
            </h1>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost" className="hover-scale">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="gradient-primary hover-scale press shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/signup">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8 fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-muted-foreground">Open Source</span>
              <span className="text-foreground">Zero-Knowledge Security</span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="block">Your passwords,</span>
                <span className="gradient-text">encrypted forever.</span>
              </h2>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Military-grade encryption that happens entirely in your browser. 
                No plaintext ever leaves your device.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="gradient-primary hover-scale press shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6 rounded-xl">
                <Link href="/signup">
                  <KeyRound className="h-5 w-5 mr-2" />
                  Create Your Vault
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glass-button hover-scale text-lg px-8 py-6 rounded-xl">
                <Link href="https://github.com/4shil/Password-Manager" target="_blank">
                  <Github className="h-5 w-5 mr-2" />
                  View Source
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-primary" />
                <span>PBKDF2 200k iterations</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Auto-lock protection</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold">
                Security you can <span className="gradient-text">trust</span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with modern cryptography and zero-knowledge architecture
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 stagger-children">
              {/* Feature 1 */}
              <Card className="card-premium group hover-lift">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:glow-primary transition-all">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Client-Side Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    All encryption happens in your browser using AES-256-GCM. Your
                    master password never leaves your device — ever.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="card-premium group hover-lift">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:glow-accent transition-all">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Zero-Knowledge Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    We can&apos;t read your passwords. Even if our servers are
                    compromised, your data remains fully encrypted.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="card-premium group hover-lift">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:glow-success transition-all">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Fully Open Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Transparent code you can audit. Verify our zero-knowledge
                    claims and security implementation yourself.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold">
                How it <span className="gradient-text">works</span>
              </h3>
            </div>

            <div className="space-y-8">
              {/* Step items */}
              {[
                {
                  step: '01',
                  title: 'Create Your Vault',
                  description: 'Sign up with email and create a strong master password. This password never leaves your browser.'
                },
                {
                  step: '02',
                  title: 'Key Derivation',
                  description: 'Your master password is processed through PBKDF2 with 200,000 iterations to create your encryption key.'
                },
                {
                  step: '03',
                  title: 'Store Securely',
                  description: 'Passwords are encrypted with AES-256-GCM before being stored. Only encrypted blobs reach our servers.'
                },
                {
                  step: '04',
                  title: 'Access Anywhere',
                  description: 'Unlock your vault on any device. Decryption happens locally — your secrets stay secret.'
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl glass flex items-center justify-center text-2xl font-bold text-primary group-hover:gradient-primary group-hover:text-white transition-all">
                    {item.step}
                  </div>
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xl font-semibold">{item.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 gradient-primary opacity-90" />
              <div className="absolute inset-0 noise opacity-10" />
              
              {/* Content */}
              <div className="relative z-10 text-center py-16 px-8 text-white">
                <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                  Ready to secure your passwords?
                </h3>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of users who trust ZK Vault with their most sensitive credentials.
                </p>
                <Button asChild size="lg" variant="secondary" className="hover-scale press shadow-xl text-lg px-8 py-6 rounded-xl">
                  <Link href="/signup">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get Started for Free
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 glass">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span>ZK Vault</span>
              <span className="text-border">•</span>
              <span>Zero-Knowledge Password Manager</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Built with Next.js, Supabase, and Web Crypto API</span>
              <a
                href="https://github.com/4shil/Password-Manager"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
