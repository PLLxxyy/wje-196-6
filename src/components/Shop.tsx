import React from 'react';
import { PETS, getPetDef, RARITY_COLORS, EGG_TYPES } from '../data';

interface Props {
  collected: Record<number, boolean>;
  gold: number;
  lastCheckinDate: string | null;
  onCheckin: () => void;
  onBuyEgg: (eggId: string) => void;
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'supreme'];
const RARITY_NAMES: Record<string, string> = {
  common: '普通', uncommon: '优良', rare: '稀有', epic: '史诗',
  legendary: '传说', mythic: '神话', supreme: '至尊',
};

export default function Shop({ collected, gold, lastCheckinDate, onCheckin, onBuyEgg }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedIn = lastCheckinDate === today;

  const total = Object.keys(collected).length;

  return (
    <div className="page">
      {/* Daily Check-in */}
      <div className={`checkin-banner ${hasCheckedIn ? 'checkin-done' : ''}`}>
        <h3>{hasCheckedIn ? '✨ 今日已签到' : '📅 每日签到'}</h3>
        <p>{hasCheckedIn ? '明天再来领取宠物蛋吧！' : '签到即可领取一枚免费宠物蛋'}</p>
        <button
          className={`btn ${hasCheckedIn ? 'btn-outline' : 'btn-success'}`}
          onClick={onCheckin}
          disabled={hasCheckedIn}
        >
          {hasCheckedIn ? '已完成' : '🥚 领取宠物蛋'}
        </button>
      </div>

      {/* Egg Shop */}
      <div className="shop-section">
        <div className="shop-section-title">🛒 蛋店</div>
        {EGG_TYPES.map(egg => (
          <div className="egg-card" key={egg.id}>
            <div className="egg-icon">{egg.emoji}</div>
            <div className="egg-info">
              <div className="egg-name">{egg.name}</div>
              <div className="egg-desc">{egg.desc}</div>
              <div className="egg-price">
                <span>💰</span>
                <span>{egg.price}</span>
              </div>
            </div>
            <button
              className="btn btn-gold"
              onClick={() => onBuyEgg(egg.id)}
              disabled={gold < egg.price}
            >
              购买
            </button>
          </div>
        ))}
      </div>

      {/* Sell Pets hint */}
      <div className="shop-section">
        <div className="shop-section-title">📊 收集进度</div>
        <div style={{ padding: '12px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            已收集 <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{total}</span> / {PETS.length} 种宠物
          </div>
          <div className="collection-bar-bg">
            <div className="collection-bar-fill" style={{ width: `${(total / PETS.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
