import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getPetDef, RARITY_COLORS } from '../data';
import type { Pet } from '../store';

interface Props {
  grid: (Pet | null)[];
  onMerge: (fromIdx: number, toIdx: number) => void;
  onSwap: (fromIdx: number, toIdx: number) => void;
  newPetCell: number | null;
  mergeCell: number | null;
}

export default function HomeGrid({ grid, onMerge, onSwap, newPetCell, mergeCell }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [mergeEffects, setMergeEffects] = useState<number[]>([]);
  const [mergeTexts, setMergeTexts] = useState<Record<number, string>>({});
  const prevMergeRef = useRef(mergeCell);

  useEffect(() => {
    if (mergeCell !== null && mergeCell !== prevMergeRef.current) {
      const pet = grid[mergeCell];
      if (pet) {
        const def = getPetDef(pet.level);
        setMergeEffects(prev => [...prev, mergeCell]);
        setMergeTexts(prev => ({ ...prev, [mergeCell]: `Lv.${pet.level} ${def.name}!` }));
        setTimeout(() => {
          setMergeEffects(prev => prev.filter(i => i !== mergeCell));
          setMergeTexts(prev => {
            const next = { ...prev };
            delete next[mergeCell];
            return next;
          });
        }, 800);
      }
    }
    prevMergeRef.current = mergeCell;
  }, [mergeCell, grid]);

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    if (grid[idx] === null) return;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    requestAnimationFrame(() => {
      const el = document.getElementById(`cell-${idx}`);
      if (el) el.classList.add('dragging');
    });
  }, [grid]);

  const handleDragEnd = useCallback(() => {
    if (dragIdx !== null) {
      const el = document.getElementById(`cell-${dragIdx}`);
      if (el) el.classList.remove('dragging');
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx]);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverIdx(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    setOverIdx(null);
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIdx) || fromIdx === toIdx) return;

    const fromPet = grid[fromIdx];
    const toPet = grid[toIdx];
    if (!fromPet) return;

    if (toPet && fromPet.level === toPet.level) {
      onMerge(fromIdx, toIdx);
    } else if (!toPet) {
      onSwap(fromIdx, toIdx);
    } else {
      onSwap(fromIdx, toIdx);
    }
  }, [grid, onMerge, onSwap]);

  return (
    <div className="grid-container">
      <div className="grid">
        {grid.map((pet, idx) => {
          const isDragOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;
          const hasMergeEffect = mergeEffects.includes(idx);
          const isNew = newPetCell === idx;
          const def = pet ? getPetDef(pet.level) : null;

          let cellClass = 'cell';
          if (pet) cellClass += ` has-pet rarity-${def!.rarity}`;
          if (isDragOver) cellClass += ' drag-over';

          return (
            <div
              key={idx}
              id={`cell-${idx}`}
              className={cellClass}
              draggable={!!pet}
              onDragStart={e => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, idx)}
              style={pet ? { borderColor: RARITY_COLORS[def!.rarity] + '60', background: RARITY_COLORS[def!.rarity] + '15' } : undefined}
            >
              {pet && def && (
                <>
                  <span className={`pet-avatar ${isNew ? 'new-pet-anim' : ''}`}>{def.emoji}</span>
                  <span className={`pet-level badge-${def.rarity}`}>Lv.{pet.level}</span>
                  <span className="pet-name">{def.name}</span>
                </>
              )}

              {hasMergeEffect && (
                <div className="merge-effect">
                  <div className="merge-ring" />
                  <div className="merge-ring" />
                  {['✨', '⭐', '💫'].map((s, i) => {
                    const angle = (i * 120) * Math.PI / 180;
                    const r = 25;
                    return (
                      <span
                        key={i}
                        className="merge-sparkle"
                        style={{
                          left: `calc(50% + ${Math.cos(angle) * r}px - 7px)`,
                          top: `calc(50% + ${Math.sin(angle) * r}px - 7px)`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      >{s}</span>
                    );
                  })}
                  {mergeTexts[idx] && <span className="merge-text">{mergeTexts[idx]}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hint-text">拖拽相同等级宠物合成升级 | 拖拽空位移动宠物</div>
    </div>
  );
}
