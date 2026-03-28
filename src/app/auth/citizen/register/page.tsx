import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/auth/citizen?action=register');
}
