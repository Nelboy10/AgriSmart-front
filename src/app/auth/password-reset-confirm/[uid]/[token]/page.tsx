import PasswordResetConfirmClient from "@/components/PasswordResetConfirmClient";

export type ParamsType = Promise<{ uid: string; token: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { uid, token } = await params;
  return <PasswordResetConfirmClient uid={uid} token={token} />;
}

export const dynamic = 'force-dynamic';