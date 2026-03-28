import { redirect } from 'next/navigation';
export default function LoginPage() {
  redirect('/auth/citizen?action=login');
}
