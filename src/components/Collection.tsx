import React from 'react';
import { PETS, RARITY_COLORS } from '../data';

interface Props {
  collected: Record<number, boolean>;
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'supreme'];
const RARITY_NAMES: Record<string, string> = {
  common: '普通', uncommon: '优良', rare: '稀有', epic: '史诗',
  legendary: '传说', mythic: '神话', supreme: '至尊',
};

export default function Collection({ collected }: Props) {
  const total = Object.keys(collected).length;

  const grouped = RARITY_ORDER.map(rarity => ({
    rarity,
    name: RARITY_NAMES[rarity],
    color: RARITY_COLORS[rarity],
    pets: PETS.filter(p => p.rarity === rarity),
  }));

  return (
    <div className="page">
      <div className="collection-header">
        <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>📖 宠物图鉴</h2>
        <div className="collection-progress">
          已收集 {total} / {PETS.length} 种
        </div>
        <div className="collection-bar-bg" style={{ maxWidth: '300px', margin: '10px auto 0' }}>
          <div className="collection-bar-fill" style={{ width: `${(total / PETS.length) * 100}%` }} />
        </div>
      </div>

      {grouped.map(group => (
        <div className="rarity-group" key={group.rarity}>
          <div className="rarity-group-title" style={{ color: group.color }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: group.color,
            }} />
            {group.name}
          </div>
          <div className="pet-card-grid">
            {group.pets.map(pet => {
              const isCollected = !!collected[pet.level];
              return (
                <div
                  key={pet.level}
                  className={`pet-card ${isCollected ? 'collected' : 'locked'}`}
                  style={isCollected ? {
                    borderColor: RARITY_COLORS[pet.rarity] + '40',
                    background: RARITY_COLORS[pet.rarity] + '12',
                  } : undefined}
                >
                  {!isCollected && <span className="lock-icon">🔒</span>}
                  <span className="pet-avatar">{pet.emoji}</span>
                  <span className="pet-card-name">{isCollected ? pet.name : '???'}</span>
                  <span className="pet-card-level" style={isCollected ? { color: RARITY_COLORS[pet.rarity] } : undefined}>
                    Lv.{pet.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
