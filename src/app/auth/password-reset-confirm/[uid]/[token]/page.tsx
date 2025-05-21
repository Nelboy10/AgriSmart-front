'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: { uid: string; token: string }
}

export default function PasswordResetConfirmPage({ params }: Props) {
  const { uid, token } = params;
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== reNewPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/reset_password_confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: newPassword, re_new_password: reNewPassword }),
      });
      if (res.ok) {
        setMessage('Mot de passe réinitialisé ! Redirection...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setMessage('Erreur lors de la réinitialisation. Le lien est peut-être expiré ou invalide.');
      }
    } catch (err) {
      setMessage('Erreur réseau.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-green-700 text-center">Nouveau mot de passe</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full text-gray-800 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full text-gray-800 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            value={reNewPassword}
            onChange={e => setReNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Changer le mot de passe'}
          </button>
        </form>
        {message && <div className="text-center text-sm text-gray-700 mt-2">{message}</div>}
      </div>
    </div>
  );
}