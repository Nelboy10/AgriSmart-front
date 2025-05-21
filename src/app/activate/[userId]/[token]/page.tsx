
import ActivateClient from "@/components/ActivateClient";

export type ParamsType = Promise<{ userId: string; token: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { userId, token } = await params;
  return <ActivateClient userId={userId} token={token} />;
}

export const dynamic = 'force-dynamic';