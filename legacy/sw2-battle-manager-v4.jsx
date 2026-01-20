import { useState } from 'react';

// ============================================
// テンプレートデータ（将来的にサーバーから取得）
// ============================================
const CHARACTER_TEMPLATES = {
  allies: [
    {
      id: 'tpl-ally-warrior',
      name: 'サンプル戦士',
      type: 'ally',
      stats: { dex: 14, agi: 12, str: 18, vit: 16, int: 8, mnd: 10 },
      skillLevels: { 'ファイター': 3, 'スカウト': 1 },
      modifiers: { hitMod: 0, dodgeMod: 0, defense: 5 },
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-ally-mage',
      name: 'サンプル魔法使い',
      type: 'ally',
      stats: { dex: 12, agi: 10, str: 8, vit: 10, int: 18, mnd: 16 },
      skillLevels: { 'ソーサラー': 3, 'セージ': 2 },
      modifiers: { hitMod: 0, dodgeMod: 0, defense: 1 },
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-ally-priest',
      name: 'サンプル神官',
      type: 'ally',
      stats: { dex: 12, agi: 12, str: 12, vit: 14, int: 14, mnd: 16 },
      skillLevels: { 'プリースト': 3, 'ファイター': 1 },
      modifiers: { hitMod: 0, dodgeMod: 0, defense: 3 },
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-ally-allskill',
      name: '全技能キャラ（テスト用）',
      type: 'ally',
      stats: { dex: 18, agi: 18, str: 18, vit: 18, int: 18, mnd: 18 },
      skillLevels: {
        'ファイター': 5, 'グラップラー': 5, 'フェンサー': 5, 'シューター': 5,
        'ソーサラー': 5, 'コンジャラー': 5, 'プリースト': 5, 'マギテック': 5, 'フェアリーテイマー': 5,
        'スカウト': 5, 'レンジャー': 5, 'セージ': 5, 'エンハンサー': 5, 'バード': 5, 'ライダー': 5, 'アルケミスト': 5, 'ウォーリーダー': 5,
      },
      modifiers: { hitMod: 0, dodgeMod: 0, defense: 10 },
      hidden: false,
      password: '',
    },
    // 合言葉で表示される隠しキャラ例
    {
      id: 'tpl-ally-secret',
      name: '隠し勇者',
      type: 'ally',
      stats: { dex: 20, agi: 20, str: 20, vit: 20, int: 20, mnd: 20 },
      skillLevels: { 'ファイター': 7, 'プリースト': 5, 'セージ': 3 },
      modifiers: { hitMod: 2, dodgeMod: 2, defense: 12 },
      hidden: true,
      password: 'hero',
    },
  ],
  enemies: [
    {
      id: 'tpl-enemy-goblin',
      name: 'ゴブリン',
      type: 'enemy',
      hp: 15,
      mp: 0,
      hit: 4,
      dodge: 4,
      defense: 2,
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-enemy-orc',
      name: 'オーク',
      type: 'enemy',
      hp: 30,
      mp: 0,
      hit: 6,
      dodge: 5,
      defense: 4,
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-enemy-ogre',
      name: 'オーガ',
      type: 'enemy',
      hp: 50,
      mp: 10,
      hit: 8,
      dodge: 6,
      defense: 6,
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-enemy-dragon',
      name: 'ドラゴン（3部位）',
      type: 'enemy',
      parts: [
        { name: '頭部', hp: 60, mp: 40, hit: 12, dodge: 10, defense: 10 },
        { name: '胴体', hp: 100, mp: 0, hit: 10, dodge: 8, defense: 12 },
        { name: '尾', hp: 40, mp: 0, hit: 9, dodge: 9, defense: 8 },
      ],
      hidden: false,
      password: '',
    },
    {
      id: 'tpl-enemy-hydra',
      name: 'ヒドラ（5部位）',
      type: 'enemy',
      parts: [
        { name: '頭1', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
        { name: '頭2', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
        { name: '頭3', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
        { name: '頭4', hp: 30, mp: 0, hit: 8, dodge: 7, defense: 5 },
        { name: '胴体', hp: 80, mp: 0, hit: 6, dodge: 5, defense: 8 },
      ],
      hidden: false,
      password: '',
    },
    // 合言葉で表示される隠しボス例
    {
      id: 'tpl-enemy-secretboss',
      name: '裏ボス',
      type: 'enemy',
      parts: [
        { name: '本体', hp: 200, mp: 100, hit: 15, dodge: 12, defense: 15 },
        { name: '右腕', hp: 80, mp: 0, hit: 14, dodge: 10, defense: 10 },
        { name: '左腕', hp: 80, mp: 0, hit: 14, dodge: 10, defense: 10 },
      ],
      hidden: true,
      password: 'boss',
    },
  ],
};

// ============================================
// プリセット練技データ
// ============================================
const PRESET_SKILLS = [
  { name: 'ガゼルフット', effect: '回避+1', duration: 3, buffType: 'dodge', buffValue: 1 },
  { name: 'キャッツアイ', effect: '命中+1', duration: 3, buffType: 'hit', buffValue: 1 },
  { name: 'ビートルスキン', effect: '防護点+2', duration: 3, buffType: 'defense', buffValue: 2 },
  { name: 'マッスルベアー', effect: '筋力B+2', duration: 3, buffType: 'strBonus', buffValue: 2 },
  { name: 'ケンタウロスレッグ', effect: '敏捷度+12', duration: 1, buffType: 'agi', buffValue: 12 },
  { name: 'ジャイアントアーム', effect: '筋力+12', duration: 1, buffType: 'str', buffValue: 12 },
  { name: 'スフィンクスノレッジ', effect: '知力+12', duration: 1, buffType: 'int', buffValue: 12 },
  { name: 'デーモンフィンガー', effect: '器用度+12', duration: 1, buffType: 'dex', buffValue: 12 },
];

// 鼓咆プリセットデータ
const KOHO_PRESETS = {
  attack: [
    { name: '怒涛の攻陣', effect: '物理ダメージ+2', physicalDamage: 2, magicDamage: 0 },
    { name: '堅陣の攻陣', effect: '物理ダメージ+1', physicalDamage: 1, magicDamage: 0 },
  ],
  defense: [
    { name: '鉄壁の防陣', effect: '物理ダメージ-1, 魔法ダメージ-1', physicalReduce: 1, magicReduce: 1 },
    { name: '金剛の防陣', effect: '物理ダメージ-2', physicalReduce: 2, magicReduce: 0 },
  ]
};

// 技能定義
const SKILL_CATEGORIES = {
  warrior: {
    label: '戦士系',
    skills: ['ファイター', 'グラップラー', 'フェンサー', 'シューター']
  },
  magic: {
    label: '魔法系',
    skills: ['ソーサラー', 'コンジャラー', 'プリースト', 'マギテック', 'フェアリーテイマー']
  },
  other: {
    label: 'その他',
    skills: ['スカウト', 'レンジャー', 'セージ', 'エンハンサー', 'バード', 'ライダー', 'アルケミスト', 'ウォーリーダー']
  }
};

// 魔法系技能リスト
const MAGIC_SKILLS = SKILL_CATEGORIES.magic.skills;

// 魔法系技能と魔法名の対応
const MAGIC_NAMES = {
  'ソーサラー': '真語魔法',
  'コンジャラー': '操霊魔法',
  'プリースト': '神聖魔法',
  'マギテック': '魔動機術',
  'フェアリーテイマー': '妖精魔法',
};

// 威力表（10刻み、出目2〜12）※出目2は自動失敗
const POWER_TABLE = {
  0:   [0, 0, 0, 0, 1, 2, 2, 3, 3, 4, 4],
  10:  [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7],
  20:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  30:  [0, 2, 4, 4, 6, 7, 8, 9, 10, 10, 10],
  40:  [0, 4, 5, 6, 7, 9, 10, 11, 11, 12, 13],
  50:  [0, 4, 6, 8, 10, 10, 12, 12, 13, 15, 15],
  60:  [0, 5, 9, 10, 11, 12, 13, 14, 15, 16, 18],
  70:  [0, 5, 9, 10, 12, 14, 16, 17, 18, 19, 19],
  80:  [0, 6, 9, 10, 13, 16, 18, 20, 21, 22, 23],
  90:  [0, 7, 10, 12, 15, 18, 19, 21, 23, 25, 26],
  100: [0, 8, 12, 15, 18, 19, 20, 22, 24, 27, 30],
};

// 2d6を振る
const roll2d6 = () => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2 };
};

// 威力表からダメージを取得
const getPowerDamage = (power, roll) => {
  const table = POWER_TABLE[power];
  if (!table) return 0;
  return table[roll - 2] || 0;
};

// ダメージ計算（クリティカル処理込み）
const calcDamage = (power, critValue, extraDamage = 0) => {
  const rolls = [];
  let totalDamage = 0;
  let currentRoll = roll2d6();
  rolls.push(currentRoll);
  
  // クリティカル処理
  while (currentRoll.total >= critValue && critValue <= 12) {
    totalDamage += getPowerDamage(power, currentRoll.total);
    currentRoll = roll2d6();
    rolls.push(currentRoll);
  }
  
  // 最後のロール分を加算
  totalDamage += getPowerDamage(power, currentRoll.total);
  
  return {
    rolls,
    baseDamage: totalDamage,
    extraDamage,
    totalDamage: totalDamage + extraDamage,
    isCritical: rolls.length > 1
  };
};

// 戦闘系技能リスト
const COMBAT_SKILLS = ['ファイター', 'グラップラー', 'フェンサー', 'シューター'];

// 最高戦闘技能レベル算出
const calcCombatLevel = (skillLevels) => {
  const combatLevels = COMBAT_SKILLS.map(s => skillLevels?.[s] || 0);
  return Math.max(...combatLevels, 0);
};

// バフ効果の集計
const calcBuffEffects = (buffs) => {
  const effects = {
    hit: 0,
    dodge: 0,
    defense: 0,
    vitResist: 0,
    mndResist: 0,
    strBonus: 0,
    power: 0,
    magicDefense: 0, // 魔法防御
    physicalReduce: 0, // 物理ダメージ軽減
    magicReduce: 0, // 魔法ダメージ軽減
    // 能力値直接バフ
    dex: 0,
    agi: 0,
    str: 0,
    vit: 0,
    int: 0,
    mnd: 0,
  };
  (buffs || []).forEach(buff => {
    if (buff.buffType && buff.buffValue) {
      effects[buff.buffType] = (effects[buff.buffType] || 0) + buff.buffValue;
    }
  });
  return effects;
};

// ボーナス計算（÷6切り捨て）
const calcBonus = (value) => Math.floor(value / 6);

// 冒険者レベル算出（最高技能レベル）
const calcAdventurerLevel = (skillLevels) => {
  const allLevels = Object.values(skillLevels || {}).map(v => parseInt(v) || 0);
  return allLevels.length > 0 ? Math.max(...allLevels, 0) : 0;
};

// 魔法系レベル合計算出
const calcMagicLevel = (skillLevels) => {
  const magicLevels = MAGIC_SKILLS.map(s => parseInt(skillLevels?.[s]) || 0);
  return magicLevels.reduce((sum, lv) => sum + lv, 0);
};

// HP最大値計算
const calcMaxHp = (vit, skillLevels) => {
  return vit + (calcAdventurerLevel(skillLevels) * 3);
};

// MP最大値計算
const calcMaxMp = (mnd, skillLevels) => {
  return mnd + (calcMagicLevel(skillLevels) * 3);
};

// バフアイコン
const BuffBadge = ({ buff, onRemove }) => {
  const isExpiring = buff.remaining === 1;
  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded text-xs
      ${isExpiring 
        ? 'bg-orange-900/60 text-orange-300 border border-orange-700' 
        : 'bg-purple-900/60 text-purple-300 border border-purple-700'}
    `}>
      <span className="font-medium">{buff.name}</span>
      <span className="text-stone-400">({buff.effect})</span>
      <span className={`ml-1 font-bold ${isExpiring ? 'text-orange-400' : 'text-purple-400'}`}>
        {buff.remaining}R
      </span>
      <button
        onClick={() => onRemove(buff.id)}
        className="ml-1 text-stone-500 hover:text-red-400"
      >
        ×
      </button>
    </div>
  );
};

// ステータス表示コンポーネント
const StatDisplay = ({ label, value, bonus }) => (
  <div className="bg-stone-800/50 rounded px-2 py-1 text-center">
    <div className="text-xs text-stone-500">{label}</div>
    <div className="text-sm text-stone-300">{value}</div>
    <div className="text-xs text-amber-400">B: {bonus}</div>
  </div>
);

// キャラクター編集モーダル
const CharacterEditModal = ({ character, onSave, onClose }) => {
  const [stats, setStats] = useState(character.stats || {
    dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12
  });
  const [skillLevels, setSkillLevels] = useState(character.skillLevels || {});
  const [modifiers, setModifiers] = useState(character.modifiers || {
    hitMod: 0, dodgeMod: 0, defense: 0, vitResistMod: 0, mndResistMod: 0
  });
  const [activeTab, setActiveTab] = useState('stats');

  const updateStat = (key, value) => {
    // 入力中は空も許容
    setStats(prev => ({ ...prev, [key]: value === '' ? '' : value }));
  };

  const handleStatBlur = (key) => {
    setStats(prev => {
      const val = parseInt(prev[key]);
      // 空や無効な値なら0を設定
      return { ...prev, [key]: isNaN(val) ? 0 : Math.max(0, val) };
    });
  };

  const updateSkillLevel = (skillName, value) => {
    // 入力中は空も許容
    setSkillLevels(prev => ({ ...prev, [skillName]: value === '' ? '' : value }));
  };

  const handleSkillBlur = (skillName) => {
    setSkillLevels(prev => {
      const val = parseInt(prev[skillName]);
      // 空や無効な値、0以下なら0を設定（内部的には削除）
      if (isNaN(val) || val <= 0) {
        const { [skillName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [skillName]: val };
    });
  };

  const updateModifier = (key, value) => {
    setModifiers(prev => ({ ...prev, [key]: value === '' ? '' : value }));
  };

  const handleModifierBlur = (key) => {
    setModifiers(prev => {
      const val = parseInt(prev[key]);
      return { ...prev, [key]: isNaN(val) ? 0 : val };
    });
  };

  const handleSave = () => {
    // statsを数値に変換
    const numericStats = {
      dex: parseInt(stats.dex) || 0,
      agi: parseInt(stats.agi) || 0,
      str: parseInt(stats.str) || 0,
      vit: parseInt(stats.vit) || 0,
      int: parseInt(stats.int) || 0,
      mnd: parseInt(stats.mnd) || 0,
    };
    
    // skillLevelsも数値に変換（空文字や0は除外）
    const numericSkills = {};
    Object.entries(skillLevels).forEach(([key, val]) => {
      const level = parseInt(val);
      if (!isNaN(level) && level > 0) {
        numericSkills[key] = level;
      }
    });
    
    const maxHp = calcMaxHp(numericStats.vit, numericSkills);
    const maxMp = calcMaxMp(numericStats.mnd, numericSkills);
    
    // modifiersを数値に変換
    const numericModifiers = {
      hitMod: parseInt(modifiers.hitMod) || 0,
      dodgeMod: parseInt(modifiers.dodgeMod) || 0,
      defense: parseInt(modifiers.defense) || 0,
      vitResistMod: parseInt(modifiers.vitResistMod) || 0,
      mndResistMod: parseInt(modifiers.mndResistMod) || 0,
    };
    
    onSave({ 
      ...character, 
      stats: numericStats,
      skillLevels: numericSkills,
      modifiers: numericModifiers,
      hp: { 
        current: Math.min(character.hp.current, maxHp), 
        max: maxHp 
      },
      mp: { 
        current: Math.min(character.mp.current, maxMp), 
        max: maxMp 
      },
    });
    onClose();
  };

  const statLabels = [
    { key: 'dex', label: '器用度' },
    { key: 'agi', label: '敏捷度' },
    { key: 'str', label: '筋力' },
    { key: 'vit', label: '生命力' },
    { key: 'int', label: '知力' },
    { key: 'mnd', label: '精神力' },
  ];

  const advLv = calcAdventurerLevel(skillLevels);
  const magicLv = calcMagicLevel(skillLevels);
  const previewHp = calcMaxHp(parseInt(stats.vit) || 0, skillLevels);
  const previewMp = calcMaxMp(parseInt(stats.mnd) || 0, skillLevels);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg w-full max-w-md border border-stone-700 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-700">
          <h3 className="text-lg font-bold text-stone-200">
            {character.name} - 編集
          </h3>
          
          {/* タブ */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 rounded text-sm font-medium ${
                activeTab === 'stats'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              能力値
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-2 rounded text-sm font-medium ${
                activeTab === 'skills'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              技能
            </button>
            <button
              onClick={() => setActiveTab('equip')}
              className={`flex-1 py-2 rounded text-sm font-medium ${
                activeTab === 'equip'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              装備
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'stats' ? (
            <div className="grid grid-cols-2 gap-3">
              {statLabels.map(({ key, label }) => (
                <div key={key} className="bg-stone-800 rounded p-3">
                  <label className="block text-sm text-stone-400 mb-1">{label}</label>
                  <input
                    type="number"
                    value={stats[key]}
                    onChange={(e) => updateStat(key, e.target.value)}
                    onBlur={() => handleStatBlur(key)}
                    className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                      text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                  />
                  <div className="text-center mt-1 text-amber-400 text-sm">
                    ボーナス: {calcBonus(parseInt(stats[key]) || 0)}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'skills' ? (
            <div className="space-y-4">
              {Object.entries(SKILL_CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey}>
                  <h4 className="text-sm font-medium text-stone-400 mb-2">{cat.label}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.skills.map(skillName => (
                      <div key={skillName} className="flex items-center gap-2 bg-stone-800 rounded px-2 py-1">
                        <span className="text-xs text-stone-300 flex-1 truncate">{skillName}</span>
                        <input
                          type="number"
                          value={skillLevels[skillName] ?? ''}
                          onChange={(e) => updateSkillLevel(skillName, e.target.value)}
                          onBlur={() => handleSkillBlur(skillName)}
                          placeholder="0"
                          min="0"
                          max="15"
                          className="w-12 px-1 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-center text-sm focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">装備による修正値を入力してください</p>
              <div className="bg-stone-800 rounded p-3">
                <label className="block text-sm text-stone-400 mb-1">命中修正</label>
                <input
                  type="number"
                  value={modifiers.hitMod}
                  onChange={(e) => updateModifier('hitMod', e.target.value)}
                  onBlur={() => handleModifierBlur('hitMod')}
                  className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="bg-stone-800 rounded p-3">
                <label className="block text-sm text-stone-400 mb-1">回避修正</label>
                <input
                  type="number"
                  value={modifiers.dodgeMod}
                  onChange={(e) => updateModifier('dodgeMod', e.target.value)}
                  onBlur={() => handleModifierBlur('dodgeMod')}
                  className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="bg-stone-800 rounded p-3">
                <label className="block text-sm text-stone-400 mb-1">防護点</label>
                <input
                  type="number"
                  value={modifiers.defense}
                  onChange={(e) => updateModifier('defense', e.target.value)}
                  onBlur={() => handleModifierBlur('defense')}
                  className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="bg-stone-800 rounded p-3">
                <label className="block text-sm text-stone-400 mb-1">生命抵抗修正</label>
                <input
                  type="number"
                  value={modifiers.vitResistMod}
                  onChange={(e) => updateModifier('vitResistMod', e.target.value)}
                  onBlur={() => handleModifierBlur('vitResistMod')}
                  className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="bg-stone-800 rounded p-3">
                <label className="block text-sm text-stone-400 mb-1">精神抵抗修正</label>
                <input
                  type="number"
                  value={modifiers.mndResistMod}
                  onChange={(e) => updateModifier('mndResistMod', e.target.value)}
                  onBlur={() => handleModifierBlur('mndResistMod')}
                  className="w-full px-2 py-2 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center text-lg focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* プレビュー */}
        <div className="p-4 border-t border-stone-700 bg-stone-800/50">
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="text-stone-500 text-xs">冒険者Lv</div>
              <div className="text-amber-400 font-bold">{advLv}</div>
            </div>
            <div>
              <div className="text-stone-500 text-xs">魔法系計</div>
              <div className="text-violet-400 font-bold">{magicLv}</div>
            </div>
            <div>
              <div className="text-stone-500 text-xs">最大HP</div>
              <div className="text-emerald-400 font-bold">{previewHp}</div>
            </div>
            <div>
              <div className="text-stone-500 text-xs">最大MP</div>
              <div className="text-violet-400 font-bold">{previewMp}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-stone-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-amber-600 text-white rounded active:bg-amber-500 font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// バフ追加モーダル
const AddBuffModal = ({ character, onAdd, onClose }) => {
  const [mode, setMode] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customDuration, setCustomDuration] = useState('3');

  const handleAdd = () => {
    let newBuff;
    if (mode === 'preset' && selectedPreset) {
      const preset = PRESET_SKILLS.find(s => s.name === selectedPreset);
      if (!preset) return;
      newBuff = {
        id: Date.now().toString(),
        name: preset.name,
        effect: preset.effect,
        remaining: preset.duration,
        buffType: preset.buffType,
        buffValue: preset.buffValue,
      };
    } else if (mode === 'custom' && customName.trim()) {
      newBuff = {
        id: Date.now().toString(),
        name: customName.trim(),
        effect: customEffect.trim() || '効果',
        remaining: parseInt(customDuration) || 1,
      };
    } else {
      return;
    }
    onAdd(character.id, newBuff);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700">
        <h3 className="text-lg font-bold text-stone-200 mb-4">
          {character.name} - バフ追加
        </h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('preset')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              mode === 'preset'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            練技プリセット
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              mode === 'custom'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            カスタム
          </button>
        </div>

        {mode === 'preset' ? (
          <div>
            <label className="block text-sm text-stone-400 mb-2">練技を選択（タップで付与）</label>
            {(() => {
              const existingBuffNames = (character.buffs || []).map(b => b.name);
              const availableSkills = PRESET_SKILLS.filter(s => !existingBuffNames.includes(s.name));
              
              if (availableSkills.length === 0) {
                return (
                  <div className="text-center py-4 text-stone-500">
                    すべての練技が付与済みです
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map(skill => (
                    <button
                      key={skill.name}
                      onClick={() => {
                        const newBuff = {
                          id: Date.now().toString(),
                          name: skill.name,
                          effect: skill.effect,
                          remaining: skill.duration,
                          buffType: skill.buffType,
                          buffValue: skill.buffValue,
                        };
                        onAdd(character.id, newBuff);
                        onClose();
                      }}
                      className="p-2 bg-purple-900/50 hover:bg-purple-800/60 active:bg-purple-700/70 
                        border border-purple-700/50 rounded text-left transition-colors"
                    >
                      <div className="text-sm font-medium text-purple-200">{skill.name}</div>
                      <div className="text-xs text-stone-400">{skill.effect} / {skill.duration}R</div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-stone-400 mb-1">技名/バフ名</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="例: ファイアウェポン"
                className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">効果</label>
              <input
                type="text"
                value={customEffect}
                onChange={(e) => setCustomEffect(e.target.value)}
                placeholder="例: 炎属性+5"
                className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">持続ラウンド</label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                onBlur={() => { if (customDuration === '') setCustomDuration('1'); }}
                min="1"
                className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                  text-stone-200 focus:outline-none focus:border-purple-600 text-center text-lg"
              />
            </div>
          </div>
        )}

        {mode === 'preset' ? (
          <div className="mt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
            >
              閉じる
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 py-3 bg-purple-600 text-white rounded active:bg-purple-500 font-medium"
            >
              追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 技能バッジコンポーネント
const SkillBadges = ({ skillLevels }) => {
  const entries = Object.entries(skillLevels || {}).filter(([_, lv]) => lv > 0);
  if (entries.length === 0) return <span className="text-stone-600 text-xs">技能なし</span>;
  
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([name, lv]) => (
        <span key={name} className="text-xs bg-stone-700 text-stone-300 px-1.5 py-0.5 rounded">
          {name.slice(0, 3)}{lv}
        </span>
      ))}
    </div>
  );
};

// 複数部位の敵用カードコンポーネント
const MultiPartEnemyCard = ({ character, onUpdate, onDelete, onAddBuff, onRemoveBuff }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const buffs = character.buffs || [];
  const parts = character.parts || [];

  const updatePartHp = (partId, delta) => {
    const newParts = parts.map(p => {
      if (p.id === partId) {
        const newHp = Math.max(-999, Math.min(p.hp.current + delta, p.hp.max));
        return { ...p, hp: { ...p.hp, current: newHp } };
      }
      return p;
    });
    onUpdate({ ...character, parts: newParts });
  };

  const updatePartMp = (partId, delta) => {
    const newParts = parts.map(p => {
      if (p.id === partId) {
        const newMp = Math.max(0, Math.min(p.mp.current + delta, p.mp.max));
        return { ...p, mp: { ...p.mp, current: newMp } };
      }
      return p;
    });
    onUpdate({ ...character, parts: newParts });
  };

  const getPartHpPercent = (part) => Math.max(0, (part.hp.current / part.hp.max) * 100);
  
  const getPartHpColor = (part) => {
    const percent = getPartHpPercent(part);
    if (part.hp.current <= 0) return 'bg-gray-600';
    if (percent <= 25) return 'bg-red-500';
    if (percent <= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getPartStatus = (part) => {
    if (part.hp.current <= 0) return { label: '破壊', color: 'text-gray-500' };
    return null;
  };

  // コンパクト表示
  if (!isExpanded) {
    return (
      <div 
        className="rounded-lg p-3 cursor-pointer bg-gradient-to-br from-red-950/80 to-stone-900/90 
          border border-red-800/50 shadow-lg active:opacity-80"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">
            敵
          </span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
            {parts.length}部位
          </span>
          <h3 className="text-base font-bold text-stone-100 flex-1 truncate">
            {character.name}
          </h3>
          <span className="text-xs text-stone-500">▼</span>
        </div>

        {/* 部位HPバー */}
        <div className="space-y-1">
          {parts.map(part => (
            <div key={part.id} className="flex items-center gap-2">
              <span className="text-xs text-stone-400 w-16 truncate">{part.name}</span>
              <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getPartHpColor(part)} transition-all duration-300`}
                  style={{ width: `${getPartHpPercent(part)}%` }}
                />
              </div>
              <span className={`text-xs w-16 text-right ${part.hp.current <= 0 ? 'text-gray-500' : 'text-stone-300'}`}>
                {part.hp.current}/{part.hp.max}
              </span>
            </div>
          ))}
        </div>

        {/* バフ表示 */}
        {buffs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {buffs.map(buff => (
              <span key={buff.id} className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">
                {buff.name} {buff.remaining}R
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 展開表示
  return (
    <div className="rounded-lg p-4 bg-gradient-to-br from-red-950/80 to-stone-900/90 
      border border-red-800/50 shadow-lg"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">
            敵
          </span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
            {parts.length}部位
          </span>
          <h3 className="text-lg font-bold text-stone-100">{character.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-8 h-8 flex items-center justify-center text-stone-400 
              hover:text-stone-200 hover:bg-stone-700/50 rounded text-sm"
          >
            ▲
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(character.id);
            }}
            className="w-8 h-8 flex items-center justify-center text-stone-400 
              hover:text-red-400 hover:bg-red-950/50 rounded text-xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* 各部位 */}
      <div className="space-y-3">
        {parts.map(part => {
          const status = getPartStatus(part);
          const mpPercent = part.mp.max > 0 ? (part.mp.current / part.mp.max) * 100 : 0;
          return (
            <div key={part.id} className="p-3 bg-stone-800/50 rounded border border-stone-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-200">{part.name}</span>
                  {status && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded bg-gray-800 ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>命中 <span className="text-stone-200">{part.hit}</span></span>
                  <span>回避 <span className="text-stone-200">{part.dodge}</span></span>
                  <span>防護 <span className="text-stone-200">{part.defense}</span></span>
                </div>
              </div>
              
              {/* HP */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-500">HP</span>
                <span className={`text-sm ${part.hp.current <= 0 ? 'text-red-400' : 'text-stone-300'}`}>
                  {part.hp.current}/{part.hp.max}
                </span>
              </div>
              <div className="h-3 bg-stone-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${getPartHpColor(part)} transition-all duration-300`}
                  style={{ width: `${getPartHpPercent(part)}%` }}
                />
              </div>
              <div className="flex gap-1 mb-2">
                {[-10, -5, -1].map(n => (
                  <button
                    key={n}
                    onClick={() => updatePartHp(part.id, n)}
                    className="flex-1 py-1 text-xs bg-red-950/50 active:bg-red-800/60 text-red-300 rounded"
                  >
                    {n}
                  </button>
                ))}
                {[1, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => updatePartHp(part.id, n)}
                    className="flex-1 py-1 text-xs bg-emerald-950/50 active:bg-emerald-800/60 text-emerald-300 rounded"
                  >
                    +{n}
                  </button>
                ))}
              </div>

              {/* MP */}
              {part.mp.max > 0 && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500">MP</span>
                    <span className="text-sm text-stone-300">
                      {part.mp.current}/{part.mp.max}
                    </span>
                  </div>
                  <div className="h-2 bg-stone-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${mpPercent}%` }}
                    />
                  </div>
                  <div className="flex gap-1">
                    {[-5, -1].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-violet-950/50 active:bg-violet-800/60 text-violet-300 rounded"
                      >
                        {n}
                      </button>
                    ))}
                    {[1, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => updatePartMp(part.id, n)}
                        className="flex-1 py-1 text-xs bg-cyan-950/50 active:bg-cyan-800/60 text-cyan-300 rounded"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* バフ表示 */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-500">バフ/デバフ</span>
          <button
            onClick={() => onAddBuff(character)}
            className="text-xs text-purple-400 active:text-purple-300"
          >
            ＋追加
          </button>
        </div>
        {buffs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {buffs.map(buff => (
              <BuffBadge 
                key={buff.id} 
                buff={buff} 
                onRemove={(buffId) => onRemoveBuff(character.id, buffId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-600">なし</div>
        )}
      </div>
    </div>
  );
};

// キャラクターカードコンポーネント
const CharacterCard = ({ character, onUpdate, onDelete, onEditStats, onAddBuff, onRemoveBuff, enemies, partyBuff, onApplyDamage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [attackCalc, setAttackCalc] = useState({
    attackType: 'physical', // physical or magic
    selectedSkill: '', // 戦闘技能 or 魔法系技能
    targetId: '', // 敵ID
    targetPartId: '', // 部位ID（複数部位の場合）
    power: 20,
    critValue: 10,
    rolls: [{ d1: '', d2: '' }],
    isResisted: false, // 抵抗されたか
    finalDamage: null,
  });
  const isEnemy = character.type === 'enemy';
  const stats = character.stats || { dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 };
  const skillLevels = character.skillLevels || {};
  const buffs = character.buffs || [];
  const advLv = calcAdventurerLevel(skillLevels);
  
  const updateStat = (stat, delta) => {
    // HPはマイナスOK、MPは0以上
    const minValue = stat === 'hp' ? -999 : 0;
    const newValue = Math.max(minValue, Math.min(character[stat].current + delta, character[stat].max));
    onUpdate({
      ...character,
      [stat]: { ...character[stat], current: newValue }
    });
  };

  const rollDamage = () => {
    const newRolls = [];
    let currentRoll = roll2d6();
    newRolls.push({ d1: currentRoll.d1.toString(), d2: currentRoll.d2.toString() });
    
    // クリティカル処理
    while (currentRoll.total >= attackCalc.critValue && attackCalc.critValue <= 12 && newRolls.length < 10) {
      currentRoll = roll2d6();
      newRolls.push({ d1: currentRoll.d1.toString(), d2: currentRoll.d2.toString() });
    }
    
    setAttackCalc(prev => ({ ...prev, rolls: newRolls }));
  };

  // 追加ダメージ計算
  const calcExtraDamage = () => {
    const buffEffects = calcBuffEffects(buffs);
    const strBuffBonus = calcBonus(buffEffects.str || 0);
    const intBuffBonus = calcBonus(buffEffects.int || 0);
    
    if (attackCalc.attackType === 'physical') {
      const skillLv = parseInt(skillLevels[attackCalc.selectedSkill]) || 0;
      const baseStrBonus = calcBonus(stats.str);
      return skillLv + baseStrBonus + strBuffBonus + (buffEffects.strBonus || 0);
    } else {
      // 魔法
      const skillLv = parseInt(skillLevels[attackCalc.selectedSkill]) || 0;
      const baseIntBonus = calcBonus(stats.int);
      return baseIntBonus + intBuffBonus + skillLv;
    }
  };

  // 対象の防御値取得
  const getTargetDefense = () => {
    if (!attackCalc.targetId) return 0;
    const target = enemies.find(e => e.id === attackCalc.targetId);
    if (!target) return 0;
    
    // 敵のバフからダメージ軽減を取得
    const targetBuffEffects = calcBuffEffects(target.buffs);
    
    if (attackCalc.attackType === 'physical') {
      // 物理防御 = 防護点 + バフによる物理軽減
      let defense = 0;
      if (target.parts && attackCalc.targetPartId) {
        const part = target.parts.find(p => p.id === attackCalc.targetPartId);
        defense = part?.defense || 0;
      } else {
        defense = target.modifiers?.defense || 0;
      }
      return defense + (targetBuffEffects.physicalReduce || 0);
    } else {
      // 魔法防御 = バフによる魔法軽減のみ
      return targetBuffEffects.magicReduce || 0;
    }
  };

  // 鼓咆ボーナス取得
  const getKohoBonus = () => {
    if (!partyBuff || partyBuff.type !== 'attack') return 0;
    if (attackCalc.attackType === 'physical') {
      return partyBuff.physicalDamage || 0;
    } else {
      return partyBuff.magicDamage || 0;
    }
  };

  const hpPercent = Math.max(0, (character.hp.current / character.hp.max) * 100);
  const mpPercent = character.mp.max > 0 ? (character.mp.current / character.mp.max) * 100 : 0;
  
  const getHpColor = () => {
    if (character.hp.current <= 0) return 'bg-gray-600';
    if (hpPercent <= 25) return 'bg-red-500';
    if (hpPercent <= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };
  
  const getHpStatus = () => {
    if (character.hp.current <= -(stats.vit || 0)) return { label: '死亡', color: 'text-gray-500' };
    if (character.hp.current <= 0) return { label: '気絶', color: 'text-red-400' };
    return null;
  };

  // コンパクト表示
  if (!isExpanded) {
    return (
      <div 
        className={`
          rounded-lg p-3 cursor-pointer
          ${isEnemy 
            ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50' 
            : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
          }
          shadow-lg active:opacity-80
        `}
        onClick={() => setIsExpanded(true)}
      >
        {/* ヘッダー行 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`
            text-xs font-medium px-1.5 py-0.5 rounded
            ${isEnemy ? 'bg-red-900/60 text-red-300' : 'bg-blue-900/60 text-blue-300'}
          `}>
            {isEnemy ? '敵' : '味方'}
          </span>
          {!isEnemy && advLv > 0 && (
            <span className="text-xs bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">
              Lv.{advLv}
            </span>
          )}
          <h3 className="text-base font-bold text-stone-100 flex-1 truncate">
            {character.name}
          </h3>
          <span className="text-xs text-stone-500">▼</span>
        </div>

        {/* HP/MP 横並び */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* HP */}
          <div>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-stone-500">HP</span>
              <div className="flex items-center gap-1">
                {getHpStatus() && (
                  <span className={`${getHpStatus().color} text-xs font-bold`}>{getHpStatus().label}</span>
                )}
                <span className={character.hp.current <= 0 ? 'text-red-400' : 'text-stone-300'}>
                  {character.hp.current}/{character.hp.max}
                </span>
              </div>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getHpColor()} transition-all duration-300`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
          {/* MP */}
          <div>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-stone-500">MP</span>
              <span className="text-stone-300">{character.mp.current}/{character.mp.max}</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 transition-all duration-300"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* バフ（あれば） */}
        {buffs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {buffs.map(buff => (
              <span 
                key={buff.id} 
                className={`text-xs px-1.5 py-0.5 rounded ${
                  buff.remaining === 1 
                    ? 'bg-orange-900/60 text-orange-300' 
                    : 'bg-purple-900/60 text-purple-300'
                }`}
              >
                {buff.name} {buff.remaining}R
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 展開表示
  return (
    <div className={`
      relative rounded-lg p-4 
      ${isEnemy 
        ? 'bg-gradient-to-br from-red-950/80 to-stone-900/90 border border-red-800/50' 
        : 'bg-gradient-to-br from-blue-950/80 to-stone-900/90 border border-blue-800/50'
      }
      shadow-lg
    `}>
      {/* 閉じるボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
        className="absolute top-2 right-10 w-8 h-8 flex items-center justify-center
          text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 rounded transition-colors text-sm"
      >
        ▲
      </button>
      
      {/* 削除ボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(character.id);
        }}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center
          text-stone-400 hover:text-red-400 hover:bg-red-950/50 rounded transition-colors text-xl z-10"
      >
        ×
      </button>

      {/* キャラクター名とタイプ */}
      <div className="mb-3 pr-20">
        <div className="flex items-center gap-2">
          <span className={`
            text-xs font-medium px-2 py-0.5 rounded
            ${isEnemy ? 'bg-red-900/60 text-red-300' : 'bg-blue-900/60 text-blue-300'}
          `}>
            {isEnemy ? '敵' : '味方'}
          </span>
          {!isEnemy && advLv > 0 && (
            <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
              Lv.{advLv}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-stone-100 mt-1 truncate">
          {character.name}
        </h3>
      </div>

      {/* ステータス表示（味方のみ） */}
      {!isEnemy && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-stone-500">ステータス・技能</span>
            <button
              onClick={() => onEditStats(character)}
              className="text-xs text-amber-500 active:text-amber-400"
            >
              編集
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1 mb-2">
            <StatDisplay label="器用" value={stats.dex} bonus={calcBonus(stats.dex)} />
            <StatDisplay label="敏捷" value={stats.agi} bonus={calcBonus(stats.agi)} />
            <StatDisplay label="筋力" value={stats.str} bonus={calcBonus(stats.str)} />
            <StatDisplay label="生命" value={stats.vit} bonus={calcBonus(stats.vit)} />
            <StatDisplay label="知力" value={stats.int} bonus={calcBonus(stats.int)} />
            <StatDisplay label="精神" value={stats.mnd} bonus={calcBonus(stats.mnd)} />
          </div>
          <SkillBadges skillLevels={skillLevels} />
        </div>
      )}

      {/* 魔力表示（魔法系技能を持っている場合） */}
      {!isEnemy && (() => {
        const buffEffects = calcBuffEffects(buffs);
        const intBuffBonus = calcBonus(buffEffects.int || 0);
        const baseIntBonus = calcBonus(stats.int);
        const totalIntBonus = baseIntBonus + intBuffBonus;
        const isIntBuffed = buffEffects.int > 0;
        
        const magicPowers = MAGIC_SKILLS
          .filter(skill => skillLevels[skill] > 0)
          .map(skill => ({
            name: MAGIC_NAMES[skill],
            basePower: baseIntBonus + skillLevels[skill],
            totalPower: totalIntBonus + skillLevels[skill]
          }));
        if (magicPowers.length === 0) return null;
        return (
          <div className="mb-3">
            <span className="text-xs text-stone-500">魔力</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {magicPowers.map(({ name, basePower, totalPower }) => (
                <div key={name} className={`rounded px-2 py-1 ${
                  isIntBuffed 
                    ? 'bg-green-900/50 border border-green-600/50' 
                    : 'bg-indigo-900/50 border border-indigo-700/50'
                }`}>
                  <span className={`text-xs ${isIntBuffed ? 'text-green-300' : 'text-indigo-300'}`}>{name}</span>
                  {isIntBuffed ? (
                    <span className="text-sm ml-1">
                      <span className="text-stone-400">{basePower}</span>
                      <span className="text-green-400 font-bold ml-1">→{totalPower}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-indigo-200 ml-1">{totalPower}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 戦闘ステータス表示（味方のみ） */}
      {!isEnemy && (() => {
        const mods = character.modifiers || { hitMod: 0, dodgeMod: 0, defense: 0, vitResistMod: 0, mndResistMod: 0 };
        const buffEffects = calcBuffEffects(buffs);
        const combatLv = calcCombatLevel(skillLevels);
        
        // 基礎値計算
        const baseHit = calcBonus(stats.dex) + combatLv + (mods.hitMod || 0);
        const baseDodge = calcBonus(stats.agi) + combatLv + (mods.dodgeMod || 0);
        const baseVitResist = calcBonus(stats.vit) + advLv + (mods.vitResistMod || 0);
        const baseMndResist = calcBonus(stats.mnd) + advLv + (mods.mndResistMod || 0);
        const baseDefense = mods.defense || 0;
        const baseStrBonus = calcBonus(stats.str);
        
        // 能力値バフからのボーナス増加
        const dexBuffBonus = calcBonus(buffEffects.dex || 0);
        const agiBuffBonus = calcBonus(buffEffects.agi || 0);
        const strBuffBonus = calcBonus(buffEffects.str || 0);
        const vitBuffBonus = calcBonus(buffEffects.vit || 0);
        const mndBuffBonus = calcBonus(buffEffects.mnd || 0);
        
        // バフ込みの値
        const totalHit = baseHit + (buffEffects.hit || 0) + dexBuffBonus;
        const totalDodge = baseDodge + (buffEffects.dodge || 0) + agiBuffBonus;
        const totalVitResist = baseVitResist + (buffEffects.vitResist || 0) + vitBuffBonus;
        const totalMndResist = baseMndResist + (buffEffects.mndResist || 0) + mndBuffBonus;
        const totalDefense = baseDefense + (buffEffects.defense || 0);
        const totalStrBonus = baseStrBonus + (buffEffects.strBonus || 0) + strBuffBonus;
        
        // バフがかかっているか判定
        const isHitBuffed = (buffEffects.hit > 0) || (buffEffects.dex > 0);
        const isDodgeBuffed = (buffEffects.dodge > 0) || (buffEffects.agi > 0);
        const isVitResistBuffed = (buffEffects.vitResist > 0) || (buffEffects.vit > 0);
        const isMndResistBuffed = (buffEffects.mndResist > 0) || (buffEffects.mnd > 0);
        const isStrBonusBuffed = (buffEffects.strBonus > 0) || (buffEffects.str > 0);
        
        const StatBox = ({ label, base, total, buffed }) => (
          <div className={`rounded px-2 py-1 text-center ${
            buffed ? 'bg-green-900/50 border border-green-600/50' : 'bg-stone-800/50'
          }`}>
            <div className="text-xs text-stone-500">{label}</div>
            {buffed ? (
              <div className="text-sm">
                <span className="text-stone-400">{base}</span>
                <span className="text-green-400 font-bold ml-1">→{total}</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-stone-200">{total}</div>
            )}
          </div>
        );
        
        return (
          <div className="mb-3">
            <span className="text-xs text-stone-500">戦闘ステータス</span>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <StatBox label="命中" base={baseHit} total={totalHit} buffed={isHitBuffed} />
              <StatBox label="回避" base={baseDodge} total={totalDodge} buffed={isDodgeBuffed} />
              <StatBox label="防護点" base={baseDefense} total={totalDefense} buffed={buffEffects.defense > 0} />
              <StatBox label="生命抵抗" base={baseVitResist} total={totalVitResist} buffed={isVitResistBuffed} />
              <StatBox label="精神抵抗" base={baseMndResist} total={totalMndResist} buffed={isMndResistBuffed} />
              <StatBox label="筋力B" base={baseStrBonus} total={totalStrBonus} buffed={isStrBonusBuffed} />
            </div>
          </div>
        );
      })()}

      {/* HP */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400">HP</span>
            {getHpStatus() && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                getHpStatus().label === '死亡' ? 'bg-gray-800 text-gray-400' : 'bg-red-900/60 text-red-300'
              }`}>
                {getHpStatus().label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${character.hp.current <= 0 ? 'text-red-400' : 'text-stone-200'}`}>
              {character.hp.current}
            </span>
            <span className="text-stone-500">/</span>
            <span className="text-sm text-stone-400">{character.hp.max}</span>
          </div>
        </div>
        <div className="h-4 bg-stone-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHpColor()} transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex gap-1 mt-2">
          {[-10, -5, -1].map(n => (
            <button
              key={n}
              onClick={() => updateStat('hp', n)}
              className="flex-1 py-2 text-sm font-medium bg-red-950/50 active:bg-red-800/60 
                text-red-300 rounded transition-colors"
            >
              {n}
            </button>
          ))}
          {[1, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => updateStat('hp', n)}
              className="flex-1 py-2 text-sm font-medium bg-emerald-950/50 active:bg-emerald-800/60 
                text-emerald-300 rounded transition-colors"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* MP */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-stone-400">MP</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-stone-200">{character.mp.current}</span>
            <span className="text-stone-500">/</span>
            <span className="text-sm text-stone-400">{character.mp.max}</span>
          </div>
        </div>
        <div className="h-4 bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${mpPercent}%` }}
          />
        </div>
        <div className="flex gap-1 mt-2">
          {[-10, -5, -1].map(n => (
            <button
              key={n}
              onClick={() => updateStat('mp', n)}
              className="flex-1 py-2 text-sm font-medium bg-violet-950/50 active:bg-violet-800/60 
                text-violet-300 rounded transition-colors"
            >
              {n}
            </button>
          ))}
          {[1, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => updateStat('mp', n)}
              className="flex-1 py-2 text-sm font-medium bg-cyan-950/50 active:bg-cyan-800/60 
                text-cyan-300 rounded transition-colors"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* バフ表示 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-500">バフ/練技</span>
          <button
            onClick={() => onAddBuff(character)}
            className="text-xs text-purple-400 active:text-purple-300"
          >
            ＋追加
          </button>
        </div>
        {buffs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {buffs.map(buff => (
              <BuffBadge 
                key={buff.id} 
                buff={buff} 
                onRemove={(buffId) => onRemoveBuff(character.id, buffId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-600">バフなし</div>
        )}
      </div>

      {/* 攻撃 */}
      {!isEnemy && (
      <div className="border-t border-stone-700 pt-3">
        <span className="text-xs text-stone-500">攻撃</span>
        
        {/* 攻撃タイプ選択 */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setAttackCalc(prev => ({ ...prev, attackType: 'physical', selectedSkill: '', rolls: [{ d1: '', d2: '' }] }))}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              attackCalc.attackType === 'physical'
                ? 'bg-orange-700 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            物理
          </button>
          <button
            onClick={() => setAttackCalc(prev => ({ ...prev, attackType: 'magic', selectedSkill: '', rolls: [{ d1: '', d2: '' }] }))}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              attackCalc.attackType === 'magic'
                ? 'bg-indigo-700 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            魔法
          </button>
        </div>

        {/* 技能選択 */}
        <div className="mt-2">
          <label className="block text-xs text-stone-500 mb-1">
            {attackCalc.attackType === 'physical' ? '戦闘技能' : '魔法'}
          </label>
          <select
            value={attackCalc.selectedSkill}
            onChange={(e) => setAttackCalc(prev => ({ ...prev, selectedSkill: e.target.value }))}
            className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
          >
            <option value="">-- 選択 --</option>
            {attackCalc.attackType === 'physical' 
              ? COMBAT_SKILLS.filter(s => skillLevels[s] > 0).map(s => (
                  <option key={s} value={s}>{s} Lv.{skillLevels[s]}</option>
                ))
              : MAGIC_SKILLS.filter(s => skillLevels[s] > 0).map(s => (
                  <option key={s} value={s}>{MAGIC_NAMES[s]} Lv.{skillLevels[s]}</option>
                ))
            }
          </select>
        </div>

        {/* 対象選択 */}
        <div className="mt-2">
          <label className="block text-xs text-stone-500 mb-1">攻撃対象</label>
          <select
            value={attackCalc.targetId}
            onChange={(e) => setAttackCalc(prev => ({ ...prev, targetId: e.target.value, targetPartId: '' }))}
            className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
          >
            <option value="">-- 対象選択 --</option>
            {enemies.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* 部位選択（複数部位の場合） */}
        {(() => {
          const target = enemies.find(e => e.id === attackCalc.targetId);
          if (!target?.parts) return null;
          return (
            <div className="mt-2">
              <label className="block text-xs text-stone-500 mb-1">部位</label>
              <select
                value={attackCalc.targetPartId}
                onChange={(e) => setAttackCalc(prev => ({ ...prev, targetPartId: e.target.value }))}
                className="w-full px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
              >
                <option value="">-- 部位選択 --</option>
                {target.parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (HP:{p.hp.current}/{p.hp.max} 防護:{p.defense})
                  </option>
                ))}
              </select>
            </div>
          );
        })()}

        {/* 威力・C値 */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs text-stone-500 mb-1">威力</label>
            <select
              value={attackCalc.power}
              onChange={(e) => setAttackCalc(prev => ({ ...prev, power: parseInt(e.target.value), rolls: [{ d1: '', d2: '' }] }))}
              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
            >
              {[0,10,20,30,40,50,60,70,80,90,100].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">C値</label>
            <select
              value={attackCalc.critValue}
              onChange={(e) => setAttackCalc(prev => ({ ...prev, critValue: parseInt(e.target.value), rolls: [{ d1: '', d2: '' }] }))}
              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-200 text-sm"
            >
              {[8,9,10,11,12,13].map(c => (
                <option key={c} value={c}>{c === 13 ? 'なし' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 追加D表示 */}
        {attackCalc.selectedSkill && (
          <div className="mt-2 p-2 bg-stone-800/50 rounded text-xs text-stone-400">
            追加ダメージ: <span className="text-stone-200 font-bold">{calcExtraDamage()}</span>
            {attackCalc.attackType === 'physical' 
              ? ` (技能${skillLevels[attackCalc.selectedSkill]}+筋力B)`
              : ` (魔力)`
            }
            {getKohoBonus() > 0 && (
              <span className="text-orange-400"> +鼓咆{getKohoBonus()}</span>
            )}
          </div>
        )}
        
        {/* ダイス入力エリア */}
        <div className="mt-3 space-y-2">
          {attackCalc.rolls.map((roll, index) => {
            const total = (parseInt(roll.d1) || 0) + (parseInt(roll.d2) || 0);
            const isValidRoll = roll.d1 !== '' && roll.d2 !== '' && total >= 2;
            const isCrit = isValidRoll && total >= attackCalc.critValue && attackCalc.critValue <= 12;
            
            return (
              <div key={index} className={`p-2 rounded ${isCrit ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-stone-800/50'}`}>
                <div className="flex items-center gap-2">
                  {index > 0 && <span className="text-yellow-400 text-xs">回転{index + 1}</span>}
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={roll.d1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttackCalc(prev => {
                        const newRolls = [...prev.rolls];
                        newRolls[index] = { ...newRolls[index], d1: val };
                        const newTotal = (parseInt(val) || 0) + (parseInt(newRolls[index].d2) || 0);
                        if (newTotal < prev.critValue || prev.critValue > 12) {
                          newRolls.splice(index + 1);
                        }
                        return { ...prev, rolls: newRolls };
                      });
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') return;
                      const val = Math.max(1, Math.min(6, parseInt(e.target.value) || 1));
                      setAttackCalc(prev => {
                        const newRolls = [...prev.rolls];
                        newRolls[index] = { ...newRolls[index], d1: val.toString() };
                        return { ...prev, rolls: newRolls };
                      });
                    }}
                    placeholder="D1"
                    className="w-12 px-2 py-1 bg-stone-700 border border-stone-600 rounded text-stone-200 text-center text-lg"
                  />
                  <span className="text-stone-500">+</span>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={roll.d2}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttackCalc(prev => {
                        const newRolls = [...prev.rolls];
                        newRolls[index] = { ...newRolls[index], d2: val };
                        const newTotal = (parseInt(newRolls[index].d1) || 0) + (parseInt(val) || 0);
                        if (newTotal < prev.critValue || prev.critValue > 12) {
                          newRolls.splice(index + 1);
                        }
                        return { ...prev, rolls: newRolls };
                      });
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') return;
                      const val = Math.max(1, Math.min(6, parseInt(e.target.value) || 1));
                      setAttackCalc(prev => {
                        const newRolls = [...prev.rolls];
                        newRolls[index] = { ...newRolls[index], d2: val.toString() };
                        return { ...prev, rolls: newRolls };
                      });
                    }}
                    placeholder="D2"
                    className="w-12 px-2 py-1 bg-stone-700 border border-stone-600 rounded text-stone-200 text-center text-lg"
                  />
                  <span className="text-stone-500">=</span>
                  <span className={`text-lg font-bold min-w-[2rem] text-center ${isCrit ? 'text-yellow-400' : 'text-stone-200'}`}>
                    {isValidRoll ? total : '-'}
                  </span>
                  {isCrit && <span className="text-yellow-400 text-xs">クリティカル!</span>}
                </div>
              </div>
            );
          })}
          
          {/* クリティカル時に次のロール入力を追加 */}
          {(() => {
            const lastRoll = attackCalc.rolls[attackCalc.rolls.length - 1];
            const lastTotal = (parseInt(lastRoll.d1) || 0) + (parseInt(lastRoll.d2) || 0);
            const lastIsValid = lastRoll.d1 !== '' && lastRoll.d2 !== '' && lastTotal >= 2;
            const lastIsCrit = lastIsValid && lastTotal >= attackCalc.critValue && attackCalc.critValue <= 12;
            
            if (lastIsCrit && attackCalc.rolls.length < 10) {
              return (
                <button
                  onClick={() => setAttackCalc(prev => ({ ...prev, rolls: [...prev.rolls, { d1: '', d2: '' }] }))}
                  className="w-full py-2 bg-yellow-800 hover:bg-yellow-700 text-yellow-200 text-sm rounded transition-colors"
                >
                  + 次のダイスを入力
                </button>
              );
            }
            return null;
          })()}
        </div>

        {/* 抵抗チェック（魔法時のみ） */}
        {attackCalc.attackType === 'magic' && (
          <div className="mt-2">
            <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={attackCalc.isResisted}
                onChange={(e) => setAttackCalc(prev => ({ ...prev, isResisted: e.target.checked }))}
                className="w-4 h-4 rounded bg-stone-700 border-stone-600"
              />
              抵抗された（ダメージ半減）
            </label>
          </div>
        )}

        {/* ダメージ結果 */}
        {(() => {
          let powerDamage = 0;
          let validRolls = 0;
          
          for (const roll of attackCalc.rolls) {
            const d1 = parseInt(roll.d1) || 0;
            const d2 = parseInt(roll.d2) || 0;
            const total = d1 + d2;
            if (roll.d1 === '' || roll.d2 === '' || total < 2) break;
            powerDamage += getPowerDamage(attackCalc.power, total);
            validRolls++;
            if (total < attackCalc.critValue || attackCalc.critValue > 12) break;
          }
          
          if (validRolls === 0 || !attackCalc.selectedSkill) return null;
          
          const extraDamage = calcExtraDamage();
          const defense = getTargetDefense();
          const kohoBonus = getKohoBonus();
          let finalDamage = powerDamage + extraDamage - defense + kohoBonus;
          finalDamage = Math.max(0, finalDamage);
          
          // 抵抗時半減（切り上げ）
          if (attackCalc.attackType === 'magic' && attackCalc.isResisted) {
            finalDamage = Math.ceil(finalDamage / 2);
          }
          
          return (
            <div className="mt-3 p-3 bg-stone-800 rounded">
              <div className="text-center">
                <span className="text-stone-400 text-sm">ダメージ: </span>
                <span className={`text-3xl font-bold ${attackCalc.attackType === 'physical' ? 'text-orange-400' : 'text-indigo-400'}`}>
                  {finalDamage}
                </span>
                {attackCalc.isResisted && (
                  <span className="text-xs text-stone-500 ml-2">(抵抗で半減)</span>
                )}
              </div>
              <div className="text-xs text-stone-500 text-center mt-1">
                威力{powerDamage} + 追加{extraDamage} - 防御{defense}
                {kohoBonus > 0 && ` + 鼓咆${kohoBonus}`}
              </div>
              
              {/* 適用ボタン */}
              {attackCalc.targetId && (
                <button
                  onClick={() => {
                    onApplyDamage(attackCalc.targetId, attackCalc.targetPartId, finalDamage);
                    setAttackCalc(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false }));
                  }}
                  className={`w-full mt-2 py-2 font-bold rounded transition-colors ${
                    attackCalc.attackType === 'physical'
                      ? 'bg-orange-700 hover:bg-orange-600 text-white'
                      : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                  }`}
                >
                  ダメージを適用
                </button>
              )}
            </div>
          );
        })()}

        {/* リセット＆自動ロールボタン */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setAttackCalc(prev => ({ ...prev, rolls: [{ d1: '', d2: '' }], isResisted: false }))}
            className="flex-1 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded transition-colors"
          >
            クリア
          </button>
          <button
            onClick={rollDamage}
            className="flex-1 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded transition-colors"
          >
            🎲 自動ロール
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

// 鼓咆追加モーダル
const KohoModal = ({ partyBuff, onSet, onClose }) => {
  const [customName, setCustomName] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [customType, setCustomType] = useState('attack');
  const [customPhysDmg, setCustomPhysDmg] = useState('0');
  const [customMagicDmg, setCustomMagicDmg] = useState('0');
  const [customPhysReduce, setCustomPhysReduce] = useState('0');
  const [customMagicReduce, setCustomMagicReduce] = useState('0');

  const handlePresetSelect = (type, koho) => {
    onSet({ 
      type, 
      name: koho.name, 
      effect: koho.effect,
      physicalDamage: koho.physicalDamage || 0,
      magicDamage: koho.magicDamage || 0,
      physicalReduce: koho.physicalReduce || 0,
      magicReduce: koho.magicReduce || 0,
    });
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onSet({ 
      type: customType,
      name: customName.trim(), 
      effect: customEffect.trim() || '効果',
      physicalDamage: parseInt(customPhysDmg) || 0,
      magicDamage: parseInt(customMagicDmg) || 0,
      physicalReduce: parseInt(customPhysReduce) || 0,
      magicReduce: parseInt(customMagicReduce) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">鼓咆（全体バフ）</h3>

        {/* 攻撃系鼓咆 */}
        <div className="mb-4">
          <span className="text-sm font-medium text-orange-400 block mb-2">攻撃系鼓咆</span>
          <div className="grid grid-cols-2 gap-2">
            {KOHO_PRESETS.attack.map(koho => (
              <button
                key={koho.name}
                onClick={() => handlePresetSelect('attack', koho)}
                className={`p-2 rounded text-left transition-colors ${
                  partyBuff?.type === 'attack' && partyBuff?.name === koho.name
                    ? 'bg-orange-700 border border-orange-500'
                    : 'bg-orange-900/50 hover:bg-orange-800/60 active:bg-orange-700/70 border border-orange-700/50'
                }`}
              >
                <div className="text-sm font-medium text-orange-200">{koho.name}</div>
                <div className="text-xs text-stone-400">{koho.effect}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 防御系鼓咆 */}
        <div className="mb-4">
          <span className="text-sm font-medium text-cyan-400 block mb-2">防御系鼓咆</span>
          <div className="grid grid-cols-2 gap-2">
            {KOHO_PRESETS.defense.map(koho => (
              <button
                key={koho.name}
                onClick={() => handlePresetSelect('defense', koho)}
                className={`p-2 rounded text-left transition-colors ${
                  partyBuff?.type === 'defense' && partyBuff?.name === koho.name
                    ? 'bg-cyan-700 border border-cyan-500'
                    : 'bg-cyan-900/50 hover:bg-cyan-800/60 active:bg-cyan-700/70 border border-cyan-700/50'
                }`}
              >
                <div className="text-sm font-medium text-cyan-200">{koho.name}</div>
                <div className="text-xs text-stone-400">{koho.effect}</div>
              </button>
            ))}
          </div>
        </div>

        {/* カスタム鼓咆 */}
        <div className="border-t border-stone-700 pt-4">
          <span className="text-sm text-stone-400 mb-2 block">カスタム鼓咆</span>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setCustomType('attack')}
              className={`flex-1 py-1 rounded text-sm ${
                customType === 'attack' ? 'bg-orange-700 text-white' : 'bg-stone-800 text-stone-400'
              }`}
            >
              攻撃系
            </button>
            <button
              onClick={() => setCustomType('defense')}
              className={`flex-1 py-1 rounded text-sm ${
                customType === 'defense' ? 'bg-cyan-700 text-white' : 'bg-stone-800 text-stone-400'
              }`}
            >
              防御系
            </button>
          </div>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="鼓咆名"
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 mb-2"
          />
          <input
            type="text"
            value={customEffect}
            onChange={(e) => setCustomEffect(e.target.value)}
            placeholder="効果説明（表示用）"
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 mb-2"
          />
          {customType === 'attack' ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-stone-500 mb-1">物理ダメージ+</label>
                <input
                  type="number"
                  value={customPhysDmg}
                  onChange={(e) => setCustomPhysDmg(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-orange-600"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">魔法ダメージ+</label>
                <input
                  type="number"
                  value={customMagicDmg}
                  onChange={(e) => setCustomMagicDmg(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-orange-600"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-stone-500 mb-1">物理ダメージ軽減</label>
                <input
                  type="number"
                  value={customPhysReduce}
                  onChange={(e) => setCustomPhysReduce(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">魔法ダメージ軽減</label>
                <input
                  type="number"
                  value={customMagicReduce}
                  onChange={(e) => setCustomMagicReduce(e.target.value)}
                  className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                    text-stone-200 text-center focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          )}
          <button
            onClick={handleCustomAdd}
            disabled={!customName.trim()}
            className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500
              text-white rounded transition-colors"
          >
            カスタム追加
          </button>
        </div>

        {/* 解除ボタン */}
        {partyBuff && (
          <button
            onClick={() => { onSet(null); onClose(); }}
            className="w-full mt-4 py-2 bg-red-900/50 hover:bg-red-800/60 text-red-300 rounded transition-colors"
          >
            鼓咆を解除
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// テンプレート選択モーダル
const TemplateSelectModal = ({ onAdd, onClose }) => {
  const [tab, setTab] = useState('allies'); // allies or enemies
  const [password, setPassword] = useState('');
  
  const handleSelect = (template) => {
    const baseId = Date.now().toString();
    
    if (template.type === 'ally') {
      // 味方キャラ
      const hpMax = 15 + (template.stats?.vit || 12) + 
        Math.max(...Object.values(template.skillLevels || {}).map(v => v || 0), 0) * 3;
      const mpMax = (template.stats?.mnd || 12) + 
        Math.max(...Object.entries(template.skillLevels || {})
          .filter(([k]) => MAGIC_SKILLS.includes(k))
          .map(([, v]) => v || 0), 0) * 3;
      
      onAdd({
        id: baseId,
        name: template.name,
        type: 'ally',
        hp: { current: hpMax, max: hpMax },
        mp: { current: mpMax, max: mpMax },
        stats: { ...template.stats },
        skillLevels: { ...template.skillLevels },
        modifiers: { ...template.modifiers },
        buffs: [],
      });
    } else if (template.parts) {
      // 複数部位の敵
      const partsData = template.parts.map((p, i) => ({
        id: baseId + '-' + i,
        name: p.name,
        hp: { current: p.hp, max: p.hp },
        mp: { current: p.mp || 0, max: p.mp || 0 },
        hit: p.hit || 0,
        dodge: p.dodge || 0,
        defense: p.defense || 0,
      }));
      onAdd({
        id: baseId,
        name: template.name,
        type: 'enemy',
        parts: partsData,
        buffs: [],
      });
    } else {
      // 単体の敵
      onAdd({
        id: baseId,
        name: template.name,
        type: 'enemy',
        hp: { current: template.hp, max: template.hp },
        mp: { current: template.mp || 0, max: template.mp || 0 },
        modifiers: { 
          hitMod: template.hit || 0, 
          dodgeMod: template.dodge || 0, 
          defense: template.defense || 0 
        },
        buffs: [],
      });
    }
    onClose();
  };

  // テンプレートのフィルタリング
  // - hidden: false → 常に表示
  // - hidden: true かつ password が一致 → 表示
  const filterTemplates = (templates) => {
    return templates.filter(t => {
      if (!t.hidden) return true;
      if (password && t.password && t.password === password) return true;
      return false;
    });
  };

  const templates = tab === 'allies' 
    ? filterTemplates(CHARACTER_TEMPLATES.allies)
    : filterTemplates(CHARACTER_TEMPLATES.enemies);

  // 合言葉で解放されたテンプレート数（両タブ合計）
  const unlockedCount = password ? [
    ...CHARACTER_TEMPLATES.allies,
    ...CHARACTER_TEMPLATES.enemies
  ].filter(t => t.hidden && t.password === password).length : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg p-4 w-full max-w-md border border-stone-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-stone-200 mb-4">テンプレートから追加</h3>

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('allies')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              tab === 'allies'
                ? 'bg-blue-700 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            味方
          </button>
          <button
            onClick={() => setTab('enemies')}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              tab === 'enemies'
                ? 'bg-red-700 text-white'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            敵
          </button>
        </div>

        {/* 合言葉入力 */}
        <div className="mb-4">
          <label className="block text-xs text-stone-500 mb-1">🔑 合言葉（GMから教えてもらった場合）</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="合言葉を入力..."
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
          {unlockedCount > 0 && (
            <div className="mt-1 text-xs text-amber-400">
              ✨ {unlockedCount}件の隠しキャラが解放されました！
            </div>
          )}
        </div>

        {/* テンプレート一覧 */}
        <div className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-sm">
              テンプレートがありません
            </div>
          ) : templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => handleSelect(tpl)}
              className={`w-full p-3 rounded text-left transition-colors ${
                tpl.hidden
                  ? 'bg-amber-900/40 hover:bg-amber-800/50 active:bg-amber-700/60 border border-amber-700/50'
                  : tab === 'allies'
                    ? 'bg-blue-900/40 hover:bg-blue-800/50 active:bg-blue-700/60 border border-blue-700/50'
                    : 'bg-red-900/40 hover:bg-red-800/50 active:bg-red-700/60 border border-red-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tpl.hidden && (
                    <span className="text-xs bg-amber-700/60 text-amber-200 px-1.5 py-0.5 rounded">
                      🔓
                    </span>
                  )}
                  <span className={`font-medium ${
                    tpl.hidden ? 'text-amber-200' : tab === 'allies' ? 'text-blue-200' : 'text-red-200'
                  }`}>
                    {tpl.name}
                  </span>
                </div>
                {tpl.parts && (
                  <span className="text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
                    {tpl.parts.length}部位
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {tab === 'allies' ? (
                  <>
                    {Object.entries(tpl.skillLevels || {})
                      .filter(([, v]) => v > 0)
                      .slice(0, 4)
                      .map(([k, v]) => `${k}${v}`)
                      .join(' / ')}
                    {Object.keys(tpl.skillLevels || {}).length > 4 && ' ...'}
                  </>
                ) : tpl.parts ? (
                  tpl.parts.map(p => p.name).join(', ')
                ) : (
                  `HP:${tpl.hp} 命中:${tpl.hit} 回避:${tpl.dodge} 防護:${tpl.defense}`
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// キャラクター追加フォーム
const AddCharacterForm = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('ally');
  const [hp, setHp] = useState('30');
  const [mp, setMp] = useState('20');
  const [hasMultipleParts, setHasMultipleParts] = useState(false);
  const [parts, setParts] = useState([
    { name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0' }
  ]);

  const addPart = () => {
    if (parts.length >= 10) return;
    setParts(prev => [...prev, { 
      name: `部位${prev.length + 1}`, 
      hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0' 
    }]);
  };

  const removePart = (index) => {
    if (parts.length <= 1) return;
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  const updatePart = (index, field, value) => {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }
    
    const defaultStats = { dex: 12, agi: 12, str: 12, vit: 12, int: 12, mnd: 12 };
    
    if (type === 'enemy' && hasMultipleParts) {
      // 複数部位の敵
      const partsData = parts.map(p => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: p.name.trim() || '部位',
        hp: { current: parseInt(p.hp) || 30, max: parseInt(p.hp) || 30 },
        mp: { current: parseInt(p.mp) || 0, max: parseInt(p.mp) || 0 },
        hit: parseInt(p.hit) || 0,
        dodge: parseInt(p.dodge) || 0,
        defense: parseInt(p.defense) || 0,
      }));
      
      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        type: 'enemy',
        parts: partsData,
        buffs: [],
      });
    } else {
      // 通常（味方 or 単体敵）
      const hpVal = parseInt(hp) || 30;
      const mpVal = parseInt(mp) || 20;
      
      onAdd({
        id: Date.now().toString(),
        name: name.trim(),
        hp: { current: hpVal, max: hpVal },
        mp: { current: mpVal, max: mpVal },
        type,
        stats: defaultStats,
        skillLevels: {},
        modifiers: { hitMod: 0, dodgeMod: 0, defense: 0 },
        buffs: [],
      });
    }
    
    setName('');
    setHp('30');
    setMp('20');
    setType('ally');
    setHasMultipleParts(false);
    setParts([{ name: '部位1', hp: '30', mp: '0', hit: '0', dodge: '0', defense: '0' }]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-5 border-2 border-dashed border-stone-600 rounded-lg
          text-stone-400 active:bg-stone-800 
          transition-colors flex items-center justify-center gap-2 text-lg"
      >
        <span className="text-2xl">＋</span>
        <span>キャラクター追加</span>
      </button>
    );
  }

  return (
    <div className="bg-stone-900 rounded-lg p-4 border border-stone-700">
      <h3 className="text-lg font-bold text-stone-200 mb-4">キャラクター追加</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-stone-400 mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="キャラクター名"
            className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
              text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1">タイプ</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType('ally'); setHasMultipleParts(false); }}
              className={`flex-1 py-3 rounded font-medium transition-colors text-lg ${
                type === 'ally'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-800 text-stone-400 active:bg-stone-700'
              }`}
            >
              味方
            </button>
            <button
              type="button"
              onClick={() => setType('enemy')}
              className={`flex-1 py-3 rounded font-medium transition-colors text-lg ${
                type === 'enemy'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-800 text-stone-400 active:bg-stone-700'
              }`}
            >
              敵
            </button>
          </div>
        </div>
        
        {type === 'enemy' && (
          <>
            {/* 複数部位トグル */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasMultipleParts(false)}
                className={`flex-1 py-2 rounded text-sm transition-colors ${
                  !hasMultipleParts
                    ? 'bg-red-700 text-white'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                単体
              </button>
              <button
                type="button"
                onClick={() => setHasMultipleParts(true)}
                className={`flex-1 py-2 rounded text-sm transition-colors ${
                  hasMultipleParts
                    ? 'bg-red-700 text-white'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                複数部位
              </button>
            </div>

            {!hasMultipleParts ? (
              /* 単体敵 */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone-400 mb-1">HP</label>
                  <input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    onBlur={() => { if (hp === '') setHp('0'); }}
                    className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-1">MP</label>
                  <input
                    type="number"
                    value={mp}
                    onChange={(e) => setMp(e.target.value)}
                    onBlur={() => { if (mp === '') setMp('0'); }}
                    className="w-full px-3 py-3 bg-stone-800 border border-stone-700 rounded
                      text-stone-200 focus:outline-none focus:border-amber-600 text-lg"
                  />
                </div>
              </div>
            ) : (
              /* 複数部位敵 */
              <div className="space-y-3">
                <div className="text-sm text-stone-400">部位</div>
                {parts.map((part, index) => (
                  <div key={index} className="bg-stone-800/50 rounded p-3 border border-stone-700">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={part.name}
                        onChange={(e) => updatePart(index, 'name', e.target.value)}
                        placeholder="部位名"
                        className="flex-1 px-2 py-1 bg-stone-700 border border-stone-600 rounded
                          text-stone-200 text-sm focus:outline-none focus:border-red-600"
                      />
                      {parts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="text-stone-500 hover:text-red-400 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">HP</label>
                        <input
                          type="number"
                          value={part.hp}
                          onChange={(e) => updatePart(index, 'hp', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">MP</label>
                        <input
                          type="number"
                          value={part.mp}
                          onChange={(e) => updatePart(index, 'mp', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">命中</label>
                        <input
                          type="number"
                          value={part.hit}
                          onChange={(e) => updatePart(index, 'hit', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">回避</label>
                        <input
                          type="number"
                          value={part.dodge}
                          onChange={(e) => updatePart(index, 'dodge', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">防護</label>
                        <input
                          type="number"
                          value={part.defense}
                          onChange={(e) => updatePart(index, 'defense', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 border border-stone-600 rounded
                            text-stone-200 text-sm text-center focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {parts.length < 10 && (
                  <button
                    type="button"
                    onClick={addPart}
                    className="w-full py-2 border border-dashed border-stone-600 rounded
                      text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-colors text-sm"
                  >
                    ＋ 部位を追加
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-stone-500">
          {type === 'ally' 
            ? '※HP/MPは追加後に能力値・技能を設定すると自動計算されます'
            : hasMultipleParts
              ? '※各部位のステータスを入力してください'
              : '※敵のHP/MPは直接入力してください'
          }
        </p>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 bg-stone-800 text-stone-400 rounded active:bg-stone-700 transition-colors text-lg"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-amber-600 text-white rounded active:bg-amber-500 transition-colors font-medium text-lg"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
};

// メインアプリ
export default function SW2BattleManager() {
  const [characters, setCharacters] = useState([]);
  const [round, setRound] = useState(1);
  const [editingChar, setEditingChar] = useState(null);
  const [addingBuffChar, setAddingBuffChar] = useState(null);
  const [expiredBuffs, setExpiredBuffs] = useState([]);
  const [partyBuffs, setPartyBuffs] = useState(null); // { type: 'attack'|'defense', name, effect }
  const [showKohoModal, setShowKohoModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const addCharacter = (char) => {
    setCharacters(prev => [...prev, char]);
  };

  const updateCharacter = (updated) => {
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCharacter = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const addBuff = (charId, buff) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, buffs: [...(c.buffs || []), buff] };
      }
      return c;
    }));
  };

  const removeBuff = (charId, buffId) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, buffs: (c.buffs || []).filter(b => b.id !== buffId) };
      }
      return c;
    }));
  };

  const advanceRound = () => {
    const expired = [];
    
    setCharacters(prev => prev.map(c => {
      const newBuffs = (c.buffs || []).map(b => ({
        ...b,
        remaining: b.remaining - 1
      })).filter(b => {
        if (b.remaining <= 0) {
          expired.push({ charName: c.name, buffName: b.name });
          return false;
        }
        return true;
      });
      return { ...c, buffs: newBuffs };
    }));

    if (expired.length > 0) {
      setExpiredBuffs(expired);
      setTimeout(() => setExpiredBuffs([]), 3000);
    }
    
    setRound(prev => prev + 1);
  };

  const revertRound = () => {
    setRound(prev => Math.max(1, prev - 1));
  };

  const resetAll = () => {
    if (confirm('すべてリセットしますか？')) {
      setCharacters([]);
      setRound(1);
      setPartyBuffs(null);
    }
  };

  const setPartyBuff = (buff) => {
    setPartyBuffs(buff);
  };

  // ダメージを対象に適用
  const applyDamageToTarget = (targetId, targetPartId, damage) => {
    setCharacters(prev => prev.map(c => {
      if (c.id !== targetId) return c;
      
      if (c.parts && targetPartId) {
        // 複数部位の敵
        const newParts = c.parts.map(p => {
          if (p.id === targetPartId) {
            return { ...p, hp: { ...p.hp, current: p.hp.current - damage } };
          }
          return p;
        });
        return { ...c, parts: newParts };
      } else {
        // 単体
        return { ...c, hp: { ...c.hp, current: c.hp.current - damage } };
      }
    }));
  };

  const allies = characters.filter(c => c.type === 'ally');
  const enemies = characters.filter(c => c.type === 'enemy');

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* バフ切れ通知 */}
      {expiredBuffs.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-orange-900/90 border border-orange-600 
          rounded-lg px-4 py-3 shadow-lg max-w-sm">
          <div className="text-orange-300 text-sm font-medium mb-1">バフが切れました</div>
          {expiredBuffs.map((e, i) => (
            <div key={i} className="text-orange-200 text-xs">
              {e.charName}: {e.buffName}
            </div>
          ))}
        </div>
      )}

      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-stone-950/95 border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-amber-400 to-orange-400"
              style={{ fontFamily: 'serif' }}>
              SW2.0 戦闘管理
            </h1>
            
            <button
              onClick={resetAll}
              className="text-sm text-stone-500 active:text-red-400 px-2 py-1"
            >
              リセット
            </button>
          </div>

          {/* ラウンドカウンター */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={revertRound}
              disabled={round <= 1}
              className="w-10 h-10 flex items-center justify-center bg-stone-800 
                active:bg-stone-700 disabled:opacity-50 rounded-full transition-colors text-stone-300 text-xl"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-xs text-stone-500">ROUND</div>
              <div className="text-3xl font-bold text-amber-400">{round}</div>
            </div>
            <button
              onClick={advanceRound}
              className="w-10 h-10 flex items-center justify-center bg-amber-700 
                active:bg-amber-600 rounded-full transition-colors text-white text-xl"
            >
              ＋
            </button>
          </div>
          <p className="text-center text-xs text-stone-600 mt-1">
            ＋でラウンド進行（バフ自動カウント）
          </p>
        </div>
      </header>

      {/* 鼓咆（全体バフ）エリア */}
      <div className="max-w-4xl mx-auto px-4 pt-3">
        <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-400">🎺 鼓咆（全体バフ）</span>
            <button
              onClick={() => setShowKohoModal(true)}
              className="text-xs text-amber-500 active:text-amber-400"
            >
              編集
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {partyBuffs ? (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs
                ${partyBuffs.type === 'attack' 
                  ? 'bg-orange-900/60 text-orange-300 border border-orange-700'
                  : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                }`}>
                <span className={`text-xs ${partyBuffs.type === 'attack' ? 'text-orange-500' : 'text-cyan-500'}`}>
                  {partyBuffs.type === 'attack' ? '攻' : '防'}
                </span>
                <span className="font-medium">{partyBuffs.name}</span>
                <span className="text-stone-400">: {partyBuffs.effect}</span>
                <button
                  onClick={() => setPartyBuff(null)}
                  className="ml-1 text-stone-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ) : (
              <span className="text-xs text-stone-600">なし</span>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto p-4">
        {characters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 mb-6">キャラクターがいません</p>
            <div className="flex flex-col gap-3">
              <AddCharacterForm onAdd={addCharacter} />
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full py-4 border-2 border-dashed border-amber-600/50 rounded-lg
                  text-amber-500 active:bg-amber-900/20 
                  transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <span className="text-xl">📋</span>
                <span>テンプレートから追加</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {allies.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  味方 ({allies.length})
                </h2>
                <div className="space-y-3">
                  {allies.map(char => (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      onUpdate={updateCharacter}
                      onDelete={deleteCharacter}
                      onEditStats={setEditingChar}
                      onAddBuff={setAddingBuffChar}
                      onRemoveBuff={removeBuff}
                      enemies={enemies}
                      partyBuff={partyBuffs}
                      onApplyDamage={applyDamageToTarget}
                    />
                  ))}
                </div>
              </section>
            )}

            {enemies.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  敵 ({enemies.length})
                </h2>
                <div className="space-y-3">
                  {enemies.map(char => (
                    char.parts ? (
                      <MultiPartEnemyCard
                        key={char.id}
                        character={char}
                        onUpdate={updateCharacter}
                        onDelete={deleteCharacter}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={removeBuff}
                      />
                    ) : (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        onUpdate={updateCharacter}
                        onDelete={deleteCharacter}
                        onEditStats={setEditingChar}
                        onAddBuff={setAddingBuffChar}
                        onRemoveBuff={removeBuff}
                      />
                    )
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col gap-3">
              <AddCharacterForm onAdd={addCharacter} />
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full py-4 border-2 border-dashed border-amber-600/50 rounded-lg
                  text-amber-500 active:bg-amber-900/20 
                  transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <span className="text-xl">📋</span>
                <span>テンプレートから追加</span>
              </button>
            </div>
          </>
        )}
      </main>

      {editingChar && (
        <CharacterEditModal
          character={editingChar}
          onSave={updateCharacter}
          onClose={() => setEditingChar(null)}
        />
      )}

      {addingBuffChar && (
        <AddBuffModal
          character={addingBuffChar}
          onAdd={addBuff}
          onClose={() => setAddingBuffChar(null)}
        />
      )}

      {showKohoModal && (
        <KohoModal
          partyBuff={partyBuffs}
          onSet={setPartyBuff}
          onClose={() => setShowKohoModal(false)}
        />
      )}

      {showTemplateModal && (
        <TemplateSelectModal
          onAdd={addCharacter}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      <footer className="text-center py-4 text-stone-600 text-sm">
        ※ページを閉じるとデータは消えます
      </footer>
    </div>
  );
}
