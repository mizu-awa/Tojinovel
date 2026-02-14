import { Howl, Howler } from "howler";

const SE_CACHE_MAX = 50; // SEキャッシュ上限

class AudioManager {
  constructor() {
    this.bgm = null;        // 1つだけ
    this.voice = null;      // 1つだけ

    // ユーザー操作後にAudioContextを解放
    document.addEventListener(
      "click",
      () => {
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume();
        }
      },
      { once: true }
    );

    // 効果音キャッシュ用
    this.seCache = new Map();
  }

  /** BGMを再生（既存を止めてループ） */
  playBGM(src, volume = 0.8) {
    if (this.bgm) {this.bgm.stop(); this.bgm.unload()}

    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume,
      //html5: true, // TODO:長尺音声対応
    });

    this.bgm.play();
  }

  stopBGM(fadeOutMs = 500) {
    if (!this.bgm) return;

    const bgmToStop = this.bgm;
    this.bgm = null;

    if (bgmToStop._html5) {
      // HTML5モードではフェード無効
      bgmToStop.stop();
      bgmToStop.unload();
    } else {
      // WebAudioモードのみフェード
      bgmToStop.fade(bgmToStop.volume(), 0, fadeOutMs);
      setTimeout(() => {
        bgmToStop.stop();
        bgmToStop.unload();
      }, fadeOutMs);
    }
  }
  /** 効果音をワンショット再生（キャッシュ付き） */
  playSE(src, volume = 1.0) {
    let se = this.seCache.get(src);
    if (!se) {
      // キャッシュ上限チェック
      if (this.seCache.size >= SE_CACHE_MAX) {
        // 最も古いエントリを削除（Mapは挿入順を保持）
        const oldest = this.seCache.keys().next().value;
        const oldSe = this.seCache.get(oldest);
        oldSe.stop();
        oldSe.unload();
        this.seCache.delete(oldest);
      }
      se = new Howl({ src: [src], volume });
      this.seCache.set(src, se);
    }

    se.volume(volume);
    se.play();
  }

  /** セリフを再生（上書き） */
  playVoice(src, volume = 1.0) {
    if (this.voice) {this.voice.stop(); this.voice.unload()};
    this.voice = new Howl({
      src: [src],
      volume,
    });
    this.voice.play();
  }

  stopVoice() {
    if (this.voice) {
      this.voice.stop();
      this.voice.unload();
      this.voice = null;
    }
  }

  stopAll() {
    this.stopBGM(0);
    // キャッシュされた全SEを停止・解放
    for (const se of this.seCache.values()) {
      se.stop();
      se.unload();
    }
    this.seCache.clear();
    this.stopVoice();
  }
}

export const audioManager = new AudioManager();
