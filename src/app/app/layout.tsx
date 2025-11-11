import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vault | Password Manager',
  description: 'Secure zero-knowledge password vault',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
