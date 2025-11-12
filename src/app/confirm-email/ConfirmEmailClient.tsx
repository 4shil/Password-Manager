"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmEmailClient() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Support both hash params (access_token in fragment) and query params (OAuth code)
        const searchParams = new URLSearchParams(window.location.search);
        const queryCode = searchParams.get('code');
        let accessToken: string | null = null;
        let type: string | null = null;

        if (queryCode) {
          // Try to exchange OAuth-style code for a session using available supabase client helpers.
          try {
            // Preferred: exchangeCodeForSession may exist in some supabase-js versions
            if (typeof (supabase.auth as any).exchangeCodeForSession === 'function') {
              const resp = await (supabase.auth as any).exchangeCodeForSession({ code: queryCode });
              if (resp?.error) throw resp.error;
              accessToken = resp?.data?.session?.access_token ?? null;
              // type is not provided by code flow; assume signup for email confirmation
              type = 'signup';
            } else if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
              // Some clients expose getSessionFromUrl to parse the current URL
              const resp = await (supabase.auth as any).getSessionFromUrl();
              accessToken = resp?.data?.session?.access_token ?? null;
              type = searchParams.get('type') || 'signup';
            } else {
              throw new Error('Auth client lacks code-exchange helpers');
            }
          } catch (err: any) {
            console.error('Code exchange failed:', err);
            setStatus('error');
            setMessage('Invalid confirmation link (code exchange failed)');
            return;
          }
        } else {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          type = hashParams.get('type');
        }

        if (type === 'signup' && accessToken) {
          // Email confirmed successfully
          const { data, error } = await supabase.auth.getUser(accessToken as string);

          if (error) {
            setStatus('error');
            setMessage(error.message);
            return;
          }

          setStatus('success');
          setMessage('Email confirmed! You can now complete your vault setup.');

          // Redirect to setup vault (need to collect master password)
          setTimeout(() => {
            router.push('/setup-vault');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Failed to confirm email');
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {status === 'loading' && <Loader2 className="h-12 w-12 mb-2 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 mb-2 text-green-500" />}
          {status === 'error' && <XCircle className="h-12 w-12 mb-2 text-red-500" />}
          <CardTitle className="text-2xl">Email Confirmation</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to vault setup...
            </p>
          )}
          {status === 'error' && (
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
