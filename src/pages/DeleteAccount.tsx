import React, { useState } from 'react';

const DeleteAccount: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    setStatusMessage('');

    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.token) {
        throw new Error('Vérifiez vos identifiants.');
      }

      const delRes = await fetch('/api/mobile/account/deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ password })
      });
      const delData = await delRes.json();
      if (!delRes.ok) {
        throw new Error(delData.message || 'Demande indisponible.');
      }

      setStatusMessage(delData.message || 'Votre demande de suppression a été enregistrée.');
      setPassword('');
    } catch (err: any) {
      setStatusMessage(err instanceof Error ? err.message : 'Service indisponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-lg w-full space-y-5 bg-slate-900/80 p-8 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white">PRONOBOX — Suppression du compte</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Demandez la suppression de votre compte et des données associées. Le support examinera la demande et vous contactera pour son suivi. Les obligations de conservation applicables sont indiquées dans la politique de confidentialité.
        </p>

        <label className="block text-xs font-semibold text-slate-300 space-y-1">
          <span>E-mail ou téléphone</span>
          <input
            className="block w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-300 space-y-1">
          <span>Mot de passe</span>
          <input
            className="block w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
          />
          <span>Je confirme demander la suppression de mon compte PRONOBOX.</span>
        </label>

        {statusMessage && (
          <p role="status" className="text-xs font-medium text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 font-bold rounded-lg px-5 py-3 text-sm transition-colors disabled:opacity-50 cursor-pointer"
          disabled={loading || !confirmed}
        >
          {loading ? 'Enregistrement…' : 'Envoyer la demande'}
        </button>

        <p className="text-xs text-slate-400 text-center pt-2 border-t border-slate-800">
          Vous ne pouvez plus vous connecter ? Contactez le support WhatsApp au <span className="text-white font-bold">+22664992126</span>, sans transmettre votre mot de passe.
        </p>
      </form>
    </main>
  );
};

export default DeleteAccount;
