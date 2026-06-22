import React, { useState, useCallback, useEffect } from 'react';
import HomeGrid from './components/HomeGrid';
import Shop from './components/Shop';
import Collection from './components/Collection';
import Achievements from './components/Achievements';
import HatchModal from './components/HatchModal';
import { getPetDef } from './data';
import type { Pet, GameState } from './store';
import { loadState, saveState, resetState } from './store';
import { useMerge } from './gameplay/merge';
import { useCheckin } from './gameplay/checkin';
import { useShop } from './gameplay/shop';

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

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    import('./data').then(({ ACHIEVEMENTS }) => {
      ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(state.collected)) {
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

  const { handleMerge, handleSwap, mergeCell } = useMerge({
    state,
    setState,
    showToast,
    setNewPetCell,
  });

  const { handleCheckin } = useCheckin({
    state,
    setState,
    showToast,
    setHatchPet,
    setNewPetCell,
  });

  const { handleBuyEgg } = useShop({
    state,
    setState,
    showToast,
    setHatchPet,
    setNewPetCell,
  });

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
    setState(prev => ({ ...prev, grid: newGrid, gold: prev.gold + def.value }));
    showToast(`出售 ${def.name} 获得 ${def.value} 金币`, 'gold');
  }, [state, showToast]);

  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置所有数据吗？此操作不可撤销。')) {
      const newState = resetState();
      setState(newState);
      showToast('数据已重置', 'info');
    }
  }, [showToast]);

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
