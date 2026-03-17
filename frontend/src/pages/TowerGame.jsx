import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Trophy, RotateCcw, Building2, Wind } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';

const GAME_TIME_LIMIT = 60;
const WIN_STACK_COUNT = 7;
const REWARD_COINS = 60;

const PLAYFIELD_WIDTH = 300;
const PLAYFIELD_HEIGHT = 430;

const BLOCK_WIDTH = 120;
const BLOCK_HEIGHT = 38;
const MIN_BLOCK_WIDTH = 56;

const ROPE_HEIGHT = 92;
const HOOK_TOP_Y = -32;
const HOOK_DOWN_MS = 500;
const HOOK_UP_MS = 500;

const GRAVITY = 0.0012;
const ROTATE_SPEED = 0.006;
const FALL_SPEED_Y = 0.34;

const STATUS = {
  SWING: 'SWING',
  BEFORE_DROP: 'BEFORE_DROP',
  DROP: 'DROP',
  LAND: 'LAND',
  ROTATE_LEFT: 'ROTATE_LEFT',
  ROTATE_RIGHT: 'ROTATE_RIGHT',
  OUT: 'OUT',
};

const HOOK_STATUS = {
  NORMAL: 'NORMAL',
  DOWN: 'DOWN',
  UP: 'UP',
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function brickStyle(width, perfect = false) {
  return {
    width,
    backgroundImage: perfect
      ? `
        linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(0,0,0,0.08)),
        repeating-linear-gradient(
          0deg,
          #f5c96d 0px,
          #f5c96d 14px,
          #d89c2a 14px,
          #d89c2a 16px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,255,255,0) 0px,
          rgba(255,255,255,0) 30px,
          rgba(129,89,8,0.55) 30px,
          rgba(129,89,8,0.55) 32px
        )
      `
      : `
        linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(0,0,0,0.08)),
        repeating-linear-gradient(
          0deg,
          #c86f33 0px,
          #c86f33 14px,
          #a85724 14px,
          #a85724 16px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,255,255,0) 0px,
          rgba(255,255,255,0) 30px,
          rgba(120,52,16,0.65) 30px,
          rgba(120,52,16,0.65) 32px
        )
      `,
    backgroundSize: '100% 100%, 100% 100%, 32px 16px',
    backgroundPosition: 'center',
  };
}

function createBaseBlock() {
  return {
    id: `base-${Date.now()}`,
    x: (PLAYFIELD_WIDTH - BLOCK_WIDTH) / 2,
    y: PLAYFIELD_HEIGHT - 72,
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    rotate: 0,
    perfect: false,
    visible: true,
    status: STATUS.LAND,
  };
}

function getAngleBase(successCount) {
  if (successCount < 10) return 30;
  if (successCount < 20) return 60;
  return 80;
}

function getSwingVelocity(successCount, time) {
  let hard;
  switch (true) {
    case successCount < 1:
      hard = 0;
      break;
    case successCount < 10:
      hard = 1;
      break;
    case successCount < 20:
      hard = 0.8;
      break;
    case successCount < 30:
      hard = 0.7;
      break;
    default:
      hard = 0.74;
      break;
  }
  return Math.sin(time / (200 / hard));
}

function getLandBlockVelocity(successCount, time) {
  let hard;
  switch (true) {
    case successCount < 5:
      hard = 0;
      break;
    case successCount < 13:
      hard = 0.001;
      break;
    case successCount < 23:
      hard = 0.002;
      break;
    default:
      hard = 0.003;
      break;
  }
  return Math.cos(time / 200) * hard * PLAYFIELD_WIDTH;
}

function createActiveBlock(width, successCount) {
  const angleBase = getAngleBase(successCount);
  const sign = Math.random() > 0.5 ? 1 : -1;
  const initialAngle = ((Math.PI * (angleBase + Math.random() * 5) * sign) / 180);

  return {
    id: `active-${Date.now()}-${Math.random()}`,
    width,
    height: BLOCK_HEIGHT,
    x: PLAYFIELD_WIDTH / 2,
    y: HOOK_TOP_Y,
    rotate: 0,
    visible: true,
    perfect: false,
    status: STATUS.SWING,
    initialAngle,
    angle: initialAngle,
    weightX: PLAYFIELD_WIDTH / 2,
    weightY: HOOK_TOP_Y + ROPE_HEIGHT,
    vx: 0,
    vy: 0,
    ay: 0,
    startDropTime: 0,
    outwardOffset: 0,
    originOutwardAngle: 0,
    originHypotenuse: 0,
  };
}

function createClouds() {
  return [
    { id: 1, x: 14, y: 42, w: 54, h: 24, ax: 0.18, drift: 0.3 },
    { id: 2, x: 190, y: 72, w: 70, h: 28, ax: -0.14, drift: 0.6 },
    { id: 3, x: 54, y: 118, w: 60, h: 22, ax: 0.12, drift: 0.9 },
  ];
}

function createBirds() {
  return [
    { id: 1, x: -20, y: 62, vx: 0.55, vy: 0.02, emoji: '🐦' },
    { id: 2, x: -120, y: 96, vx: 0.42, vy: -0.015, emoji: '🕊️' },
  ];
}

export default function TowerGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 3;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [stack, setStack] = useState([createBaseBlock()]);
  const [activeBlock, setActiveBlock] = useState(createActiveBlock(BLOCK_WIDTH, 0));
  const [hook, setHook] = useState({
    x: PLAYFIELD_WIDTH / 2,
    y: HOOK_TOP_Y,
    weightX: PLAYFIELD_WIDTH / 2,
    weightY: HOOK_TOP_Y + ROPE_HEIGHT,
    angle: 0,
    status: HOOK_STATUS.NORMAL,
    animStart: 0,
  });

  const [collapsePieces, setCollapsePieces] = useState([]);
  const [clouds, setClouds] = useState(createClouds());
  const [birds, setBirds] = useState(createBirds());

  const [gameStarted, setGameStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [busy, setBusy] = useState(false);

  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);

  const rafRef = useRef(null);
  const prevTimeRef = useRef(0);
  const losingRef = useRef(false);

  const guideText = useMemo(() => {
    if (!gameStarted) return 'Press Start, then tap inside the scene to release the swinging brick.';
    if (showWin) return 'Balanced tower complete.';
    if (showLose) return 'The stack lost support and collapsed.';
    return 'Release the hook at the right moment. Off-center landings tilt the block and can topple the tower.';
  }, [gameStarted, showLose, showWin]);

  const resetGame = () => {
    setStack([createBaseBlock()]);
    setActiveBlock(createActiveBlock(BLOCK_WIDTH, 0));
    setHook({
      x: PLAYFIELD_WIDTH / 2,
      y: HOOK_TOP_Y,
      weightX: PLAYFIELD_WIDTH / 2,
      weightY: HOOK_TOP_Y + ROPE_HEIGHT,
      angle: 0,
      status: HOOK_STATUS.NORMAL,
      animStart: 0,
    });
    setCollapsePieces([]);
    setClouds(createClouds());
    setBirds(createBirds());
    setSuccessCount(0);
    setFailedCount(0);
    setPerfectCount(0);
    setScore(0);
    setTimeLeft(GAME_TIME_LIMIT);
    setShowWin(false);
    setShowLose(false);
    losingRef.current = false;
    prevTimeRef.current = 0;
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted || showWin || showLose) return;

    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          triggerCollapse();
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showWin, showLose]);

  const addScoreValue = (isPerfect) => {
    setScore((lastScore) => {
      const nextPerfect = isPerfect ? perfectCount + 1 : 0;
      const gained = 25 + (isPerfect ? 25 * nextPerfect : 0);
      return lastScore + gained;
    });
    setPerfectCount((lastPerfect) => (isPerfect ? lastPerfect + 1 : 0));
  };

  const triggerCollapse = (impactBlock = null) => {
    if (losingRef.current) return;
    losingRef.current = true;

    const pieces = [
      ...stack.map((block, index) => ({
        ...block,
        id: `fall-${block.id}-${index}`,
        vx: (index - stack.length / 2) * 0.55,
        vy: -2 - index * 0.18,
        spin: (index % 2 === 0 ? 1 : -1) * (1.2 + index * 0.18),
      })),
    ];

    if (impactBlock) {
      pieces.push({
        ...impactBlock,
        id: `impact-${Date.now()}`,
        vx: impactBlock.status === STATUS.ROTATE_LEFT ? -1.4 : 1.4,
        vy: -2.4,
        spin: impactBlock.status === STATUS.ROTATE_LEFT ? -2.3 : 2.3,
      });
    }

    setCollapsePieces(pieces);
    setActiveBlock(null);
    setShowLose(true);
    setFailedCount((v) => Math.min(3, v + 1));
  };

  const spawnNextBlock = (width, nextSuccess) => {
    setActiveBlock(createActiveBlock(width, nextSuccess));
    setHook((prev) => ({
      ...prev,
      y: HOOK_TOP_Y,
      status: HOOK_STATUS.DOWN,
      animStart: performance.now(),
    }));
  };

  const handleSuccessLand = (block, isPerfect) => {
    const landed = {
      ...block,
      id: `stack-${Date.now()}-${Math.random()}`,
      status: STATUS.LAND,
      perfect: isPerfect,
      rotate: 0,
    };

    const nextSuccess = successCount + 1;
    setStack((prev) => [...prev, landed]);
    setSuccessCount(nextSuccess);
    addScoreValue(isPerfect);

    if (nextSuccess >= WIN_STACK_COUNT - 1) {
      setShowWin(true);
      setActiveBlock(null);
      return;
    }

    const nextWidth = clamp(
      isPerfect ? block.width : block.width,
      MIN_BLOCK_WIDTH,
      BLOCK_WIDTH
    );

    spawnNextBlock(nextWidth, nextSuccess);
  };

  const checkCollision = (block, line) => {
    if (block.y + block.height < line.y) return 0;

    const calWidth = block.width / 2;

    if (block.x < line.x - calWidth || block.x > line.collisionX + calWidth) return 1;
    if (block.x < line.x) return 2;
    if (block.x > line.collisionX) return 3;
    if (block.x > line.x + calWidth * 0.8 && block.x < line.x + calWidth * 1.2) return 5;
    return 4;
  };

  const line = useMemo(() => {
    const top = stack[stack.length - 1];
    return {
      x: top.x - top.width / 2,
      y: top.y,
      collisionX: top.x + top.width / 2,
    };
  }, [stack]);

  const releaseBlock = () => {
    if (!gameStarted || showWin || showLose || !activeBlock) return;
    if (hook.status !== HOOK_STATUS.NORMAL) return;
    if (activeBlock.status !== STATUS.SWING) return;

    setHook((prev) => ({
      ...prev,
      status: HOOK_STATUS.UP,
      animStart: performance.now(),
    }));

    setActiveBlock((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: STATUS.BEFORE_DROP,
      };
    });
  };

  useEffect(() => {
    if (!gameStarted) return;

    const frame = (time) => {
      const prev = prevTimeRef.current || time;
      const delta = time - prev;
      prevTimeRef.current = time;

      setClouds((prevClouds) =>
        prevClouds.map((cloud) => {
          let nextX = cloud.x + cloud.ax;
          if (nextX < -10 || nextX + cloud.w > PLAYFIELD_WIDTH + 10) {
            return { ...cloud, ax: cloud.ax * -1, x: cloud.x + cloud.ax * -1 };
          }
          return {
            ...cloud,
            x: nextX,
            y: cloud.y + Math.sin(time / 900 + cloud.drift) * 0.06,
          };
        })
      );

      setBirds((prevBirds) =>
        prevBirds.map((bird, index) => {
          let nextX = bird.x + bird.vx;
          let nextY = bird.y + Math.sin(time / 500 + index) * 0.12 + bird.vy;
          if (nextX > PLAYFIELD_WIDTH + 40) {
            nextX = -40 - index * 70;
            nextY = 60 + index * 28;
          }
          return { ...bird, x: nextX, y: nextY };
        })
      );

      setCollapsePieces((prevPieces) =>
        prevPieces
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vy: piece.vy + 0.38,
            rotate: (piece.rotate || 0) + piece.spin * 0.06,
          }))
          .filter((piece) => piece.y < PLAYFIELD_HEIGHT + 160)
      );

      if (!showWin && !showLose) {
        setHook((prevHook) => {
          let nextY = prevHook.y;
          let nextStatus = prevHook.status;

          if (prevHook.status === HOOK_STATUS.DOWN) {
            const progress = clamp((time - prevHook.animStart) / HOOK_DOWN_MS, 0, 1);
            nextY = HOOK_TOP_Y + ROPE_HEIGHT * progress;
            if (progress >= 1) nextStatus = HOOK_STATUS.NORMAL;
          } else if (prevHook.status === HOOK_STATUS.UP) {
            const progress = clamp((time - prevHook.animStart) / HOOK_UP_MS, 0, 1);
            nextY = HOOK_TOP_Y + ROPE_HEIGHT * (1 - progress);
            if (progress >= 1) nextStatus = HOOK_STATUS.DOWN;
          }

          let nextAngle = 0;
          let nextWeightX = prevHook.x;
          let nextWeightY = nextY + ROPE_HEIGHT;

          if (activeBlock && activeBlock.status === STATUS.SWING) {
            nextAngle = activeBlock.initialAngle * getSwingVelocity(successCount, time);
            nextWeightX = prevHook.x + Math.sin(nextAngle) * ROPE_HEIGHT;
            nextWeightY = nextY + Math.cos(nextAngle) * ROPE_HEIGHT;
          }

          return {
            ...prevHook,
            y: nextY,
            status: nextStatus,
            angle: nextAngle,
            weightX: nextWeightX,
            weightY: nextWeightY,
          };
        });

        setActiveBlock((prevBlock) => {
          if (!prevBlock) return prevBlock;

          switch (prevBlock.status) {
            case STATUS.SWING: {
              const angle = prevBlock.initialAngle * getSwingVelocity(successCount, time);
              const weightX = PLAYFIELD_WIDTH / 2 + Math.sin(angle) * ROPE_HEIGHT;
              const weightY = hook.y + Math.cos(angle) * ROPE_HEIGHT;

              return {
                ...prevBlock,
                angle,
                x: PLAYFIELD_WIDTH / 2,
                y: hook.y,
                weightX,
                weightY,
              };
            }

            case STATUS.BEFORE_DROP: {
              return {
                ...prevBlock,
                x: prevBlock.weightX - prevBlock.width / 2,
                y: prevBlock.weightY + prevBlock.height * 0.3,
                rotate: 0,
                ay: GRAVITY,
                vy: 0,
                startDropTime: time,
                status: STATUS.DROP,
              };
            }

            case STATUS.DROP: {
              const deltaTime = Math.max(12, time - prevBlock.startDropTime);
              const nextVy = prevBlock.vy + prevBlock.ay * deltaTime;
              const nextY = prevBlock.y + (prevBlock.vy * deltaTime) + (0.5 * prevBlock.ay * deltaTime * deltaTime);
              const falling = {
                ...prevBlock,
                y: nextY,
                vy: nextVy,
                startDropTime: time,
              };

              const collision = checkCollision(falling, line);
              const blockY = line.y - falling.height;

              if (collision === 0) return falling;

              if (collision === 1) {
                triggerCollapse({ ...falling, status: STATUS.OUT });
                return { ...falling, visible: false, status: STATUS.OUT };
              }

              if (collision === 2 || collision === 3) {
                const outwardOffset =
                  collision === 2
                    ? (line.x + falling.width / 2) - falling.x
                    : (line.collisionX + falling.width / 2) - falling.x;

                const originOutwardAngle = Math.atan(falling.height / outwardOffset);
                const originHypotenuse = Math.sqrt((falling.height ** 2) + (outwardOffset ** 2));

                return {
                  ...falling,
                  y: blockY,
                  outwardOffset,
                  originOutwardAngle,
                  originHypotenuse,
                  status: collision === 2 ? STATUS.ROTATE_LEFT : STATUS.ROTATE_RIGHT,
                };
              }

              const isPerfect = collision === 5;
              const supportDrift = getLandBlockVelocity(successCount, time);
              const landedX = falling.x + supportDrift;

              handleSuccessLand(
                {
                  ...falling,
                  x: landedX,
                  y: blockY,
                  width: clamp(falling.width, MIN_BLOCK_WIDTH, BLOCK_WIDTH),
                },
                isPerfect
              );

              return null;
            }

            case STATUS.ROTATE_LEFT:
            case STATUS.ROTATE_RIGHT: {
              const isRight = prevBlock.status === STATUS.ROTATE_RIGHT;
              const leftFix = isRight ? 1 : -1;
              const nextRotate = prevBlock.rotate + ROTATE_SPEED * delta * leftFix;
              const shouldFall = isRight ? nextRotate > 1.3 : nextRotate < -1.3;

              if (shouldFall) {
                const nextBlock = {
                  ...prevBlock,
                  rotate: nextRotate + (ROTATE_SPEED / 8) * delta * leftFix,
                  y: prevBlock.y + FALL_SPEED_Y * delta,
                  x: prevBlock.x + 0.11 * delta * leftFix,
                };

                if (nextBlock.y >= PLAYFIELD_HEIGHT) {
                  triggerCollapse(nextBlock);
                  return { ...nextBlock, visible: false, status: STATUS.OUT };
                }
                return nextBlock;
              }

              let rotateRatio = (prevBlock.width - prevBlock.outwardOffset) / prevBlock.width;
              rotateRatio = rotateRatio > 0.5 ? rotateRatio : 0.5;
              const adjustedRotate = prevBlock.rotate + ROTATE_SPEED * rotateRatio * delta * leftFix;

              const angle = prevBlock.originOutwardAngle + adjustedRotate;
              const rotateAxisX = isRight ? line.collisionX + prevBlock.width / 2 : line.x + prevBlock.width / 2;
              const rotateAxisY = line.y;

              const nextX = rotateAxisX - (Math.cos(angle) * prevBlock.originHypotenuse);
              const nextY = rotateAxisY - (Math.sin(angle) * prevBlock.originHypotenuse);

              return {
                ...prevBlock,
                rotate: adjustedRotate,
                x: nextX,
                y: nextY,
              };
            }

            default:
              return prevBlock;
          }
        });
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameStarted, showLose, showWin, hook.y, line, successCount, activeBlock, stack]);

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `tower-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds) ? sessionData.checkpointIds : [];
        const matchedCheckpoint = checkpoints.find((entry) => entry.level === checkpoint);

        if (matchedCheckpoint?._id) {
          await playerAPI.checkpoint(playerSessionId, {
            checkpointId: matchedCheckpoint._id,
            scoreEarned: REWARD_COINS,
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', {
        state: {
          justCompleted: true,
          completedCheckpoint: checkpoint,
          nextCheckpoint: checkpoint + 1,
          rewardCoins: REWARD_COINS,
          resultId,
        },
      });
    }
  };

  const handleLoseContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `tower-lose-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', { state: { wrongAnswer: true, resultId } });
    }
  };

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Tower builder
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Release the swinging brick and keep the structure balanced.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3" style={{ backgroundColor: '#EFF6FF' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Building2 size={14} />
              Floors
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {successCount}/{WIN_STACK_COUNT - 1}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#ECFDF5' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#059669' }}>
              <Wind size={14} />
              Perfect
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#047857' }}>
              {perfectCount}
            </p>
          </div>
        </div>

        <div
          className="rounded-3xl p-3 relative overflow-hidden select-none"
          style={{
            border: '1px solid var(--color-border)',
            background: 'linear-gradient(180deg, #bfe7ff 0%, #eaf8ff 55%, #d9f2c4 100%)',
          }}
        >
          <div
            className="relative mx-auto rounded-2xl overflow-hidden"
            style={{
              width: PLAYFIELD_WIDTH,
              height: PLAYFIELD_HEIGHT,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))',
              boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.14)',
            }}
            onClick={releaseBlock}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 to-transparent" />

            {clouds.map((cloud) => (
              <div
                key={cloud.id}
                className="absolute rounded-full"
                style={{
                  left: cloud.x,
                  top: cloud.y,
                  width: cloud.w,
                  height: cloud.h,
                  background: 'rgba(255,255,255,0.86)',
                  boxShadow: '18px 4px 0 2px rgba(255,255,255,0.78), 34px -2px 0 0 rgba(255,255,255,0.75)',
                }}
              />
            ))}

            {birds.map((bird) => (
              <div
                key={bird.id}
                className="absolute text-sm"
                style={{ left: bird.x, top: bird.y }}
              >
                {bird.emoji}
              </div>
            ))}

            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 72,
                background: 'linear-gradient(180deg, #8fd16d 0%, #69b146 100%)',
                borderTop: '3px solid #5c9940',
              }}
            />

            <div
              className="absolute bottom-[72px] left-0 right-0"
              style={{
                height: 8,
                background: 'rgba(90, 90, 90, 0.18)',
              }}
            />

            {stack.map((block) => (
              <div
                key={block.id}
                className="absolute rounded-md"
                style={{
                  left: block.x,
                  top: block.y,
                  height: block.height,
                  transform: `rotate(${block.rotate || 0}rad)`,
                  transformOrigin: 'center center',
                  border: '1px solid rgba(115,52,18,0.35)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.18)',
                  ...brickStyle(block.width, block.perfect),
                }}
              />
            ))}

            {collapsePieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute rounded-md"
                style={{
                  left: piece.x,
                  top: piece.y,
                  height: piece.height,
                  transform: `rotate(${piece.rotate || 0}rad)`,
                  transformOrigin: 'center center',
                  border: '1px solid rgba(115,52,18,0.35)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.18)',
                  ...brickStyle(piece.width, piece.perfect),
                }}
              />
            ))}

            {activeBlock && activeBlock.status === STATUS.SWING && (
              <>
                <div
                  className="absolute"
                  style={{
                    left: hook.x - 1,
                    top: hook.y,
                    width: 2,
                    height: Math.max(0, hook.weightY - hook.y),
                    background: '#6b7280',
                    transformOrigin: 'top center',
                    transform: `rotate(${hook.angle}rad)`,
                  }}
                />
                <div
                  className="absolute rounded-full bg-slate-500"
                  style={{
                    left: hook.x - 8,
                    top: hook.y - 10,
                    width: 16,
                    height: 16,
                  }}
                />
                <div
                  className="absolute rounded-md"
                  style={{
                    left: activeBlock.weightX - activeBlock.width / 2,
                    top: activeBlock.weightY,
                    height: activeBlock.height,
                    border: '1px solid rgba(115,52,18,0.35)',
                    boxShadow: '0 8px 14px rgba(0,0,0,0.2)',
                    ...brickStyle(activeBlock.width),
                  }}
                />
              </>
            )}

            {activeBlock && [STATUS.DROP, STATUS.ROTATE_LEFT, STATUS.ROTATE_RIGHT].includes(activeBlock.status) && (
              <div
                className="absolute rounded-md"
                style={{
                  left: activeBlock.x,
                  top: activeBlock.y,
                  height: activeBlock.height,
                  transform: `rotate(${activeBlock.rotate || 0}rad)`,
                  transformOrigin: 'center center',
                  border: '1px solid rgba(115,52,18,0.35)',
                  boxShadow: '0 8px 14px rgba(0,0,0,0.2)',
                  ...brickStyle(activeBlock.width),
                }}
              />
            )}

            {!gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <div
                  className="rounded-2xl px-5 py-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(4px)' }}
                >
                  <p className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Build a balanced tower
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
                    Start the game, then tap the scene to release each swinging brick.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to play
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            {guideText}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => navigate('/game')}>
            Back
          </Button>

          {!gameStarted ? (
            <Button variant="green" onClick={startGame}>
              Start game
            </Button>
          ) : (
            <Button variant="green" onClick={startGame}>
              <RotateCcw size={16} />
              Restart
            </Button>
          )}
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <Trophy size={28} style={{ color: '#16A34A' }} />
          </div>

          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Tower completed!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              You kept the structure balanced and cleared this checkpoint.
            </p>
          </div>

          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            Continue
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">💥</span>

          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Tower collapsed
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              The bricks lost balance and fell. This attempt costs 1 life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="ghost" onClick={startGame} disabled={busy}>
              Retry
            </Button>
            <Button variant="red" onClick={handleLoseContinue} disabled={busy}>
              Continue
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}