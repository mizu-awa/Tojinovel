// externalFuncService のテスト
// モジュール読み込み、同期/非同期実行、エラー処理、タイムアウトを検証する

// storageService をモック（vi.mock はファイル先頭に巻き上げられる）
vi.mock('./storageService.js', () => ({
  storage: {
    loadEventFile: vi.fn(),
  },
}));

import { executeExternalFunc, clearModuleCache } from './externalFuncService.js';
import { storage } from './storageService.js';

// state-----
let origBlob;
let origURLCreateObjectURL;
let origURLRevokeObjectURL;

// functions-----

// Node.js の import() は blob: URL を解決できないため、
// Blob と URL.createObjectURL を data URL に変換するモックに差し替える
// （Node.js v12.22+ は data:text/javascript URL の dynamic import をサポート）
function mockBlobAndUrl() {
  origBlob = global.Blob;
  origURLCreateObjectURL = URL.createObjectURL;
  origURLRevokeObjectURL = URL.revokeObjectURL;

  global.Blob = class MockBlob {
    constructor(parts) {
      this.content = parts[0];
    }
  };
  URL.createObjectURL = vi.fn(
    (blob) => `data:text/javascript,${encodeURIComponent(blob.content)}`
  );
  URL.revokeObjectURL = vi.fn();
}

function restoreBlobAndUrl() {
  global.Blob = origBlob;
  URL.createObjectURL = origURLCreateObjectURL;
  URL.revokeObjectURL = origURLRevokeObjectURL;
}

describe('externalFuncService', () => {
  beforeEach(() => {
    clearModuleCache();
    vi.resetAllMocks();
    mockBlobAndUrl();
  });

  afterEach(() => {
    restoreBlobAndUrl();
    vi.useRealTimers();
  });

  // -----拡張子チェック-----

  describe('拡張子チェック', () => {
    it('.js 以外のファイルは "" を同期的に返す', () => {
      const result = executeExternalFunc('plugin.py', 'func', []);
      expect(result).toBe('');
      expect(storage.loadEventFile).not.toHaveBeenCalled();
    });

    it('.js ファイルは loadEventFile を呼び出す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function hello() { return "world"; }'
      );
      await executeExternalFunc('test.js', 'hello', []);
      expect(storage.loadEventFile).toHaveBeenCalledWith('test.js');
    });
  });

  // -----モジュール読み込み-----

  describe('モジュール読み込み', () => {
    it('ファイルが見つからない（null）場合は "" を返す', async () => {
      storage.loadEventFile.mockResolvedValue(null);
      const result = await executeExternalFunc('missing.js', 'func', []);
      expect(result).toBe('');
    });

    it('loadEventFile が例外をスローした場合は "" を返す', async () => {
      storage.loadEventFile.mockRejectedValue(new Error('読み込み失敗'));
      const result = await executeExternalFunc('error.js', 'func', []);
      expect(result).toBe('');
    });

    it('同じファイルは一度しか読み込まれない（キャッシュ）', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function f() { return 1; }'
      );
      await executeExternalFunc('once.js', 'f', []);
      await executeExternalFunc('once.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(1);
    });
  });

  // -----同期関数実行-----

  describe('同期関数の実行', () => {
    it('同期関数の戻り値を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function add(a, b) { return Number(a) + Number(b); }'
      );
      const result = await executeExternalFunc('calc.js', 'add', [10, 20]);
      expect(result).toBe(30);
    });

    it('引数なしの同期関数も実行できる', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function greet() { return "hello"; }'
      );
      const result = await executeExternalFunc('greet.js', 'greet', []);
      expect(result).toBe('hello');
    });

    it('キャッシュ済みの同期関数は Promise ではなく値を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function getValue() { return "cached"; }'
      );
      // 初回: モジュールロード（Promise）
      await executeExternalFunc('cache.js', 'getValue', []);
      // 2回目: キャッシュ済み → 同期的に値を返す
      const result = executeExternalFunc('cache.js', 'getValue', []);
      expect(result instanceof Promise).toBe(false);
      expect(result).toBe('cached');
    });
  });

  // -----非同期関数実行-----

  describe('非同期関数の実行', () => {
    it('非同期関数の戻り値を await で取得できる', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export async function double(x) { return Number(x) * 2; }'
      );
      const result = await executeExternalFunc('async.js', 'double', [21]);
      expect(result).toBe(42);
    });

    it('キャッシュ済みの非同期関数は Promise を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export async function getValue() { return 99; }'
      );
      // 初回: ロード
      await executeExternalFunc('asynccache.js', 'getValue', []);
      // 2回目: キャッシュ済みでも非同期関数なので Promise を返す
      const result = executeExternalFunc('asynccache.js', 'getValue', []);
      expect(result instanceof Promise).toBe(true);
      expect(await result).toBe(99);
    });
  });

  // -----エラーハンドリング-----

  describe('エラーハンドリング', () => {
    it('関数が存在しない場合は "" を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function existing() { return 1; }'
      );
      const result = await executeExternalFunc('plugin.js', 'notExisting', []);
      expect(result).toBe('');
    });

    it('キャッシュ済みで関数が存在しない場合は "" を同期的に返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function existing() { return 1; }'
      );
      await executeExternalFunc('plugin.js', 'existing', []);
      const result = executeExternalFunc('plugin.js', 'notExisting', []);
      expect(result instanceof Promise).toBe(false);
      expect(result).toBe('');
    });

    it('同期関数が例外をスローした場合は "" を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function broken() { throw new Error("壊れた関数"); }'
      );
      const result = await executeExternalFunc('broken.js', 'broken', []);
      expect(result).toBe('');
    });

    it('非同期関数が例外をスローした場合は "" を返す', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export async function brokenAsync() { throw new Error("非同期エラー"); }'
      );
      const result = await executeExternalFunc('brokenasync.js', 'brokenAsync', []);
      expect(result).toBe('');
    });
  });

  // -----タイムアウト-----

  describe('タイムアウト', () => {
    it('非同期関数が 10 秒以内に完了しない場合は "" を返す', async () => {
      // 先にモジュールをキャッシュに読み込む（fake timer 前に import を完了させる）
      storage.loadEventFile.mockResolvedValue(
        'export function preload() { return 1; }\n' +
          'export async function slow() { return new Promise(() => {}); }'
      );
      await executeExternalFunc('slow.js', 'preload', []);

      // fake timer に切り替えて slow() を実行
      vi.useFakeTimers();
      const resultPromise = executeExternalFunc('slow.js', 'slow', []);

      // 10 秒のタイムアウトを発火させる（11 秒進める）
      await vi.advanceTimersByTimeAsync(11000);

      expect(await resultPromise).toBe('');
    });
  });

  // -----clearModuleCache-----

  describe('clearModuleCache', () => {
    it('特定ファイルのキャッシュをクリアすると再ロードが発生する', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function f() { return 1; }'
      );
      await executeExternalFunc('plugin.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(1);

      clearModuleCache('plugin.js');

      await executeExternalFunc('plugin.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(2);
    });

    it('引数なしで全キャッシュをクリアする', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function f() { return 1; }'
      );
      await executeExternalFunc('a.js', 'f', []);
      await executeExternalFunc('b.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(2);

      clearModuleCache();

      await executeExternalFunc('a.js', 'f', []);
      await executeExternalFunc('b.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(4);
    });

    it('指定ファイル以外のキャッシュはクリアされない', async () => {
      storage.loadEventFile.mockResolvedValue(
        'export function f() { return 1; }'
      );
      await executeExternalFunc('keep.js', 'f', []);
      await executeExternalFunc('clear.js', 'f', []);

      clearModuleCache('clear.js');

      // keep.js はキャッシュ済みのため再ロードされない
      executeExternalFunc('keep.js', 'f', []);
      expect(storage.loadEventFile).toHaveBeenCalledTimes(2);
    });
  });
});
