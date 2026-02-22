/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Timer, 
  Zap, 
  Play, 
  Pause,
  ChevronRight,
  AlertCircle,
  XCircle,
  User,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { 
  GameMode, 
  Block, 
  GRID_ROWS, 
  GRID_COLS, 
  INITIAL_ROWS, 
  MAX_VALUE, 
  TIME_LIMIT,
  Leaderboard,
  LeaderboardEntry
} from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const RankedName = ({ name, rank }: { name: string; rank: number }) => {
  if (rank === 0) {
    return (
      <div className="flex items-center gap-2 font-black italic">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        </motion.div>
        <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
          {name}
        </span>
      </div>
    );
  }
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2 font-bold">
        <Medal className="w-4 h-4 text-slate-300 fill-slate-300" />
        <span className="text-slate-200 drop-shadow-[0_0_5px_rgba(226,232,240,0.5)] relative overflow-hidden group">
          {name}
          <motion.div 
            animate={{ left: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          />
        </span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-2 font-bold">
        <Medal className="w-4 h-4 text-amber-600 fill-amber-600" />
        <span className="text-amber-500">
          {name}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <Star className="w-3 h-3" />
      <span>{name}</span>
    </div>
  );
};

const createBlock = (row: number, col: number): Block => ({
  id: generateId(),
  value: Math.floor(Math.random() * MAX_VALUE) + 1,
  row,
  col
});

const getBlockColor = (value: number, isSelected: boolean) => {
  if (isSelected) return 'bg-sky-400 text-slate-950 scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]';
  
  const colors: Record<number, string> = {
    1: 'bg-slate-800 text-slate-300',
    2: 'bg-slate-700 text-slate-200',
    3: 'bg-blue-900/40 text-blue-200 border-blue-800/50',
    4: 'bg-indigo-900/40 text-indigo-200 border-indigo-800/50',
    5: 'bg-violet-900/40 text-violet-200 border-violet-800/50',
    6: 'bg-purple-900/40 text-purple-200 border-purple-800/50',
    7: 'bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-800/50',
    8: 'bg-rose-900/40 text-rose-200 border-rose-800/50',
    9: 'bg-orange-900/40 text-orange-200 border-orange-800/50',
  };
  
  return colors[value] || 'bg-slate-800 text-slate-200';
};

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
  color: string;
  opacity: number;
}

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  score: number;
  count: number;
}

const BackgroundCubes = () => {
  const [cubes, setCubes] = useState<{ 
    id: string; 
    x: number; 
    size: number; 
    duration: number; 
    delay: number; 
    rotation: number;
    opacity: number;
    blur: number;
    drift: number;
  }[]>([]);

  useEffect(() => {
    const newCubes = Array.from({ length: 20 }).map(() => {
      const size = Math.random() * 80 + 20;
      return {
        id: generateId(),
        x: Math.random() * 100,
        size: size,
        duration: Math.random() * 30 + 25, // Slower: 25s to 55s
        delay: Math.random() * -60, // Start at different positions
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.1 + 0.03, // Subtle: 0.03 to 0.13
        blur: size < 40 ? 2 : size > 80 ? 0 : 1, // Depth of field
        drift: (Math.random() - 0.5) * 10, // Slight horizontal drift
      };
    });
    setCubes(newCubes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {cubes.map((cube) => (
        <motion.div
          key={cube.id}
          initial={{ 
            y: '-20vh', 
            x: `${cube.x}%`, 
            rotate: cube.rotation,
            opacity: 0 
          }}
          animate={{ 
            y: '120vh', 
            x: `${cube.x + cube.drift}%`,
            rotate: cube.rotation + 360,
            opacity: cube.opacity
          }}
          transition={{ 
            duration: cube.duration, 
            repeat: Infinity, 
            delay: cube.delay,
            ease: "linear" 
          }}
          className="absolute"
          style={{ 
            width: cube.size, 
            height: cube.size,
            filter: `blur(${cube.blur}px)`
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="stroke-white fill-none stroke-[1]">
            <rect x="10" y="30" width="60" height="60" />
            <rect x="30" y="10" width="60" height="60" />
            <line x1="10" y1="30" x2="30" y2="10" />
            <line x1="70" y1="30" x2="90" y2="10" />
            <line x1="10" y1="90" x2="30" y2="70" />
            <line x1="70" y1="90" x2="90" y2="70" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [tempName, setTempName] = useState('');
  const [leaderboard, setLeaderboard] = useState<Leaderboard>({ classic: [], time: [] });
  const [mode, setMode] = useState<GameMode | null>(null);
  const [grid, setGrid] = useState<Block[][]>([]);
  const [target, setTarget] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const [combo, setCombo] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize data from local storage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('sumstack_highscore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));

    const savedName = localStorage.getItem('sumstack_playername');
    if (savedName) {
      setPlayerName(savedName);
      setTempName(savedName);
    }

    const savedLeaderboard = localStorage.getItem('sumstack_leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  // Save score to leaderboard when game over
  useEffect(() => {
    if (gameOver && mode) {
      const entry: LeaderboardEntry = {
        name: playerName || '匿名玩家',
        score: score,
        date: new Date().toLocaleDateString()
      };

      setLeaderboard(prev => {
        const currentList = prev[mode];
        const newList = [...currentList, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        
        const updated = { ...prev, [mode]: newList };
        localStorage.setItem('sumstack_leaderboard', JSON.stringify(updated));
        return updated;
      });
    }
  }, [gameOver, mode, score, playerName]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('sumstack_highscore', score.toString());
    }
  }, [score, highScore]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      localStorage.setItem('sumstack_playername', tempName.trim());
    }
  };

  const generateTarget = useCallback((currentGrid: Block[][]) => {
    // Pick 2-4 random blocks to ensure the target is reachable
    const flat = currentGrid.flat();
    if (flat.length === 0) return 10;
    
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...flat].sort(() => 0.5 - Math.random());
    const sum = shuffled.slice(0, count).reduce((acc, b) => acc + b.value, 0);
    return sum;
  }, []);

  const addNewRow = useCallback(() => {
    setGrid(prev => {
      // Check for game over (if any block is in the top row)
      const isFull = prev.some(row => row.length > 0 && row[0].row === 0);
      if (isFull) {
        setGameOver(true);
        return prev;
      }

      // Shift all existing blocks up
      const shifted = prev.map(row => 
        row.map(block => ({ ...block, row: block.row - 1 }))
      );

      // Add new row at the bottom
      const newRow: Block[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        newRow.push(createBlock(GRID_ROWS - 1, col));
      }

      return [...shifted, newRow];
    });
  }, []);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCombo(1);
    setTimeLeft(TIME_LIMIT);
    
    const initialGrid: Block[][] = [];
    for (let r = GRID_ROWS - INITIAL_ROWS; r < GRID_ROWS; r++) {
      const row: Block[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        row.push(createBlock(r, c));
      }
      initialGrid.push(row);
    }
    
    setGrid(initialGrid);
    setTarget(generateTarget(initialGrid));
    setSelectedIds([]);
  };

  const handleBlockClick = (block: Block) => {
    if (gameOver || isPaused) return;

    setSelectedIds(prev => {
      if (prev.includes(block.id)) {
        return prev.filter(id => id !== block.id);
      }
      return [...prev, block.id];
    });
  };

  // Check sum
  useEffect(() => {
    const selectedBlocks = grid.flat().filter(b => selectedIds.includes(b.id));
    const currentSum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (currentSum === target && target !== 0) {
      // Success!
      const points = target * selectedBlocks.length * combo;
      setScore(s => s + points);
      
      // Spawn particles
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const newParticles: Particle[] = [];
        const clearCount = selectedBlocks.length;
        
        // Calculate average center for score popup
        let avgX = 0;
        let avgY = 0;

        selectedBlocks.forEach(block => {
          const cellWidth = rect.width / GRID_COLS;
          const cellHeight = rect.height / GRID_ROWS;
          const centerX = (block.col + 0.5) * cellWidth;
          const centerY = (block.row + 0.5) * cellHeight;
          
          avgX += centerX;
          avgY += centerY;

          // More particles if more blocks cleared
          const particleCount = clearCount > 3 ? 15 : 8;
          const speedMult = clearCount > 3 ? 1.5 : 1;
          
          for (let i = 0; i < particleCount; i++) {
            newParticles.push({
              id: generateId(),
              x: centerX,
              y: centerY,
              vx: (Math.random() - 0.5) * 15 * speedMult,
              vy: (Math.random() - 0.5) * 15 * speedMult - 5,
              rotation: Math.random() * 360,
              vr: (Math.random() - 0.5) * 20,
              size: Math.random() * (clearCount > 3 ? 15 : 10) + 5,
              color: clearCount > 4 ? '#fbbf24' : clearCount > 2 ? '#38bdf8' : '#94a3b8',
              opacity: 1
            });
          }
        });

        avgX /= clearCount;
        avgY /= clearCount;

        setParticles(prev => [...prev, ...newParticles]);
        
        // Add score popup
        const newPopup: ScorePopup = {
          id: generateId(),
          x: avgX,
          y: avgY,
          score: points,
          count: clearCount
        };
        setPopups(prev => [...prev, newPopup]);
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== newPopup.id));
        }, 1000);
      }

      // Remove blocks and apply gravity
      setGrid(prev => {
        const remainingBlocks = prev.flat().filter(b => !selectedIds.includes(b.id));
        const newGrid: Block[][] = Array.from({ length: GRID_ROWS }, () => []);
        
        // Apply gravity for each column
        for (let col = 0; col < GRID_COLS; col++) {
          const colBlocks = remainingBlocks
            .filter(b => b.col === col)
            .sort((a, b) => b.row - a.row); // Sort by row descending (bottom to top)
          
          colBlocks.forEach((block, index) => {
            const newRow = GRID_ROWS - 1 - index;
            const updatedBlock = { ...block, row: newRow };
            newGrid[newRow].push(updatedBlock);
          });
        }
        
        // Filter out empty rows to keep the grid state clean
        return newGrid.filter(row => row.length > 0);
      });

      setSelectedIds([]);
      
      // New target
      setTimeout(() => {
        setGrid(current => {
          setTarget(generateTarget(current));
          return current;
        });
      }, 100);

      if (mode === 'classic') {
        addNewRow();
      } else {
        setTimeLeft(TIME_LIMIT);
        setCombo(c => Math.min(c + 1, 5));
      }
    } else if (currentSum > target) {
      // Over sum - reset selection
      setSelectedIds([]);
      setCombo(1);
    }
  }, [selectedIds, target, grid, mode, addNewRow, generateTarget, combo]);

  // Timer logic for Time Mode
  useEffect(() => {
    if (mode === 'time' && !gameOver && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addNewRow();
            setCombo(1);
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, gameOver, isPaused, addNewRow]);

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5, // gravity
            rotation: p.rotation + p.vr,
            opacity: p.opacity - 0.02
          }))
          .filter(p => p.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  const gameContent = () => {
    if (!playerName) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative">
          <BackgroundCubes />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-sky-400/10 rounded-2xl">
                <User className="w-12 h-12 text-sky-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-2 text-center">欢迎，挑战者</h2>
            <p className="text-slate-400 mb-8 text-center">在开始之前，请告诉我们你的名字</p>
            
            <form onSubmit={handleSaveName} className="space-y-4">
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="输入你的名字..."
                maxLength={12}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all text-center text-lg font-bold"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!tempName.trim()}
                className="w-full bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 py-4 rounded-xl font-black text-lg hover:bg-sky-300 transition-colors shadow-lg shadow-sky-400/20"
              >
                开始游戏
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    if (!mode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 overflow-y-auto relative">
          <BackgroundCubes />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-start z-10"
          >
            {/* Left Column: Game Modes */}
            <div className="space-y-8">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-6xl font-black tracking-tighter text-white">
                  数字<span className="text-sky-400">堆栈</span>
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="font-medium">你好, {playerName}</span>
                  <button onClick={() => setPlayerName('')} className="text-xs text-sky-400 hover:underline ml-2">修改名字</button>
                </div>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => startGame('classic')}
                  className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">经典模式</h3>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-400">每次匹配后新增一行。挑战生存极限。</p>
                </button>

                <button 
                  onClick={() => startGame('time')}
                  className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">计时模式</h3>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-400">在倒计时结束前完成匹配。考验反应速度。</p>
                </button>
              </div>
            </div>

            {/* Right Column: Leaderboard */}
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-black text-white">排行榜</h2>
              </div>

              <div className="space-y-8">
                {/* Classic Leaderboard */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-sky-400" />
                    经典模式 TOP 5
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.classic.length > 0 ? (
                      leaderboard.classic.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                          <RankedName name={entry.name} rank={i} />
                          <span className="font-mono font-bold text-sky-400">{entry.score}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 text-sm italic py-2">暂无数据</div>
                    )}
                  </div>
                </div>

                {/* Time Leaderboard */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                    计时模式 TOP 5
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.time.length > 0 ? (
                      leaderboard.time.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                          <RankedName name={entry.name} rank={i} />
                          <span className="font-mono font-bold text-amber-400">{entry.score}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 text-sm italic py-2">暂无数据</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans select-none relative">
        <BackgroundCubes />
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between glass sticky top-0 z-20">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">目标</span>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-sky-400 tabular-nums">{target}</div>
              {selectedIds.length > 0 && (
                <div className="text-xl font-bold text-slate-500 tabular-nums">
                  / {grid.flat().filter(b => selectedIds.includes(b.id)).reduce((acc, b) => acc + b.value, 0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">得分</span>
            <div className="text-2xl font-bold tabular-nums">{score}</div>
          </div>

          <div className="flex items-center gap-4">
            {mode === 'time' && (
              <div className="flex flex-col items-end">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">时间</span>
                <div className={`text-2xl font-mono font-bold tabular-nums ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Game Board */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center p-4 z-10">
          <div 
            ref={boardRef}
            className="relative w-full max-w-[400px] aspect-[7/10] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
          >
            {/* Particles Layer */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-sm"
                  style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    opacity: p.opacity,
                    transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`
                  }}
                />
              ))}
              
              <AnimatePresence>
                {popups.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: p.y, scale: 0.5 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0], 
                      y: p.y - 100, 
                      scale: p.count > 3 ? [0.5, 1.5, 1.5, 1.2] : [0.5, 1, 1, 0.8] 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute pointer-events-none select-none"
                    style={{ left: p.x, top: 0 }}
                  >
                    <div className={`
                      font-black tabular-nums drop-shadow-lg flex flex-col items-center
                      ${p.count > 4 ? 'text-amber-400 text-4xl' : p.count > 2 ? 'text-sky-400 text-3xl' : 'text-white text-2xl'}
                    `}>
                      <span>+{p.score}</span>
                      {p.count > 3 && (
                        <motion.span 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="text-xs uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full mt-1"
                        >
                          {p.count >= 6 ? '超神!' : '精彩!'}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Grid Background Lines */}
            <div className="absolute inset-0 grid grid-cols-7 grid-rows-10 pointer-events-none opacity-10">
              {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-slate-400" />
              ))}
            </div>

            {/* Blocks */}
            <AnimatePresence>
              {grid.flat().map((block) => (
                <motion.button
                  key={block.id}
                  layoutId={block.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    gridRowStart: block.row + 1,
                    gridColumnStart: block.col + 1,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleBlockClick(block)}
                  className={`
                    m-1 rounded-lg flex items-center justify-center text-xl font-black transition-all border
                    ${getBlockColor(block.value, selectedIds.includes(block.id))}
                  `}
                >
                  {block.value}
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Combo Indicator */}
            {combo > 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                key={combo}
                className="absolute top-4 right-4 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg"
              >
                <Zap className="w-3 h-3 fill-current" />
                {combo}X 连击
              </motion.div>
            )}
          </div>

          {/* Pause Overlay */}
          <AnimatePresence>
            {isPaused && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <h2 className="text-4xl font-black mb-8">已暂停</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="bg-sky-400 text-slate-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-sky-300 transition-colors"
                  >
                    <Play className="w-5 h-5" /> 继续游戏
                  </button>
                  <button 
                    onClick={() => setMode(null)}
                    className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" /> 退出
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-5xl font-black mb-2">游戏结束</h2>
                <p className="text-slate-400 mb-8">方块已经触顶了！</p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold">得分</div>
                    <div className="text-2xl font-black">{score}</div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold">最高分</div>
                    <div className="text-2xl font-black">{highScore}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button 
                    onClick={() => startGame(mode)}
                    className="bg-sky-400 text-slate-950 w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-sky-300 transition-colors"
                  >
                    <RotateCcw className="w-6 h-6" /> 再来一局
                  </button>
                  <button 
                    onClick={() => setMode(null)}
                    className="bg-slate-800 text-white w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                  >
                    返回主菜单
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Info */}
        <footer className="p-4 text-center text-slate-500 text-xs font-medium z-10">
          <p>选择数字使其总和等于目标值。不要让方块触顶。</p>
        </footer>
      </div>
    );
  };

  return gameContent();
}
