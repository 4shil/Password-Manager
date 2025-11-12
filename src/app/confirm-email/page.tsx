"use client";

// Prevent Next.js from prerendering this page (it relies on client-only hooks)
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token from URL hash (Supabase redirects with hash params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          // Email confirmed successfully
          const { data, error } = await supabase.auth.getUser(accessToken);

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
  }, [router, searchParams]);

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
