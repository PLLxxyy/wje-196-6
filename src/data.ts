export interface PetDef {
  level: number;
  name: string;
  emoji: string;
  rarity: string;
  rarityName: string;
  value: number;
}

export const PETS: PetDef[] = [
  { level: 1, name: '蚂蚁', emoji: '🧄', rarity: 'common', rarityName: '普通', value: 10 },
  { level: 2, name: '兔子', emoji: '🐇', rarity: 'common', rarityName: '普通', value: 30 },
  { level: 3, name: '小猫', emoji: '🐈', rarity: 'uncommon', rarityName: '优良', value: 80 },
  { level: 4, name: '小狗', emoji: '🐕', rarity: 'uncommon', rarityName: '优良', value: 200 },
  { level: 5, name: '狐狸', emoji: '🦊', rarity: 'rare', rarityName: '稀有', value: 500 },
  { level: 6, name: '熊猫', emoji: '🐼', rarity: 'epic', rarityName: '史诗', value: 1200 },
  { level: 7, name: '独角兽', emoji: '🦄', rarity: 'epic', rarityName: '史诗', value: 3000 },
  { level: 8, name: '凤凰', emoji: '🦥', rarity: 'legendary', rarityName: '传说', value: 8000 },
  { level: 9, name: '麒麟', emoji: '🦬', rarity: 'mythic', rarityName: '神话', value: 20000 },
  { level: 10, name: '神龙', emoji: '🐉', rarity: 'supreme', rarityName: '至尊', value: 50000 },
];

export function getPetDef(level: number): PetDef {
  return PETS[level - 1];
}

export const EGG_TYPES = [
  { id: 'common', name: '普通蛋', emoji: '🥚', price: 100, desc: '可孵出 Lv.1~2 宠物', minLevel: 1, maxLevel: 2 },
  { id: 'rare', name: '稀有蛋', emoji: '🥚', price: 350, desc: '可孵出 Lv.1~3 宠物', minLevel: 1, maxLevel: 3 },
  { id: 'epic', name: '史诗蛋', emoji: '🥚', price: 800, desc: '可孵出 Lv.1~4 宠物', minLevel: 1, maxLevel: 4 },
  { id: 'legendary', name: '传说蛋', emoji: '🥚', price: 2000, desc: '可孵出 Lv.2~5 宠物', minLevel: 2, maxLevel: 5 },
];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  reward: number;
  check: (collected: Record<number, boolean>) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_rare', name: '初见稀有', desc: '收集第一只稀有宠物', icon: '⭐', reward: 200, check: c => !!c[5] },
  { id: 'first_epic', name: '史诗之路', desc: '收集第一只史诗宠物', icon: '🌟', reward: 500, check: c => !!c[6] },
  { id: 'first_legend', name: '传说降临', desc: '收集第一只传说宠物', icon: '💫', reward: 1500, check: c => !!c[8] },
  { id: 'first_myth', name: '神话觉醒', desc: '收集第一只神话宠物', icon: '🔥', reward: 5000, check: c => !!c[9] },
  { id: 'dragon', name: '神龙在天', desc: '收集至尊神龙', icon: '🐉', reward: 20000, check: c => !!c[10] },
  { id: 'common_all', name: '普通全收集', desc: '收集全部普通宠物', icon: '🏠', reward: 100, check: c => !!c[1] && !!c[2] },
  { id: 'uncommon_all', name: '优良全收集', desc: '收集全部优良宠物', icon: '🏠', reward: 300, check: c => !!c[3] && !!c[4] },
  { id: 'rare_all', name: '稀有全收集', desc: '收集全部稀有宠物', icon: '🏠', reward: 800, check: c => !!c[5] },
  { id: 'half', name: '半壁江山', desc: '收集 5 种不同宠物', icon: '🏗', reward: 1000, check: c => Object.keys(c).length >= 5 },
  { id: 'all_pets', name: '全图鉴大师', desc: '收集全部 10 种宠物', icon: '🏆', reward: 50000, check: c => Object.keys(c).length >= 10 },
];

export const RARITY_COLORS: Record<string, string> = {
  common: '#9e9e9e',
  uncommon: '#66bb6a',
  rare: '#42a5f5',
  epic: '#ab47bc',
  legendary: '#ffa726',
  mythic: '#ef5350',
  supreme: '#ffd700',
};
