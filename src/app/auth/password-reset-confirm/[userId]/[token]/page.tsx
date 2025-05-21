import PasswordResetConfirmClient from "@/components/PasswordResetConfirmClient";

export type ParamsType = Promise<{ userId: string; token: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { userId, token } = await params;
  return <PasswordResetConfirmClient uid={userId} token={token} />;
}

export const dynamic = 'force-dynamic';