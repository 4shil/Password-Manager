import dynamic from 'next/dynamic';

// Render the client-only confirmation logic via a dynamic import with SSR disabled.
const ConfirmEmailClient = dynamic(() => import('./ConfirmEmailClient'), {
  ssr: false,
});

export default function Page() {
  return <ConfirmEmailClient />;
}
