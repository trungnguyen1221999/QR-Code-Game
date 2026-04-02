import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Download, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
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

export const AVAILABLE_GAMES = [
  {
    id: 'memory',
    route: '/memory-game',
    label: 'Memory card game',
    desc: 'Match pairs of cards by remembering their position',
    emoji: '🃏',
    bg: '#FEF3C7',
  },
  {
    id: 'simon',
    route: '/simon-game',
    label: 'Simon game',
    desc: 'Remember and repeat the pattern as long as possible.',
    emoji: '🎯',
    bg: '#DBEAFE',
  },
  {
    id: 'puzzle',
    route: '/puzzle-game',
    label: 'Puzzle game',
    desc: 'Arrange the puzzle pieces to form a meaningful picture',
    emoji: '🧩',
    bg: '#FCE7F3',
  },
  {
    id: 'whack',
    route: '/whack-a-mole',
    label: 'Whack-a-Mole',
    desc: 'Hit as many moles as possible in a limited time',
    emoji: '🔨',
    bg: '#D1FAE5',
  },
  {
    id: 'tower',
    route: '/tower-builder',
    label: 'Tower builder',
    desc: 'Build as high as possible without the tower falling',
    emoji: '🏗️',
    bg: '#FEE2E2',
  },
  {
    id: 'quiz',
    route: '/combined-word-quiz',
    label: 'Quiz game',
    desc: 'Guess the correct word or phrase they represent',
    emoji: '📝',
    bg: '#EDE9FE',
  },
  {
    id: 'click-counter',
    route: '/click-counter-game',
    label: 'Click Counter Game',
    desc: 'Tap as fast as you can and reach the target count before time runs out',
    emoji: 'ðŸ–±ï¸',
    bg: '#FEF3C7',
  },
  {
    id: 'random-color-clicker',
    route: '/random-color-clicker',
    label: 'Random Color Clicker',
    desc: 'Tap the button that matches the text color, not the written word',
    emoji: '🎨',
    bg: '#FDE68A',
  },
];

const MAX_GAMES = AVAILABLE_GAMES.length;

// ── Sortable chip inside the bottom panel ─────────────────────
function SortableChip({ id, idx, onRemove }) {
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
      {idx + 1}. {game?.emoji} {game?.label}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className="ml-0.5 opacity-60"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function SelectGames() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, time, difficulty, gameMode } = location.state ?? {};
  const host = JSON.parse(localStorage.getItem('host') || 'null');

  const [selected, setSelected] = useState([]); // ordered array of game ids
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showChips, setShowChips] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
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
    ctx.fillText(game?.label ?? '', canvas.width / 2, QR_SIZE + PADDING + 54);
    return { canvas, game, checkpoint };
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
      toast.error('Failed to generate QR codes');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreate = async () => {
    if (selected.length < 1) {
      toast.error('Please select at least 1 game');
      return;
    }
    if (!host) {
      toast.error('Not logged in');
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              Select Games
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}>
              Choose games and set order
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

        {/* Instructions */}
        <Card className="rounded-2xl p-3">
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            ℹ️ Instructions
          </p>
          <ul className="text-xs flex flex-col gap-0.5" style={{ color: 'var(--color-subtext)' }}>
            <li>• Tap games below to select (max {MAX_GAMES})</li>
            <li>• Drag ≡ in the selected list to reorder checkpoints</li>
            <li>• Number of checkpoints = number of games selected</li>
            <li>• Download QR codes for each checkpoint</li>
          </ul>
        </Card>

        {/* Game list */}
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Available Games ({AVAILABLE_GAMES.length})
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
                      {game.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-subtext)', lineHeight: '1.4' }}
                    >
                      {game.desc}
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

      {/* Sticky bottom panel */}
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
            {/* Title row — tap to expand/collapse chips */}
            <button
              className="flex items-center justify-between w-full mb-2"
              onClick={() => setShowChips((v) => !v)}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                ✅ Selected ({selected.length} checkpoint{selected.length > 1 ? 's' : ''})
                {!showChips && (
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-subtext)' }}>
                    — tap to view & reorder
                  </span>
                )}
              </p>
              {showChips ? <ChevronDown size={16} style={{ color: 'var(--color-subtext)' }} /> : <ChevronUp size={16} style={{ color: 'var(--color-subtext)' }} />}
            </button>

            {/* Sortable chips — collapsible */}
            {showChips && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selected} strategy={rectSortingStrategy}>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selected.map((id, idx) => (
                      <SortableChip key={id} id={id} idx={idx} onRemove={remove} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Download QR + Create */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadAllQR}
                disabled={downloading}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: '#1D4ED8', color: 'white' }}
              >
                <Download size={14} />
                {downloading ? 'Downloading...' : 'Download QR codes'}
              </button>
              <Button variant="green" onClick={handleCreate} disabled={!canCreate || loading}>
                {loading ? 'Creating...' : `Create Game (${selected.length} checkpoints) ▶`}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-center py-1" style={{ color: 'var(--color-subtext)' }}>
            Tap games above to select them
          </p>
        )}
      </div>
    </PageLayout>
  );
}
