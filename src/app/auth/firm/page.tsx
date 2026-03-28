import FirmAuthForm from '@/components/auth/firm-auth-form';

export default async function FirmAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const action = resolvedSearchParams.action;
  const mode = action === 'register' ? 'register' : 'login';

  return <FirmAuthForm mode={mode} />;
}