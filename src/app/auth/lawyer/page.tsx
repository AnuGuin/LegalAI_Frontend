import LawyerAuthForm from '@/components/auth/lawyer-auth-form';

export default async function LawyerAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const action = resolvedSearchParams.action;
  const mode = action === 'register' ? 'register' : 'login';

  return <LawyerAuthForm mode={mode} />;
}