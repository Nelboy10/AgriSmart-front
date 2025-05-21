import ActivateClient from "./ActivateClient";

interface ActivatePageProps {
  params: { userId: string; token: string };
}

export default function ActivatePage({ params }: ActivatePageProps) {
  const { userId, token } = params;

  return <ActivateClient userId={userId} token={token} />;
}