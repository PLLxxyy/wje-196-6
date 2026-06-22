import { useCallback } from 'react';
import type { Pet, GameState } from '../store';
import { createPet, getEmptyCells, pickWeightedLevel } from '../store';
import { EGG_TYPES } from '../data';

interface UseShopOptions {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  showToast: (text: string, type?: string) => void;
  setHatchPet: (pet: Pet | null) => void;
  setNewPetCell: (idx: number | null) => void;
}

export function useShop({ state, setState, showToast, setHatchPet, setNewPetCell }: UseShopOptions) {
  const updateGrid = useCallback((newGrid: (Pet | null)[], extra?: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, grid: newGrid, ...extra };
      return next;
    });
  }, [setState]);

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
  }, [state, updateGrid, showToast, setHatchPet, setNewPetCell]);

  return { handleBuyEgg };
}
