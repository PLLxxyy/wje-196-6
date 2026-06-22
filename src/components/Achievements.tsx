import React from 'react';
import { ACHIEVEMENTS } from '../data';

interface Props {
  collected: Record<number, boolean>;
  unlockedAchievements: string[];
  onClaim: (id: string, reward: number) => void;
}

export default function Achievements({ collected, unlockedAchievements, onClaim }: Props) {
  const claimed = new Set(unlockedAchievements);

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>🏆 成就系统</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
          已达成 {unlockedAchievements.length} / {ACHIEVEMENTS.length} 项
        </div>
      </div>

      {ACHIEVEMENTS.map(ach => {
        const isCompleted = ach.check(collected);
        const isClaimed = claimed.has(ach.id);
        const canClaim = isCompleted && !isClaimed;

        return (
          <div key={ach.id} className={`achievement-card ${isClaimed ? 'unlocked' : ''}`}>
            <div className={`achievement-icon ${!isCompleted ? 'locked-icon' : ''}`}>
              {ach.icon}
            </div>
            <div className="achievement-info">
              <div className="achievement-name">{ach.name}</div>
              <div className="achievement-desc">{ach.desc}</div>
              <div className="achievement-reward">
                <span>💰</span>
                <span>奖励 {ach.reward} 金币</span>
              </div>
            </div>
            <div className="achievement-status">
              {isClaimed ? (
                <span style={{ color: 'var(--success)' }}>✅</span>
              ) : canClaim ? (
                <button className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => onClaim(ach.id, ach.reward)}>
                  领取
                </button>
              ) : (
                <span style={{ color: 'var(--text-dim)' }}>🔒</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
