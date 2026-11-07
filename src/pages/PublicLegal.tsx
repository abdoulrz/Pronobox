import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PublicLegalProps {
  type: 'privacy' | 'terms';
}

const PublicLegal: React.FC<PublicLegalProps> = ({ type }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/mobile/legal')
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (isMounted) setContent(data[type] || '');
      })
      .catch(() => {
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <article className="mx-auto max-w-3xl space-y-5">
        <Link to="/" className="text-brand-green font-bold text-sm hover:underline">
          ← Retour à PRONOBOX
        </Link>
        <h1 className="text-3xl font-bold">
          {type === 'privacy' ? 'Politique de confidentialité' : 'Conditions d’utilisation'}
        </h1>
        <div className="whitespace-pre-wrap leading-7 text-slate-300 text-sm">
          {error ? 'Ce document est momentanément indisponible.' : content || 'Chargement…'}
        </div>
      </article>
    </main>
  );
};

export default PublicLegal;
