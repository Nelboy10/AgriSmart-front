'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivatePage({ params }: { params: { userId: string; token: string } }) {
  const router = useRouter();
  const { userId, token } = params;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    })
      .then(async (res) => {
        if (res.ok) {
          router.push("/auth/login?activated=1");
        } else {
          // Gérer l’erreur
        }
      });
  }, [userId, token, router]);

  return (
    <div>
      <h2>Activation en cours...</h2>
    </div>
  );
}