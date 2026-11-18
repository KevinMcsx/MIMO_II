import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '@/components/utils/translations';

export default function InstallLoopyBrain() {
  const t = useTranslation();
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const ready = event => setPromptEvent(event);
    const installed = () => setPromptEvent(null);
    window.addEventListener('beforeinstallprompt', ready);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', ready);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  if (!promptEvent) return null;

  function install() {
    setPromptEvent(null);
    void promptEvent.prompt().catch(() => {});
  }

  return <button type="button" onClick={install} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-indigo-800">
    <Download className="size-4" aria-hidden="true" />
    {t('installLoopyBrain')}
  </button>;
}
