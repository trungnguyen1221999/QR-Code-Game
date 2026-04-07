import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Download, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { sessionAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

export const AVAILABLE_GAMES = [
  {
    id: 'memory',
    route: '/memory-game',
    labelKey: 'memoryCardGame',
    descKey: 'memoryCardGameDesc',
    emoji: '🃏',
    bg: '#FEF3C7',
  },
  {
    id: 'simon',
    route: '/simon-game',
    labelKey: 'simonGame',
    descKey: 'simonGameDesc',
    emoji: '🎯',
    bg: '#DBEAFE',
  },
  {
    id: 'puzzle',
    route: '/puzzle-game',
    labelKey: 'puzzleGame',
    descKey: 'puzzleGameDesc',
    emoji: '🧩',
    bg: '#FCE7F3',
  },
  {
    id: 'whack',
    route: '/whack-a-mole',
    labelKey: 'whackAMole',
    descKey: 'whackAMoleDesc',
    emoji: '🔨',
    bg: '#D1FAE5',
  },
  {
    id: 'tower',
    route: '/tower-builder',
    labelKey: 'towerBuilder',
    descKey: 'towerBuilderDesc',
    emoji: '🏗️',
    bg: '#FEE2E2',
  },
  {
    id: 'quiz',
    route: '/combined-word-quiz',
    labelKey: 'quizGame',
    descKey: 'quizGameDesc',
    emoji: '📝',
    bg: '#EDE9FE',
  },
  {
    id: 'click-counter',
    route: '/click-counter-game',
    labelKey: 'clickCounterGame',
    descKey: 'clickCounterGameDesc',
    emoji: '👆',
    bg: '#FEF3C7',
  },
  {
    id: 'random-color-clicker',
    route: '/random-color-clicker',
    labelKey: 'randomColorClicker',
    descKey: 'randomColorClickerDesc',
    emoji: '🎨',
    bg: '#FDE68A',
  },
  {
    id: 'snake',
    route: '/snake-game',
    labelKey: 'snakeGame',
    descKey: 'snakeGameDesc',
    emoji: '🐍',
    bg: '#BBF7D0',
  },
  {
    id: 'click-to-shoot-targets',
    route: '/click-to-shoot-targets',
    labelKey: 'clickToShootTargets',
    descKey: 'clickToShootTargetsDesc',
    emoji: '🎯',
    bg: '#DBEAFE',
  },
  {
    id: 'maze',
    route: '/maze-game',
    labelKey: 'mazeGame',
    descKey: 'mazeGameDesc',
    emoji: '🧭',
    bg: '#E9D5FF',
  },
  {
    id: 'shape-matcher',
    route: '/shape-matcher',
    labelKey: 'shapeMatcher',
    descKey: 'shapeMatcherDesc',
    emoji: '⏺️',
    bg: '#FBCFE8',
  },
  {
    id: 'cross-road',
    route: '/cross-road-game',
    labelKey: 'crossRoad',
    descKey: 'crossRoadDesc',
    emoji: '🚗',
    bg: '#BBF7D0',
  },
];

const MAX_GAMES = AVAILABLE_GAMES.length;

function SortableChip({ id, idx, onRemove, onDownload, t }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const game = AVAILABLE_GAMES.find((g) => g.id === id);

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 cursor-grab active:cursor-grabbing touch-none"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
        backgroundColor: 'var(--color-info-bg)',
        color: 'var(--color-primary)',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      {idx + 1}. {game?.emoji} {t[game?.labelKey] ?? game?.labelKey}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDownload(id, idx); }}
        className="ml-1 opacity-60 hover:opacity-100"
        title="Download QR"
      >
        <Download size={10} />
      </button>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className="opacity-60 hover:opacity-100"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default function SelectGames() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { name, time, difficulty, gameMode } = location.state ?? {};
  const host = JSON.parse(localStorage.getItem('host') || 'null');

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showChips, setShowChips] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_GAMES) return prev;
      setShowChips(true);
      return [...prev, id];
    });
  };

  const remove = (id) => setSelected((prev) => prev.filter((x) => x !== id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelected((prev) => {
        const oldIdx = prev.indexOf(active.id);
        const newIdx = prev.indexOf(over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const buildQRCanvas = async (gameId, idx) => {
    const checkpoint = idx + 1;
    const game = AVAILABLE_GAMES.find((g) => g.id === gameId);
    const QR_SIZE = 300;
    const PADDING = 20;
    const qrDataUrl = await QRCode.toDataURL(`CHECKPOINT:${checkpoint}`, {
      width: QR_SIZE,
      margin: 1,
    });
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = qrDataUrl;
    });
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
    ctx.fillText(
      translate(t.checkpointLabel, { checkpoint }),
      canvas.width / 2,
      QR_SIZE + PADDING + 30
    );
    ctx.fillStyle = '#555555';
    ctx.font = '16px sans-serif';
    ctx.fillText(t[game?.labelKey] ?? '', canvas.width / 2, QR_SIZE + PADDING + 54);
    return { canvas, game, checkpoint };
  };

  const handleDownloadSingle = async (gameId, idx) => {
    try {
      const { canvas, game, checkpoint } = await buildQRCanvas(gameId, idx);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `checkpoint-${checkpoint}-${game?.id ?? idx + 1}.png`;
      a.click();
    } catch {
      // silently ignore
    }
  };

  const handleDownloadAllQR = async () => {
    if (selected.length === 0) return;
    setDownloading(true);
    try {
      for (let i = 0; i < selected.length; i++) {
        const { canvas, game, checkpoint } = await buildQRCanvas(selected[i], i);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `checkpoint-${checkpoint}-${game?.id}.png`;
        a.click();
        if (i < selected.length - 1) await new Promise((r) => setTimeout(r, 400));
      }
    } catch {
      toast.error(t.failedToGenerateQrCodes);
    } finally {
      setDownloading(false);
    }
  };

  const handleCreate = async () => {
    if (selected.length < 1) {
      toast.error(t.pleaseSelectAtLeastOneGame);
      return;
    }
    if (!host) {
      toast.error(t.notLoggedIn);
      navigate('/host-login');
      return;
    }
    setLoading(true);
    try {
      const gameOrder = selected.map((id) => AVAILABLE_GAMES.find((g) => g.id === id)?.route);
      const session = await sessionAPI.create({
        hostId: host._id,
        name,
        totalTime: time,
        difficulty,
        gameOrder,
        gameMode: gameMode || 'ordered',
      });
      localStorage.setItem('session', JSON.stringify(session));
      navigate('/host-dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = selected.length >= 1;

  return (
    <PageLayout back="/host-setup">
      <div className="pt-4 pb-36 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {t.selectGames}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}>
              {t.chooseGamesAndSetOrder}
            </p>
          </div>
          <div
            className="rounded-xl px-3 py-1.5 font-bold text-sm"
            style={{
              backgroundColor: canCreate ? '#D1FAE5' : '#FEF3E2',
              color: canCreate ? '#065F46' : 'var(--color-primary)',
            }}
          >
            {selected.length}/{MAX_GAMES}
          </div>
        </div>

        <Card className="rounded-2xl p-3">
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            {t.instructions}
          </p>
          <ul className="text-xs flex flex-col gap-0.5" style={{ color: 'var(--color-subtext)' }}>
            <li>{translate(t.tapGamesBelowToSelect, { max: MAX_GAMES })}</li>
            <li>{t.dragSelectedListToReorder}</li>
            <li>{t.numberOfCheckpointsEqualsGames}</li>
            <li>{t.downloadQrCodesForEachCheckpoint}</li>
          </ul>
        </Card>

        <div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {translate(t.availableGamesCount, { count: AVAILABLE_GAMES.length })}
          </p>
          <div className="flex flex-col gap-2">
            {AVAILABLE_GAMES.map((game) => {
              const isSelected = selected.includes(game.id);
              const order = selected.indexOf(game.id) + 1;
              return (
                <button
                  key={game.id}
                  onClick={() => toggle(game.id)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left w-full transition-all"
                  style={{
                    backgroundColor: isSelected ? '#F0FDF4' : 'var(--color-card, white)',
                    border: isSelected
                      ? '2px solid #22C55E'
                      : '1px solid var(--color-border, #E5E7EB)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: game.bg }}
                  >
                    {game.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      {t[game.labelKey]}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-subtext)', lineHeight: '1.4' }}
                    >
                      {t[game.descKey]}
                    </p>
                  </div>
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: isSelected ? '#22C55E' : 'transparent',
                      border: isSelected ? 'none' : '2px solid #D1D5DB',
                      color: 'white',
                    }}
                  >
                    {isSelected ? order : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-3"
        style={{
          backgroundColor: 'var(--color-bg, white)',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {selected.length > 0 ? (
          <>
            <button
              className="flex items-center justify-between w-full mb-2"
              onClick={() => setShowChips((v) => !v)}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {translate(t.selectedCheckpoints, {
                  count: selected.length,
                  suffix: selected.length > 1 ? t.checkpointPluralSuffix : '',
                })}
                {!showChips && (
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ color: 'var(--color-subtext)' }}
                  >
                    {t.tapToViewAndReorder}
                  </span>
                )}
              </p>
              {showChips ? (
                <ChevronDown size={16} style={{ color: 'var(--color-subtext)' }} />
              ) : (
                <ChevronUp size={16} style={{ color: 'var(--color-subtext)' }} />
              )}
            </button>

            {showChips && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={selected} strategy={rectSortingStrategy}>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selected.map((id, idx) => (
                      <SortableChip key={id} id={id} idx={idx} onRemove={remove} onDownload={handleDownloadSingle} t={t} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadAllQR}
                disabled={downloading}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: '#1D4ED8', color: 'white' }}
              >
                <Download size={14} />
                {downloading ? t.downloading : t.downloadQrCodes}
              </button>
              <Button variant="green" onClick={handleCreate} disabled={!canCreate || loading}>
                {loading
                  ? t.creating
                  : translate(t.createGameWithCheckpoints, { count: selected.length })}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-center py-1" style={{ color: 'var(--color-subtext)' }}>
            {t.tapGamesAboveToSelect}
          </p>
        )}
      </div>
    </PageLayout>
  );
}