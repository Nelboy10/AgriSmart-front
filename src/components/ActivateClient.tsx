"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  token: string;
}

export default function ActivateClient({ userId, token }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/activation/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: userId, token }),
    }).then(async (res) => {
      if (res.ok) {
        router.push("/auth/login?activated=1");
      } else {
        setError("Erreur lors de l'activation du compte.");
      }
    });
  }, [userId, token, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>Activation en cours...</h2>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}