import PasswordResetConfirmClient from "@/components/PasswordResetConfirmClient";

export default function Page({ params }: { params: { uid: string; token: string } }) {
  const { uid, token } = params;
  return <PasswordResetConfirmClient uid={uid} token={token} />;
}

export const dynamic = 'force-dynamic';