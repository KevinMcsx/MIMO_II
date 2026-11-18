export const CONSOLE_USAGE_PAGE = 0xFF60;
export const CONSOLE_USAGE = 0x61;
export const LED_REPORT_ID = 1;
export const BUTTON_COUNT = 4;
export const OFF = '#000000';

const cueColors = {
  yellow: '#FFCC00',
  green: '#00CC55',
  blue: '#0088FF',
  red: '#FF3030',
};

export function encodeLedFrame(colors) {
  if (colors.length !== BUTTON_COUNT) throw new TypeError('Expected four button colors');
  const payload = new Uint8Array(BUTTON_COUNT * 3);
  colors.forEach((color, index) => {
    const hex = cueColors[color] ?? color;
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) {
      throw new TypeError('LED colors must be #RRGGBB');
    }
    const rgb = Number.parseInt(hex.slice(1), 16);
    payload.set([rgb >> 16, (rgb >> 8) & 255, rgb & 255], index * 3);
  });
  return payload;
}

export function isConsole(device) {
  return device.collections.some(collection =>
    collection.usagePage === CONSOLE_USAGE_PAGE && collection.usage === CONSOLE_USAGE &&
    collection.outputReports.some(report => report.reportId === LED_REPORT_ID &&
      report.items.every(item => item.reportSize === 8 && !item.isConstant) &&
      report.items.reduce((fields, item) => fields + item.reportCount, 0) === BUTTON_COUNT * 3)
  );
}

export function createLedLink(device, onError) {
  let pending;
  let running;
  let closed = false;

  async function drain() {
    while (pending) {
      const payload = pending;
      pending = undefined;
      try {
        await device.sendReport(LED_REPORT_ID, payload);
      } catch (error) {
        pending = undefined;
        if (!closed) onError(error);
      }
    }
  }

  function send(colors) {
    if (closed) return Promise.resolve();
    pending = encodeLedFrame(colors);
    if (!running) sendPending();
    return running;
  }

  function sendPending() {
    running = Promise.resolve().then(drain).finally(() => {
      running = undefined;
      if (pending && !closed) sendPending();
    });
  }

  return {
    send,
    async close() {
      if (closed) return;
      closed = true;
      pending = undefined;
      await running;
      if (!device.opened) return;
      try {
        await device.sendReport(LED_REPORT_ID, encodeLedFrame(Array(BUTTON_COUNT).fill(OFF)));
      } catch {
        // Unplugged devices cannot receive an all-off report.
      } finally {
        await device.close().catch(() => {});
      }
    },
  };
}
