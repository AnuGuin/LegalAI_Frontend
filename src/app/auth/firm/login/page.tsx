import { redirect } from 'next/navigation';
export default function FirmLoginPage() {
  redirect('/auth/firm?action=login');
}