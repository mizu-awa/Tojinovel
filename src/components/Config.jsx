import { X } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { VolumeSlider } from "./VolumeSlider";

const backStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 3003,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  justifyContent: "center",
  alignItems: "center"
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 4fr 1fr",
  alignItems: "center",
  gap: "12px",
  textAlign: "center"
};

const containerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  padding: "2em 2.5em",
  boxSizing: "border-box"
};

function Config({ visible, config, close, bgm, se, voice, speed, autoEnabled, autoSpeed, updateGameData }) {
  // 🔹 ローカルstate（操作中だけ即時反映）
  const [tempBGM, setTempBGM] = useState(bgm);
  const [tempSE, setTempSE] = useState(se);
  const [tempVoice, setTempVoice] = useState(voice);
  const [tempSpeed, setTempSpeed] = useState(speed);
  const [tempAutoEnabled, setTempAutoEnabled] = useState(autoEnabled);
  const [tempAutoSpeed, setTempAutoSpeed] = useState(autoSpeed);

  // 🔹 外部値が変わったら同期（設定画面開き直したとき用）
  useEffect(() => setTempBGM(bgm), [bgm]);
  useEffect(() => setTempSE(se), [se]);
  useEffect(() => setTempVoice(voice), [voice]);
  useEffect(() => setTempSpeed(speed), [speed]);
  useEffect(() => setTempAutoEnabled(autoEnabled), [autoEnabled]);
  useEffect(() => setTempAutoSpeed(autoSpeed), [autoSpeed]);

  // 🔹 共通のデバウンズ関数
  const useDebouncedUpdate = (value, path) => {
    useEffect(() => {
      const timeout = setTimeout(() => {
        updateGameData(prev => {
          const next = { ...prev };
          let target = next.game;
          // パスに応じて入れ替える
          if (path === "bgm") target.sound.bgm = value;
          else if (path === "se") target.sound.se = value;
          else if (path === "voice") target.sound.voice = value;
          else if (path === "speed") target.textBox.speed = value;
          else if (path === "autoEnabled") {
            if (!target.auto) target.auto = {};
            target.auto.enabled = value;
          }
          else if (path === "autoSpeed") {
            if (!target.auto) target.auto = {};
            target.auto.speed = value;
          }
          return next;
        });
      }, 150); // 🔸 150〜300msが快適
      return () => clearTimeout(timeout);
    }, [value]);
  };

  // 🔹 各値にデバウンズ反映適用
  useDebouncedUpdate(tempBGM, "bgm");
  useDebouncedUpdate(tempSE, "se");
  useDebouncedUpdate(tempVoice, "voice");
  useDebouncedUpdate(tempSpeed, "speed");
  useDebouncedUpdate(tempAutoEnabled, "autoEnabled");
  useDebouncedUpdate(tempAutoSpeed, "autoSpeed");

  const centralFontSize = parseInt(config?.containerStyle?.fontSize) || 16;

  if (!visible) return null;

  return (
    <div style={{ ...config.backStyle, ...backStyle }}>
      <div style={{ ...containerStyle, ...config.containerStyle, boxShadow: `0 4px 12px ${config.containerStyle.shadowColor}`, }}>
        {config.visibleBGM && (
          <div style={rowStyle}>
            <label>{config.bgmText}</label>
            <VolumeSlider
              type="range"
              min="0"
              max="2"
              step="0.05"
              trackStyle={config.trackStyle}
              thumbStyle={config.thumbStyle}
              value={tempBGM}
              onChange={(e) => setTempBGM(Number(e.target.value))}
            />
            <p>{tempBGM}</p>
          </div>
        )}

        {config.visibleSE && (
          <div style={rowStyle}>
            <label>{config.seText}</label>
            <VolumeSlider
              type="range"
              min="0"
              max="2"
              step="0.05"
              trackStyle={config.trackStyle}
              thumbStyle={config.thumbStyle}
              value={tempSE}
              onChange={(e) => setTempSE(Number(e.target.value))}
            />
            <p>{tempSE}</p>
          </div>
        )}

        {config.visibleVoice && (
          <div style={rowStyle}>
            <label>{config.voiceText}</label>
            <VolumeSlider
              type="range"
              min="0"
              max="2"
              step="0.05"
              trackStyle={config.trackStyle}
              thumbStyle={config.thumbStyle}
              value={tempVoice}
              onChange={(e) => setTempVoice(Number(e.target.value))}
            />
            <p>{tempVoice}</p>
          </div>
        )}

        {config.visibleSpeed && (
          <div style={rowStyle}>
            <label>{config.speedText}</label>
            <VolumeSlider
              type="range"
              min="0"
              max="300"
              step="5"
              trackStyle={config.trackStyle}
              thumbStyle={config.thumbStyle}
              value={tempSpeed}
              onChange={(e) => setTempSpeed(Number(e.target.value))}
            />
            <p>{tempSpeed}</p>
          </div>
        )}

        {config.visibleAuto && (
          <div style={rowStyle}>
            <label>{config.autoText ?? "オート"}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={tempAutoEnabled}
                onChange={(e) => setTempAutoEnabled(e.target.checked)}
                style={{ width: centralFontSize, height: centralFontSize, cursor: "pointer", flexShrink: 0 }}
              />
              <VolumeSlider
                type="range"
                min="500"
                max="5000"
                step="100"
                trackStyle={config.trackStyle}
                thumbStyle={config.thumbStyle}
                value={tempAutoSpeed}
                onChange={(e) => setTempAutoSpeed(Number(e.target.value))}
                disabled={!tempAutoEnabled}
              />
            </div>
            <p>{tempAutoSpeed}</p>
          </div>
        )}
      </div>

      <div
        style={{ position: "absolute", top: 10, right: 10 }}
        onClick={close}
      >
        <X />
      </div>
    </div>
  );
}

export default memo(Config);