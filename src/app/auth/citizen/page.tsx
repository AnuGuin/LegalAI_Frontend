import AuthenticationWrapper from "@/components/auth/auth-wrapper";

export default async function CitizenAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const action = resolvedSearchParams.action;
  const mode = action === 'register' ? 'register' : 'login';

  return <AuthenticationWrapper mode={mode} />;
}