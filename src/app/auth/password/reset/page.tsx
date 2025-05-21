'use client';

import { useState } from 'react';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/reset_password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage("Un email de réinitialisation a été envoyé si l'adresse existe.");
      } else {
        setMessage("Erreur lors de la demande. Vérifiez l'adresse email.");
      }
    } catch (err) {
      setMessage("Erreur réseau.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-green-700 text-center">Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Votre email"
            className="w-full text-gray-800 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
        {message && <div className="text-center text-sm text-gray-700 mt-2">{message}</div>}
      </div>
    </div>
  );
}