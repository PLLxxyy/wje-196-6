import React, { useEffect, useState } from 'react';
import { getPetDef, RARITY_COLORS } from '../data';
import type { Pet } from '../store';

interface Props {
  pet: Pet;
  onClose: () => void;
}

export default function HatchModal({ pet, onClose }: Props) {
  const [phase, setPhase] = useState<'wobble' | 'crack' | 'reveal'>('wobble');
  const def = getPetDef(pet.level);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('crack'), 1200);
    const t2 = setTimeout(() => setPhase('reveal'), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="modal-overlay" onClick={phase === 'reveal' ? onClose : undefined}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          {phase === 'reveal' ? '🎉 孵化成功！' : '🥚 正在孵化...'}
        </div>

        {phase !== 'reveal' ? (
          <div style={{ fontSize: '72px', margin: '30px 0' }}>
            <span className={phase === 'crack' ? 'egg-crack' : 'egg-wobble'}>🥚</span>
          </div>
        ) : (
          <>
            <div className="hatch-pet">{def.emoji}</div>
            <div className="hatch-name">{def.name}</div>
            <div
              className="hatch-rarity"
              style={{ background: RARITY_COLORS[def.rarity] + '30', color: RARITY_COLORS[def.rarity] }}
            >
              Lv.{pet.level} · {def.rarityName}
            </div>
            <Confetti />
          </>
        )}

        {phase === 'reveal' && (
          <button className="btn btn-primary btn-lg" onClick={onClose} style={{ marginTop: '10px', width: '100%' }}>
            太好了！
          </button>
        )}
      </div>
    </div>
  );
}

function Confetti() {
  const [particles, setParticles] = useState<{ x: number; emoji: string; delay: number }[]>([]);

  useEffect(() => {
    const items = [];
    for (let i = 0; i < 15; i++) {
      items.push({
        x: Math.random() * 100,
        emoji: ['✨', '⭐', '🎉', '💫', '🌟'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      });
    }
    setParticles(items);
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${p.x}%`,
            top: '30%',
            animationDelay: `${p.delay}s`,
          }}
        >{p.emoji}</span>
      ))}
    </>
  );
}
