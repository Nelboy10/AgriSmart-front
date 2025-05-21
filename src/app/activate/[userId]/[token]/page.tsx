import ActivateClient from "./ActivateClient";

export default function Page({ params }: { params: { userId: string; token: string } }) {
  const { userId, token } = params;
  return <ActivateClient userId={userId} token={token} />;
}

export const dynamic = 'force-dynamic';