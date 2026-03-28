import { redirect } from 'next/navigation';

export default function LawyerLoginPage() {
  redirect('/auth/lawyer?action=login');
}