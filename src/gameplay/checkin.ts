import { useCallback } from 'react';
import type { Pet, GameState } from '../store';
import { createPet, getEmptyCells, pickWeightedLevel } from '../store';

interface UseCheckinOptions {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  showToast: (text: string, type?: string) => void;
  setHatchPet: (pet: Pet | null) => void;
  setNewPetCell: (idx: number | null) => void;
}

export function useCheckin({ state, setState, showToast, setHatchPet, setNewPetCell }: UseCheckinOptions) {
  const updateGrid = useCallback((newGrid: (Pet | null)[], extra?: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, grid: newGrid, ...extra };
      return next;
    });
  }, [setState]);

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
  }, [state, updateGrid, showToast, setHatchPet, setNewPetCell]);

  return { handleCheckin };
}
