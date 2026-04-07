import { useState } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import Card from './Card';
import { AVAILABLE_GAMES } from '../../pages/SelectGames';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { translate } from '../../translations/index';

async function buildQRCanvas(route, idx, t) {
  const checkpoint = idx + 1;
  const game = AVAILABLE_GAMES.find((g) => g.route === route);
  const QR_SIZE = 300;
  const PADDING = 20;
  const qrDataUrl = await QRCode.toDataURL(
    `CHECKPOINT:${checkpoint}`,
    { width: QR_SIZE, margin: 1 },
  );
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = qrDataUrl; });
  const canvas = document.createElement('canvas');
  canvas.width = QR_SIZE + PADDING * 2;
  canvas.height = QR_SIZE + PADDING * 2 + 52;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, PADDING, PADDING, QR_SIZE, QR_SIZE);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Checkpoint ${checkpoint}`, canvas.width / 2, QR_SIZE + PADDING + 30);
  ctx.fillStyle = '#555555';
  ctx.font = '16px sans-serif';
  ctx.fillText((t && game?.labelKey ? t[game.labelKey] : null) ?? game?.labelKey ?? route, canvas.width / 2, QR_SIZE + PADDING + 54);
  return { canvas, game, checkpoint };
}

export default function GameSettingsCard({ session }) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadingIdx, setDownloadingIdx] = useState(null);

  const DIFFICULTY_LABEL = {
    easy: t.difficultyEasyLabel,
    normal: t.difficultyNormalLabel,
    hard: t.difficultyHardLabel,
  };

  const MODE_LABEL = {
    ordered: t.modeOrderedLabel,
    random: t.modeRandomLabel,
  };

  const handleDownloadSingle = async (route, i) => {
    setDownloadingIdx(i);
    try {
      const { canvas, game, checkpoint } = await buildQRCanvas(route, i, t);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `checkpoint-${checkpoint}-${game?.id ?? i + 1}.png`;
      a.click();
    } catch {
      toast.error(t.failedToGenerateQrCodes);
    } finally {
      setDownloadingIdx(null);
    }
  };

  const handleDownloadAllQR = async () => {
    const gameOrder = session?.gameOrder;
    if (!gameOrder?.length) return;
    setDownloading(true);
    try {
      for (let i = 0; i < gameOrder.length; i++) {
        const { canvas, game, checkpoint } = await buildQRCanvas(gameOrder[i], i, t);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `checkpoint-${checkpoint}-${game?.id ?? i + 1}.png`;
        a.click();
        if (i < gameOrder.length - 1) await new Promise((r) => setTimeout(r, 400));
      }
    } catch {
      toast.error(t.failedToGenerateQrCodes);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="rounded-xl p-4 flex flex-col gap-2">
      <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{t.gameSettings}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{t.difficulty}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {DIFFICULTY_LABEL[session?.difficulty] ?? session?.difficulty ?? '—'}
          </p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{t.mode}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {MODE_LABEL[session?.gameMode] ?? session?.gameMode ?? '—'}
          </p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{t.checkpoints}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {translate(t.qrCodesCount, { count: session?.gameOrder?.length || AVAILABLE_GAMES.length })}
          </p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{t.totalTime}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {translate(t.minutesShort, { count: session?.totalTime || 30 })}
          </p>
        </div>
      </div>

      {session?.gameOrder?.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {session.gameOrder.map((route, i) => {
            const game = AVAILABLE_GAMES.find((g) => g.route === route);
            return (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-subtext)' }}>
                <span className="font-bold w-4 shrink-0" style={{ color: 'var(--color-primary)' }}>{i + 1}.</span>
                <span className="shrink-0">{game?.emoji ?? '🎮'}</span>
                <span className="flex-1 truncate">{t[game?.labelKey] ?? game?.labelKey ?? route}</span>
                <button
                  onClick={() => handleDownloadSingle(route, i)}
                  disabled={downloadingIdx === i}
                  className="shrink-0 flex items-center justify-center rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                  style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
                  title={`Download QR #${i + 1}`}
                >
                  {downloadingIdx === i ? '…' : <Download size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleDownloadAllQR}
        disabled={downloading || !session?.gameOrder?.length}
        className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold disabled:opacity-50 mt-1"
        style={{ backgroundColor: '#1D4ED8', color: 'white' }}
      >
        <Download size={14} />
        {downloading ? t.downloading : t.downloadQrCodes}
      </button>
    </Card>
  );
}