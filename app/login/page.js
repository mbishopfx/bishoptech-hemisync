import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: 'Sign In | NeuroSync.sys'
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginClient />
    </Suspense>
  );
}
