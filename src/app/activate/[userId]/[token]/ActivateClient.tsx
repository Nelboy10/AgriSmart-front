"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  token: string;
}

export default function ActivateClient({ userId, token }: Props) {
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    }).then(async (res) => {
      if (res.ok) {
        router.push("/auth/login?activated=1");
      } else {
        alert("Erreur lors de l'activation du compte.");
      }
    });
  }, [userId, token, router]);

  return <h2>Activation en cours...</h2>;
}