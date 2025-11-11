import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Lock, Eye, Github } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">ZK Password Manager</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Zero-Knowledge Password Management
            </h2>
            <p className="text-xl text-muted-foreground">
              Your passwords, encrypted client-side. No plaintext ever leaves
              your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 mb-2" />
                <CardTitle>Client-Side Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All encryption happens in your browser using AES-256-GCM. Your
                  master password never leaves your device.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2" />
                <CardTitle>Zero-Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We can't read your passwords. Even if our servers are
                  compromised, your data remains encrypted.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 mb-2" />
                <CardTitle>Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fully transparent code. Audit the security yourself and verify
                  our zero-knowledge claims.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <Button asChild size="lg">
              <Link href="/signup">Create Your Vault</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with Next.js, Supabase, and Web Crypto API.{' '}
            <a
              href="https://github.com"
              className="underline inline-flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
