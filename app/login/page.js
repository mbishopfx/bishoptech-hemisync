import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: 'Log In | HemiSync Studio'
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
