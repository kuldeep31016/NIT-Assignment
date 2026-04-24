import { useEffect, useRef } from 'react';

const GOOGLE_SRC = 'https://accounts.google.com/gsi/client';

function loadScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR not supported'));
    if (window.google?.accounts?.id) return resolve(window.google);
    const existing = document.querySelector(`script[src="${GOOGLE_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = GOOGLE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleAuthButton({ onCredential, disabled, text = 'signin_with' }) {
  const containerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;
    let cancelled = false;
    loadScript()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredential(response.credential);
          }
        });
        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientId, text, onCredential]);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/60 p-3 text-center text-xs text-ink-500">
        Set <code className="font-mono text-ink-700">VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <div ref={containerRef} />
    </div>
  );
}
