import type { Metadata } from 'next';
import AuthShell from '@frontend/components/auth/AuthShell';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset password | Oloolua Youth Guardians',
  description: 'Request a password reset link for your Oloolua Youth Guardians Guardian Hub account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email linked to your Guardian Hub account and we will send you a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
