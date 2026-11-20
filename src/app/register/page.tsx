import type { Metadata } from 'next';
import AuthShell from '@frontend/components/auth/AuthShell';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create account | Oloolua Youth Guardians',
  description: 'Create a Guardian Hub account to request access to Oloolua Youth Guardians conservation records.',
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your Guardian account"
      description="Register to request access to seedling records, restoration activity and nursery work."
    >
      <RegisterForm />
    </AuthShell>
  );
}
