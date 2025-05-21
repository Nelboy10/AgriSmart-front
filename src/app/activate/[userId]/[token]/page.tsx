import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ActivatePageProps {
  params: { userId: string; token: string };
}

export default function ActivatePage({ params }: ActivatePageProps) {
  const router = useRouter();
  const { userId, token } = params;

  useEffect(() => {
    // Appel à ton API pour activer l'utilisateur
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    })
      .then(async (res) => {
        if (res.ok) {
          // Activation réussie, redirige ou affiche un message
          router.push("/login?activated=1");
        } else {
          // Erreur d'activation
          alert("Erreur lors de l'activation du compte.");
        }
      });
  }, [userId, token, router]);

  return (
    <div>
      <h2>Activation en cours...</h2>
    </div>
  );
}