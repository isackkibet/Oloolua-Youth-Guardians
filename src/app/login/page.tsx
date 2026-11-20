import type { Metadata } from 'next';
import LoginScreen from './LoginScreen';

export const metadata: Metadata = {
  title: 'Guardian Hub sign in | Oloolua Youth Guardians',
  description: 'Sign in to the Oloolua Youth Guardians Guardian Hub to manage restoration and nursery records.',
};

export default function LoginPage() {
  return <LoginScreen />;
}
