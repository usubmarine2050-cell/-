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
  XCircle
} from 'lucide-react';
import { 
  GameMode, 
  Block, 
  GRID_ROWS, 
  GRID_COLS, 
  INITIAL_ROWS, 
  MAX_VALUE, 
  TIME_LIMIT 
} from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createBlock = (row: number, col: number): Block => ({
  id: generateId(),
  value: Math.floor(Math.random() * MAX_VALUE) + 1,
  row,
  col
});

export default function App() {
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize high score from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sumstack_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('sumstack_highscore', score.toString());
    }
  }, [score, highScore]);

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

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white">
              数字<span className="text-sky-400">堆栈</span>
            </h1>
            <p className="text-slate-400 font-medium">精通数学，清空堆栈。</p>
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

          <div className="pt-8 border-t border-slate-800">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Trophy className="w-4 h-4" />
              <span>最高分: {highScore}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans select-none">
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
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-[400px] aspect-[7/10] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          }}
        >
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
                  m-1 rounded-lg flex items-center justify-center text-xl font-black transition-all
                  ${selectedIds.includes(block.id) 
                    ? 'bg-sky-400 text-slate-950 scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 block-shadow'}
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
      <footer className="p-4 text-center text-slate-500 text-xs font-medium">
        <p>选择数字使其总和等于目标值。不要让方块触顶。</p>
      </footer>
    </div>
  );
}
