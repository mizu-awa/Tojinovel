import { Howl, Howler } from "howler";

class AudioManager {
  constructor() {
    this.bgm = null;        // 1つだけ
    this.voice = null;      // 1つだけ
    this.seList = [];       // 同時再生OK

    // 🚀 修正①: ユーザー操作後にAudioContextを解放
    document.addEventListener(
      "click",
      () => {
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume();
        }
      },
      { once: true }
    );

    // 🚀 修正②: 効果音キャッシュ用
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
      }, fadeOutMs);
    }
  }
  /** 効果音をワンショット再生（キャッシュ付き） */
  playSE(src, volume = 1.0) {
    // 🚀 修正③: 同じ音源は再利用
    let se = this.seCache.get(src);
    if (!se) {
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
    this.seList.forEach((s) => s.stop());
    this.seList = [];
    this.stopVoice();
  }
}

export const audioManager = new AudioManager();