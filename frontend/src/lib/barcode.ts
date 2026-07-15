// Barcode scanning: native BarcodeDetector with lazy ZXing fallback (SPEC §10).

const FORMATS = ["ean_13", "ean_8", "upc_a", "code_128", "qr_code"];

export interface ScannerHandle {
  stop(): void;
  setTorch(on: boolean): Promise<boolean>;
  torchSupported: boolean;
}

type OnDetect = (code: string) => void;

// Detection dedup window (serial mode scans many items) — SPEC §10.6.
const DEDUP_MS = 3000;

export async function startScanner(
  video: HTMLVideoElement,
  onDetect: OnDetect
): Promise<ScannerHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });
  video.srcObject = stream;
  await video.play();

  const track = stream.getVideoTracks()[0];
  const capabilities = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
    torch?: boolean;
  };
  const torchSupported = Boolean(capabilities.torch);

  let stopped = false;
  let last = "";
  let lastTs = 0;

  const emit = (code: string) => {
    const now = Date.now();
    if (code === last && now - lastTs < DEDUP_MS) return;
    last = code;
    lastTs = now;
    if (navigator.vibrate) navigator.vibrate(50);
    onDetect(code);
  };

  const stop = () => {
    stopped = true;
    stream.getTracks().forEach((t) => t.stop());
  };

  const setTorch = async (on: boolean): Promise<boolean> => {
    if (!torchSupported) return false;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as never] });
      return true;
    } catch {
      return false;
    }
  };

  // Native BarcodeDetector path.
  const BD = (window as unknown as { BarcodeDetector?: new (o: unknown) => {
    detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]>;
  } }).BarcodeDetector;

  if (BD) {
    const detector = new BD({ formats: FORMATS });
    const loop = async () => {
      if (stopped) return;
      try {
        const results = await detector.detect(video);
        if (results.length) emit(results[0].rawValue);
      } catch {
        /* frame not ready */
      }
      if (!stopped) setTimeout(loop, 100);
    };
    loop();
    return { stop, setTorch, torchSupported };
  }

  // Lazy ZXing fallback (separate chunk, only loaded when needed).
  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  const reader = new BrowserMultiFormatReader();
  const controls = await reader.decodeFromVideoElement(video, (result) => {
    if (result) emit(result.getText());
  });
  return {
    stop: () => {
      controls.stop();
      stop();
    },
    setTorch,
    torchSupported,
  };
}

export function isSecureForCamera(): boolean {
  return window.isSecureContext || location.hostname === "localhost";
}
