import { Suspense } from 'react';
import { SignupClient } from './SignupClient';

export const metadata = {
  title: 'Sign Up | HemiSync.sys'
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupClient />
    </Suspense>
  );
}
