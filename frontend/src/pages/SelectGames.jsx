import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Download, Check, GripVertical } from 'lucide-react';
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
  verticalListSortingStrategy,
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
];

const MAX_GAMES = AVAILABLE_GAMES.length;

// ── Sortable card inside Manage panel ────────────────────────
function SortableGameCard({ id, idx, onRemove, onDownloadQR }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const game = AVAILABLE_GAMES.find((g) => g.id === id);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
    >
      <Card className="rounded-2xl p-3">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <button
            className="shrink-0 cursor-grab active:cursor-grabbing touch-none p-1"
            style={{ color: '#9CA3AF' }}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </button>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: game?.bg }}
          >
            {game?.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {idx + 1}. {game?.label}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-subtext)', lineHeight: '1.35' }}
            >
              {game?.desc}
            </p>
          </div>

          <button onClick={() => onRemove(id)} style={{ color: 'var(--color-red)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="mt-2.5">
          <button
            onClick={() => onDownloadQR(id, idx)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold w-full justify-center"
            style={{ backgroundColor: '#1D4ED8', color: 'white' }}
          >
            <Download size={12} />
            Download QR — Checkpoint {idx + 1}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function SelectGames() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, time, difficulty } = location.state ?? {};
  const host = JSON.parse(localStorage.getItem('host') || 'null');

  const [selected, setSelected] = useState([]); // ordered array of game ids
  const [showManage, setShowManage] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_GAMES) return prev;
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

  const handleDownloadQR = async (gameId, idx) => {
    const checkpoint = idx + 1;
    const game = AVAILABLE_GAMES.find((g) => g.id === gameId);
    try {
      const QR_SIZE = 300;
      const PADDING = 20;
      const LABEL1 = `Checkpoint ${checkpoint}`;
      const LABEL2 = game?.label ?? '';

      // Draw QR onto an offscreen canvas, add text below
      const qrDataUrl = await QRCode.toDataURL(`CHECKPOINT:${checkpoint}`, {
        width: QR_SIZE,
        margin: 1,
      });

      const img = new Image();
      img.src = qrDataUrl;
      await new Promise((res) => { img.onload = res; });

      const canvas = document.createElement('canvas');
      canvas.width = QR_SIZE + PADDING * 2;
      canvas.height = QR_SIZE + PADDING * 2 + 52; // extra room for two text lines
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // QR image
      ctx.drawImage(img, PADDING, PADDING, QR_SIZE, QR_SIZE);

      // "Checkpoint N" — bold, larger
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(LABEL1, canvas.width / 2, QR_SIZE + PADDING + 30);

      // Game name — smaller, grey
      ctx.fillStyle = '#555555';
      ctx.font = '16px sans-serif';
      ctx.fillText(LABEL2, canvas.width / 2, QR_SIZE + PADDING + 54);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `checkpoint-${checkpoint}-${game?.id}.png`;
      a.click();
    } catch {
      toast.error('Failed to generate QR');
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
            <li>• Drag ≡ in the Manage panel to reorder checkpoints</li>
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                ✅ Selected ({selected.length} checkpoint{selected.length > 1 ? 's' : ''})
              </p>
              <button
                onClick={() => setShowManage(true)}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--color-info-bg)',
                  color: 'var(--color-primary)',
                }}
              >
                ▾ Manage
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selected.map((id, idx) => {
                const game = AVAILABLE_GAMES.find((g) => g.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{
                      backgroundColor: 'var(--color-info-bg)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {idx + 1}. {game?.emoji} {game?.label}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(id);
                      }}
                      className="ml-0.5 opacity-60 hover:opacity-100"
                    >
                      <X size={11} />
                    </button>
                  </span>
                );
              })}
            </div>
            <Button variant="green" onClick={handleCreate} disabled={!canCreate || loading}>
              {loading ? 'Creating...' : `Create Game (${selected.length} checkpoints) ▶`}
            </Button>
          </>
        ) : (
          <p className="text-sm text-center py-1" style={{ color: 'var(--color-subtext)' }}>
            Tap games above to select them
          </p>
        )}
      </div>

      {/* Manage panel — drag-to-reorder */}
      {showManage && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowManage(false)}
        >
          <div
            className="w-full rounded-t-3xl p-5 flex flex-col gap-3"
            style={{
              backgroundColor: 'white',
              maxHeight: '80vh',
              overflowY: 'auto',
              maxWidth: 480,
              margin: '0 auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-bold text-base flex items-center gap-1.5"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span className="text-green-500">✅</span> Selected Games ({selected.length})
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)' }}>
                  Drag ≡ to reorder · Download QR for each checkpoint
                </p>
              </div>
              <button
                onClick={() => setShowManage(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
              >
                <X size={14} />
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {selected.map((id, idx) => (
                    <SortableGameCard
                      key={id}
                      id={id}
                      idx={idx}
                      onRemove={remove}
                      onDownloadQR={handleDownloadQR}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
