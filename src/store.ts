export interface Pet {
  id: string;
  level: number;
}

export interface GameState {
  grid: (Pet | null)[];
  collected: Record<number, boolean>;
  unlockedAchievements: string[];
  gold: number;
  lastCheckinDate: string | null;
  totalMerges: number;
  highestLevel: number;
}

const STORAGE_KEY = 'pet-merge-save';
const GRID_SIZE = 16;

let nextId = 1;
function makeId(): string {
  return `p${Date.now()}_${nextId++}`;
}

export function createPet(level: number): Pet {
  return { id: makeId(), level };
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function defaultState(): GameState {
  const grid: (Pet | null)[] = new Array(GRID_SIZE).fill(null);
  grid[0] = createPet(1);
  grid[5] = createPet(1);
  grid[10] = createPet(1);
  grid[15] = createPet(1);
  return {
    grid,
    collected: { 1: true },
    unlockedAchievements: [],
    gold: 100,
    lastCheckinDate: null,
    totalMerges: 0,
    highestLevel: 1,
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed.grid && Array.isArray(parsed.grid) && parsed.grid.length === GRID_SIZE) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return defaultState();
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): GameState {
  const state = defaultState();
  saveState(state);
  return state;
}

export function getEmptyCells(grid: (Pet | null)[]): number[] {
  const result: number[] = [];
  grid.forEach((cell, i) => { if (cell === null) result.push(i); });
  return result;
}

export function pickWeightedLevel(min: number, max: number): number {
  const range = max - min + 1;
  if (range === 1) return min;
  // Weighted: lower levels more likely
  const weights: number[] = [];
  for (let i = 0; i < range; i++) {
    weights.push(Math.max(1, range * 2 - i * 3));
  }
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < range; i++) {
    r -= weights[i];
    if (r <= 0) return min + i;
  }
  return min;
}
