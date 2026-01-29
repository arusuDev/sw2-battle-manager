import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkBuffModal } from './BulkBuffModal';
import type { Character, AllyCharacter, SingleEnemy, MultiPartEnemy } from '../../types';

// ============================================
// テスト用のキャラクターデータ
// ============================================
const createAlly = (overrides: Partial<AllyCharacter> = {}): AllyCharacter => ({
  id: 'ally-1',
  name: '戦士太郎',
  type: 'ally',
  hp: { current: 30, max: 30 },
  mp: { current: 10, max: 10 },
  stats: { dex: 12, agi: 10, str: 14, vit: 12, int: 8, mnd: 10 },
  skillLevels: {},
  modifiers: { hitMod: 0, dodgeMod: 0, defense: 5 },
  buffs: [],
  ...overrides,
});

const createEnemy = (overrides: Partial<SingleEnemy> = {}): SingleEnemy => ({
  id: 'enemy-1',
  name: 'ゴブリン',
  type: 'enemy',
  hp: { current: 20, max: 20 },
  mp: { current: 0, max: 0 },
  modifiers: { hitMod: 0, dodgeMod: 0, defense: 3 },
  buffs: [],
  ...overrides,
});

const createMultiPartEnemy = (overrides: Partial<MultiPartEnemy> = {}): MultiPartEnemy => ({
  id: 'multi-1',
  name: 'ドラゴン',
  type: 'enemy',
  parts: [
    { id: 'head', name: '頭部', hp: { current: 50, max: 50 }, mp: { current: 20, max: 20 }, hit: 8, dodge: 6, defense: 10 },
    { id: 'body', name: '胴体', hp: { current: 80, max: 80 }, mp: { current: 0, max: 0 }, hit: 6, dodge: 4, defense: 12 },
  ],
  buffs: [],
  ...overrides,
});

// ============================================
// 初期表示テスト
// ============================================
describe('BulkBuffModal - 初期表示', () => {
  it('モーダルが正しく表示される', () => {
    const characters: Character[] = [createAlly()];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('✨ 一括バフ付与')).toBeInTheDocument();
    expect(screen.getByText('味方')).toBeInTheDocument();
    expect(screen.getByText('敵')).toBeInTheDocument();
    expect(screen.getByText('🎺 鼓咆')).toBeInTheDocument();
  });

  it('味方タブで味方キャラが表示される', () => {
    const characters: Character[] = [
      createAlly({ id: 'a1', name: '戦士太郎' }),
      createAlly({ id: 'a2', name: '魔法使い花子' }),
      createEnemy({ id: 'e1', name: 'ゴブリン' }),
    ];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // 味方タブがデフォルト → 味方が表示される
    expect(screen.getByText('戦士太郎')).toBeInTheDocument();
    expect(screen.getByText('魔法使い花子')).toBeInTheDocument();
    // 敵は表示されない
    expect(screen.queryByText('ゴブリン')).not.toBeInTheDocument();
  });

  it('対象がいない場合はメッセージが表示される', () => {
    // 味方タブだが味方がいない
    const characters: Character[] = [createEnemy()];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('対象がいません')).toBeInTheDocument();
  });
});

// ============================================
// タブ切り替えテスト
// ============================================
describe('BulkBuffModal - タブ切り替え', () => {
  it('敵タブに切り替えると敵キャラが表示される', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [
      createAlly({ name: '戦士太郎' }),
      createEnemy({ name: 'ゴブリン' }),
    ];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByText('敵'));

    expect(screen.getByText('ゴブリン')).toBeInTheDocument();
    expect(screen.queryByText('戦士太郎')).not.toBeInTheDocument();
  });

  it('敵タブで複数部位敵は部位ごとに表示される', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [createMultiPartEnemy({ name: 'ドラゴン' })];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByText('敵'));

    expect(screen.getByText('ドラゴン(頭部)')).toBeInTheDocument();
    expect(screen.getByText('ドラゴン(胴体)')).toBeInTheDocument();
  });

  it('鼓咆タブに切り替えると味方キャラと鼓咆UIが表示される', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [
      createAlly({ name: '戦士太郎' }),
      createEnemy({ name: 'ゴブリン' }),
    ];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByText('🎺 鼓咆'));

    // 鼓咆タブでは味方のみ表示
    expect(screen.getByText('戦士太郎')).toBeInTheDocument();
    expect(screen.queryByText('ゴブリン')).not.toBeInTheDocument();
    // 鼓咆の説明テキスト
    expect(screen.getByText(/鼓咆は永続/)).toBeInTheDocument();
  });
});

// ============================================
// 対象選択テスト
// ============================================
describe('BulkBuffModal - 対象選択', () => {
  it('キャラクターをクリックして選択・解除できる', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [createAlly({ name: '戦士太郎' })];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const target = screen.getByText('戦士太郎');
    await user.click(target);
    // 選択カウントが1/1に
    expect(screen.getByText('対象を選択 (1/1)')).toBeInTheDocument();

    await user.click(target);
    // 解除で0/1に
    expect(screen.getByText('対象を選択 (0/1)')).toBeInTheDocument();
  });

  it('全選択ボタンで全キャラが選択される', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [
      createAlly({ id: 'a1', name: '戦士太郎' }),
      createAlly({ id: 'a2', name: '魔法使い花子' }),
    ];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByText('全選択'));

    expect(screen.getByText('対象を選択 (2/2)')).toBeInTheDocument();
  });

  it('解除ボタンで全選択が解除される', async () => {
    const user = userEvent.setup();
    const characters: Character[] = [
      createAlly({ id: 'a1', name: '戦士太郎' }),
    ];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByText('全選択'));
    await user.click(screen.getByText('解除'));

    expect(screen.getByText('対象を選択 (0/1)')).toBeInTheDocument();
  });
});

// ============================================
// バフ適用テスト
// ============================================
describe('BulkBuffModal - バフ適用', () => {
  it('プリセットを選択して適用するとonApplyが呼ばれる', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const characters: Character[] = [createAlly({ name: '戦士太郎' })];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={onApply}
        onClose={vi.fn()}
      />
    );

    // 対象を選択
    await user.click(screen.getByText('戦士太郎'));
    // プリセットを選択（キャッツアイ）
    await user.click(screen.getByText('キャッツアイ'));
    // 適用
    await user.click(screen.getByText('1件に適用'));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [targets, buff] = onApply.mock.calls[0];
    expect(targets).toHaveLength(1);
    expect(targets[0].characterId).toBe('ally-1');
    expect(buff.name).toBe('キャッツアイ');
    expect(buff.buffType).toBe('hit');
    expect(buff.buffValue).toBe(1);
    expect(buff.remaining).toBe(3);
  });

  it('対象未選択時は適用ボタンが無効になる', () => {
    const characters: Character[] = [createAlly()];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // プリセット未選択かつ対象未選択 → ボタンは無効
    const applyButton = screen.getByText('0件に適用');
    expect(applyButton).toBeDisabled();
  });

  it('キャンセルボタンでonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BulkBuffModal
        characters={[createAlly()]}
        onApply={vi.fn()}
        onClose={onClose}
      />
    );

    await user.click(screen.getByText('キャンセル'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================
// 鼓咆テスト
// ============================================
describe('BulkBuffModal - 鼓咆', () => {
  it('鼓咆プリセットを選択して適用できる', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const characters: Character[] = [createAlly({ name: '戦士太郎' })];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={onApply}
        onClose={vi.fn()}
      />
    );

    // 鼓咆タブに切り替え
    await user.click(screen.getByText('🎺 鼓咆'));
    // 味方を選択
    await user.click(screen.getByText('戦士太郎'));
    // 攻撃系の鼓咆を選択
    await user.click(screen.getByText('🎺 怒涛の攻陣'));
    // 適用
    await user.click(screen.getByText('鼓咆を適用'));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [targets, buff] = onApply.mock.calls[0];
    expect(targets).toHaveLength(1);
    expect(buff.isKoho).toBe(true);
    expect(buff.remaining).toBe(-1);  // 永続
    expect(buff.name).toBe('怒涛の攻陣');
  });

  it('鼓咆解除ボタンが表示され機能する', async () => {
    const user = userEvent.setup();
    const onRemoveKoho = vi.fn();
    const characters: Character[] = [createAlly({ name: '戦士太郎' })];
    render(
      <BulkBuffModal
        characters={characters}
        onApply={vi.fn()}
        onRemoveKoho={onRemoveKoho}
        onClose={vi.fn()}
      />
    );

    // 鼓咆タブに切り替え
    await user.click(screen.getByText('🎺 鼓咆'));
    // 味方を選択
    await user.click(screen.getByText('戦士太郎'));
    // 解除ボタンをクリック
    await user.click(screen.getByText('解除', { selector: 'button.px-4' }));

    expect(onRemoveKoho).toHaveBeenCalledTimes(1);
    const [targets] = onRemoveKoho.mock.calls[0];
    expect(targets).toHaveLength(1);
    expect(targets[0].characterId).toBe('ally-1');
  });
});
