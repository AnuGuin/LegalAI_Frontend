import { redirect } from 'next/navigation';

export default function LawyerRegisterPage() {
  redirect('/auth/lawyer?action=register');
}