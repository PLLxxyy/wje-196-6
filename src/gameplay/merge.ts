import { useCallback, useState } from 'react';
import type { Pet, GameState } from '../store';
import { createPet } from '../store';
import { getPetDef } from '../data';

interface UseMergeOptions {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  showToast: (text: string, type?: string) => void;
  setNewPetCell: (idx: number | null) => void;
}

export function useMerge({ state, setState, showToast, setNewPetCell }: UseMergeOptions) {
  const [mergeCell, setMergeCell] = useState<number | null>(null);

  const updateGrid = useCallback((newGrid: (Pet | null)[], extra?: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, grid: newGrid, ...extra };
      return next;
    });
  }, [setState]);

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

    import('../data').then(({ ACHIEVEMENTS }) => {
      ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(newCollected)) {
          showToast(`🏆 成就达成: ${ach.name}`, 'gold');
        }
      });
    });
  }, [state, updateGrid, showToast, setNewPetCell]);

  const handleSwap = useCallback((fromIdx: number, toIdx: number) => {
    const newGrid = [...state.grid];
    const temp = newGrid[fromIdx];
    newGrid[fromIdx] = newGrid[toIdx];
    newGrid[toIdx] = temp;
    updateGrid(newGrid);
  }, [state.grid, updateGrid]);

  return { handleMerge, handleSwap, mergeCell };
}
