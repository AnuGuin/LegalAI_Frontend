import { redirect } from 'next/navigation';
export default function FirmRegisterPage() {
  redirect('/auth/firm?action=register');
}