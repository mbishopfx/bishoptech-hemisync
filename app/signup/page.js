import { Suspense } from 'react';
import { SignupClient } from './SignupClient';

export const metadata = {
  title: 'Sign Up | NeuroSync.sys'
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupClient />
    </Suspense>
  );
}
