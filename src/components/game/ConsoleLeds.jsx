import { useEffect, useRef, useState } from 'react';
import { Usb } from 'lucide-react';
import { BUTTON_COUNT, CONSOLE_USAGE, CONSOLE_USAGE_PAGE, OFF, createLedLink, isConsole } from '@/lib/consoleHid';
import { useTranslation } from '@/components/utils/translations';

export default function ConsoleLeds({ color = OFF, cueStep, dark = false }) {
  const t = useTranslation();
  const [status, setStatus] = useState('idle');
  const [name, setName] = useState('');
  const connection = useRef(null);
  const generation = useRef(0);
  const hid = typeof navigator !== 'undefined' && navigator.hid;

  useEffect(() => {
    function detached(event) {
      if (connection.current?.device !== event.device) return;
      connection.current = null;
      setStatus('disconnected');
    }

    hid?.addEventListener('disconnect', detached);
    return () => {
      generation.current++;
      hid?.removeEventListener('disconnect', detached);
      const current = connection.current;
      connection.current = null;
      void current?.link.close();
    };
  }, [hid]);

  useEffect(() => {
    if (status !== 'connected') return;
    const link = connection.current?.link;
    const frame = Array(BUTTON_COUNT).fill(color ?? OFF);
    if (cueStep == null || !color || color === OFF) {
      void link?.send(frame);
      return;
    }

    // A short dark gap keeps adjacent repeats of the same color distinct.
    void link?.send(Array(BUTTON_COUNT).fill(OFF));
    const timer = setTimeout(() => void link?.send(frame), 90);
    return () => clearTimeout(timer);
  }, [color, cueStep, status]);

  async function connect() {
    const attempt = ++generation.current;
    setStatus('connecting');
    let selected;
    try {
      [selected] = await hid.requestDevice({
        filters: [{ usagePage: CONSOLE_USAGE_PAGE, usage: CONSOLE_USAGE }],
      });
      if (attempt !== generation.current) return;
      if (!selected) {
        setStatus('idle');
        return;
      }
      if (!isConsole(selected)) {
        setStatus('incompatible');
        return;
      }
      if (!selected.opened) await selected.open();
      if (attempt !== generation.current) {
        await selected.close();
        return;
      }
      const link = createLedLink(selected, () => {
        if (connection.current?.link !== link) return;
        connection.current = null;
        setStatus('closing');
        void link.close().then(() => {
          if (attempt === generation.current) setStatus('error');
        });
      });
      connection.current = { device: selected, link };
      setName(selected.productName || t('hidConsole'));
      setStatus('connected');
    } catch (error) {
      if (attempt !== generation.current) return;
      if (selected?.opened) await selected.close().catch(() => {});
      if (attempt === generation.current) setStatus(error.name === 'NotFoundError' ? 'idle' : 'error');
    }
  }

  async function disconnect() {
    const attempt = ++generation.current;
    const current = connection.current;
    connection.current = null;
    setStatus('closing');
    await current?.link.close();
    if (attempt === generation.current) setStatus('idle');
  }

  const group = dark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700';
  const buttonStyle = 'inline-flex items-center gap-2 rounded-lg border border-current px-3 py-1.5 font-medium focus-visible:outline focus-visible:outline-offset-2 disabled:opacity-60';
  const messages = {
    incompatible: 'hidIncompatible',
    disconnected: 'hidDisconnected',
    error: 'hidError',
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${group}`}>
      {!hid ? <span>{t('hidUnsupported')}</span> : <>
        <button type="button" className={buttonStyle} disabled={['connecting', 'closing'].includes(status)}
          onClick={status === 'connected' ? disconnect : connect}>
          <Usb className="size-4" aria-hidden="true" />
          {t(status === 'connected' ? 'hidDisconnect' : status === 'connecting' ? 'hidConnecting' : status === 'closing' ? 'hidClosing' : 'hidConnect')}
        </button>
        <span role="status">{status === 'connected' ? name : messages[status] ? t(messages[status]) : ''}</span>
      </>}
    </div>
  );
}
