import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
type InstallMode = 'none' | 'insecure' | 'ios' | 'mobile';

export default function Install() {
  const [mode, setMode] = useState<InstallMode>('none');
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    if (!window.isSecureContext) setMode('insecure');
    else {
      const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
      setMode(ios ? 'ios' : /Android/i.test(navigator.userAgent) ? 'mobile' : 'none');
    }

    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { /* The browser keeps its own install option in the menu. */ }
    finally { setPrompt(null); }
  };

  if (installed || (mode === 'none' && !prompt)) return null;
  const message = mode === 'insecure'
    ? 'Buka situs melalui alamat HTTPS agar bisa dipasang sebagai aplikasi.'
    : mode === 'ios'
      ? 'Di Safari, ketuk Bagikan lalu Tambahkan ke Layar Utama.'
      : 'Di menu browser (⋮), pilih Instal aplikasi atau Tambahkan ke layar utama.';
  return <aside className="install-tip" aria-label="Pasang aplikasi">
    <span className="install-tip__icon" aria-hidden="true">📲</span>
    <div><strong>Pasang Taman Main</strong><p>{prompt ? 'Main lebih mudah dari layar utama ponsel.' : message}</p></div>
    {prompt && <button className="b2" onClick={install}>Pasang</button>}
  </aside>;
}
