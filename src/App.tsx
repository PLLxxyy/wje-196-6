import React, { useState, useCallback, useEffect } from 'react';
import HomeGrid from './components/HomeGrid';
import Shop from './components/Shop';
import Collection from './components/Collection';
import Achievements from './components/Achievements';
import HatchModal from './components/HatchModal';
import { getPetDef, EGG_TYPES } from './data';
import type { Pet, GameState } from './store';
import {
  loadState, saveState, resetState, createPet,
  getEmptyCells, pickWeightedLevel,
} from './store';

type Tab = 'home' | 'shop' | 'collection' | 'achievements';

interface Toast {
  id: number;
  text: string;
  type: string;
}

let toastId = 0;

export default function App() {
  const [state, setState] = useState<GameState>(loadState);
  const [tab, setTab] = useState<Tab>('home');
  const [hatchPet, setHatchPet] = useState<Pet | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newPetCell, setNewPetCell] = useState<number | null>(null);
  const [mergeCell, setMergeCell] = useState<number | null>(null);

  // Persist state
  useEffect(() => { saveState(state); }, [state]);

  // Check achievements on state change
  useEffect(() => {
    // Import dynamically to avoid issues
    import('./data').then(({ ACHIEVEMENTS }) => {
      ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(state.collected)) {
          // Achievement ready to claim (don't auto-claim, let user click)
        }
      });
    });
  }, [state.collected, state.unlockedAchievements]);

  const showToast = useCallback((text: string, type: string = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, type: t.type + ' toast-out' } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 2000);
  }, []);

  const updateGrid = useCallback((newGrid: (Pet | null)[], extra?: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, grid: newGrid, ...extra };
      return next;
    });
  }, []);

  const handleMerge = useCallback((fromIdx: number, toIdx: number) => {
    const fromPet = state.grid[fromIdx];
    const toPet = state.grid[toIdx];
    if (!fromPet || !toPet || fromPet.level !== toPet.level) return;
    if (fromPet.level >= 10) {
      showToast('已达最高等级，无法继续合成', 'info');
      return;
    }

    const newLevel = fromPet.level + 1;
    const newPet = createPet(newLevel);
    const newGrid = [...state.grid];
    newGrid[fromIdx] = null;
    newGrid[toIdx] = newPet;

    const def = getPetDef(newLevel);
    const newCollected = { ...state.collected, [newLevel]: true };
    const newHighest = Math.max(state.highestLevel, newLevel);

    updateGrid(newGrid, {
      collected: newCollected,
      totalMerges: state.totalMerges + 1,
      highestLevel: newHighest,
    });

    setMergeCell(toIdx);
    setNewPetCell(toIdx);
    setTimeout(() => setNewPetCell(null), 600);

    showToast(`合成成功！获得 Lv.${newLevel} ${def.name}`, 'success');

    // Auto-check and show achievement notifications
    import('./data').then(({ ACHIEVEMENTS }) => {
      ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(newCollected)) {
          showToast(`🏆 成就达成: ${ach.name}`, 'gold');
        }
      });
    });
  }, [state, updateGrid, showToast]);

  const handleSwap = useCallback((fromIdx: number, toIdx: number) => {
    const newGrid = [...state.grid];
    const temp = newGrid[fromIdx];
    newGrid[fromIdx] = newGrid[toIdx];
    newGrid[toIdx] = temp;
    updateGrid(newGrid);
  }, [state.grid, updateGrid]);

  const handleCheckin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastCheckinDate === today) {
      showToast('今天已经签到过了', 'info');
      return;
    }

    const emptyCells = getEmptyCells(state.grid);
    if (emptyCells.length === 0) {
      showToast('宠物格已满，请先合成腾出空间', 'info');
      return;
    }

    const level = pickWeightedLevel(1, 2);
    const pet = createPet(level);
    const cellIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...state.grid];
    newGrid[cellIdx] = pet;

    const newCollected = { ...state.collected, [level]: true };
    updateGrid(newGrid, {
      collected: newCollected,
      lastCheckinDate: today,
    });
    setHatchPet(pet);
    setNewPetCell(cellIdx);
    setTimeout(() => setNewPetCell(null), 600);
  }, [state, updateGrid, showToast]);

  const handleBuyEgg = useCallback((eggId: string) => {
    const egg = EGG_TYPES.find(e => e.id === eggId);
    if (!egg) return;
    if (state.gold < egg.price) {
      showToast('金币不足', 'info');
      return;
    }
    const emptyCells = getEmptyCells(state.grid);
    if (emptyCells.length === 0) {
      showToast('宠物格已满，请先合成腾出空间', 'info');
      return;
    }

    const level = pickWeightedLevel(egg.minLevel, egg.maxLevel);
    const pet = createPet(level);
    const cellIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...state.grid];
    newGrid[cellIdx] = pet;

    const newCollected = { ...state.collected, [level]: true };
    updateGrid(newGrid, {
      collected: newCollected,
      gold: state.gold - egg.price,
    });
    setHatchPet(pet);
    setNewPetCell(cellIdx);
    setTimeout(() => setNewPetCell(null), 600);
    showToast(`花费 ${egg.price} 金币购买了 ${egg.name}`, 'gold');
  }, [state, updateGrid, showToast]);

  const handleClaimAchievement = useCallback((id: string, reward: number) => {
    if (state.unlockedAchievements.includes(id)) return;
    setState(prev => ({
      ...prev,
      unlockedAchievements: [...prev.unlockedAchievements, id],
      gold: prev.gold + reward,
    }));
    showToast(`领取成就奖励 +${reward} 金币`, 'gold');
  }, [state.unlockedAchievements, showToast]);

  const handleSellPet = useCallback((idx: number) => {
    const pet = state.grid[idx];
    if (!pet) return;
    const def = getPetDef(pet.level);
    const newGrid = [...state.grid];
    newGrid[idx] = null;
    updateGrid(newGrid, { gold: state.gold + def.value });
    showToast(`出售 ${def.name} 获得 ${def.value} 金币`, 'gold');
  }, [state, updateGrid, showToast]);

  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置所有数据吗？此操作不可撤销。')) {
      const newState = resetState();
      setState(newState);
      showToast('数据已重置', 'info');
    }
  }, [showToast]);

  // Sell mode: long press on pet
  const [sellMode, setSellMode] = useState(false);

  const gridContent = tab === 'home' ? (
    <div className="page">
      <HomeGrid
        grid={state.grid}
        onMerge={handleMerge}
        onSwap={handleSwap}
        newPetCell={newPetCell}
        mergeCell={mergeCell}
      />
      <div className="grid-actions">
        <button className="btn btn-outline" onClick={() => setSellMode(!sellMode)}>
          {sellMode ? '完成' : '💰 出售宠物'}
        </button>
        <button className="btn btn-outline" onClick={handleReset} style={{ color: 'var(--danger)' }}>
          🔄 重置
        </button>
      </div>
      {sellMode && (
        <SellPanel grid={state.grid} onSell={handleSellPet} />
      )}
    </div>
  ) : null;

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-title">🐾 宠物合成</div>
          <div className="header-stats">
            <div className="stat-item stat-gold">
              <span className="stat-icon">💰</span>
              <span>{state.gold.toLocaleString()}</span>
            </div>
            <div className="stat-item" style={{ color: 'var(--accent)' }}>
              <span className="stat-icon">📊</span>
              <span>{Object.keys(state.collected).length}/10</span>
            </div>
          </div>
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            🏠 家园
          </button>
          <button className={`nav-tab ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
            🛒 商店
          </button>
          <button className={`nav-tab ${tab === 'collection' ? 'active' : ''}`} onClick={() => setTab('collection')}>
            📖 图鉴
          </button>
          <button className={`nav-tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
            🏆 成就
          </button>
        </div>
      </header>

      {gridContent}
      {tab === 'shop' && (
        <Shop
          collected={state.collected}
          gold={state.gold}
          lastCheckinDate={state.lastCheckinDate}
          onCheckin={handleCheckin}
          onBuyEgg={handleBuyEgg}
        />
      )}
      {tab === 'collection' && <Collection collected={state.collected} />}
      {tab === 'achievements' && (
        <Achievements
          collected={state.collected}
          unlockedAchievements={state.unlockedAchievements}
          onClaim={handleClaimAchievement}
        />
      )}

      {hatchPet && <HatchModal pet={hatchPet} onClose={() => setHatchPet(null)} />}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type.split(' ')[0]}`}>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}

function SellPanel({ grid, onSell }: { grid: (Pet | null)[], onSell: (idx: number) => void }) {
  const petsWithIdx = grid
    .map((pet, idx) => ({ pet, idx }))
    .filter(x => x.pet !== null) as { pet: Pet; idx: number }[];

  if (petsWithIdx.length === 0) {
    return <div className="hint-text">没有可出售的宠物</div>;
  }

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
        点击出售宠物，获得对应金币
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {petsWithIdx.map(({ pet, idx }) => {
          const def = getPetDef(pet.level);
          return (
            <button
              key={pet.id}
              className="btn btn-outline"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              onClick={() => onSell(idx)}
            >
              {def.emoji} Lv.{pet.level} +{def.value}💰
            </button>
          );
        })}
      </div>
    </div>
  );
}
