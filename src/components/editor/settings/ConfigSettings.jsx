import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import StyledCheckbox from "../StyledCheckBox";
import { inputPropsDefaultNum } from "./inputProps";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import MyAccordion from "../MyAccordion";

function ConfigSetting({gameConfig, handleDatasetChange}) {
    return(
        <>
            <MyAccordion title="表示設定">
                <FormField label="BGM音量バー表示">
                    <StyledCheckbox
                        checked={gameConfig.visibleBGM}
                        onChange={handleDatasetChange}
                        data-path="game.config.visibleBGM"
                    />
                </FormField>

                <FormField label="SE音量バー表示">
                    <StyledCheckbox
                        checked={gameConfig.visibleSE}
                        onChange={handleDatasetChange}
                        data-path="game.config.visibleSE"
                    />
                </FormField>

                <FormField label="ボイス音量バー表示">
                    <StyledCheckbox
                        checked={gameConfig.visibleVoice}
                        onChange={handleDatasetChange}
                        data-path="game.config.visibleVoice"
                    />
                </FormField>

                <FormField label="文字送り速度バー表示">
                    <StyledCheckbox
                        checked={gameConfig.visibleSpeed}
                        onChange={handleDatasetChange}
                        data-path="game.config.visibleSpeed"
                    />
                </FormField>

                <FormField label="オート設定表示">
                    <StyledCheckbox
                        checked={gameConfig.visibleAuto ?? true}
                        onChange={handleDatasetChange}
                        data-path="game.config.visibleAuto"
                    />
                </FormField>
            </MyAccordion>

            <MyAccordion title="テキスト設定">
                <FormField label="BGM音量テキスト">
                    <StyledInput
                        value={gameConfig.bgmText}
                        onChange={handleDatasetChange}
                        data-path="game.config.bgmText"
                    />
                </FormField>

                <FormField label="SE音量テキスト">
                    <StyledInput
                        value={gameConfig.seText}
                        onChange={handleDatasetChange}
                        data-path="game.config.seText"
                    />
                </FormField>

                <FormField label="ボイス音量テキスト">
                    <StyledInput
                        value={gameConfig.voiceText}
                        onChange={handleDatasetChange}
                        data-path="game.config.voiceText"
                    />
                </FormField>

                <FormField label="文字送り速度テキスト">
                    <StyledInput
                        value={gameConfig.speedText}
                        onChange={handleDatasetChange}
                        data-path="game.config.speedText"
                    />
                </FormField>

                <FormField label="オートテキスト">
                    <StyledInput
                        value={gameConfig.autoText ?? "オート"}
                        onChange={handleDatasetChange}
                        data-path="game.config.autoText"
                    />
                </FormField>
            </MyAccordion>

            <MyAccordion title="背景">
                <FormField label="背景色">
                    <RgbaColorInput
                        value={gameConfig.backStyle.backgroundColor}
                        onChange={handleDatasetChange}
                        data-path="game.config.backStyle.backgroundColor"
                    />
                </FormField>

                <FormField label="背景画像">
                    <StyledInput
                        type="text"
                        value={gameConfig.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
                        onChange={handleDatasetChange}
                        data-path="game.config.backStyle.backgroundImage"
                        data-type="url"
                    />
                </FormField>
            </MyAccordion>

            <MyAccordion title="コンテナ">
                <MyAccordion title="レイアウト・背景" defaultOpen={false}>
                    <FormField label="横幅">
                        <StyledInput
                            type="number"
                            value={gameConfig.containerStyle.width}
                            onChange={handleDatasetChange}
                            inputProps={inputPropsDefaultNum}
                            data-path="game.config.containerStyle.width"
                        />
                    </FormField>

                    <FormField label="間隔">
                        <StyledInput
                            type="number"
                            value={gameConfig.containerStyle.gap}
                            onChange={handleDatasetChange}
                            inputProps={inputPropsDefaultNum}
                            data-path="game.config.containerStyle.gap"
                        />
                    </FormField>

                    <FormField label="背景色">
                        <RgbaColorInput
                            value={gameConfig.containerStyle.backgroundColor}
                            onChange={handleDatasetChange}
                            data-path="game.config.containerStyle.backgroundColor"
                        />
                    </FormField>

                    <FormField label="背景画像">
                        <StyledInput
                            type="text"
                            value={gameConfig.containerStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
                            onChange={handleDatasetChange}
                            data-path="game.config.containerStyle.backgroundImage"
                            data-type="url"
                        />
                    </FormField>
                </MyAccordion>

                <MyAccordion title="ボーダー・影" defaultOpen={false}>
                    <FormField label="ボーダー太さ">
                        <StyledInput
                        type="number"
                        value={parseInt(gameConfig.containerStyle.borderWidth) || 0}
                        onChange={handleDatasetChange}
                        inputProps={inputPropsDefaultNum}
                        data-path="game.config.containerStyle.borderWidth"
                        data-type="px"
                        />
                    </FormField>

                    <BorderStyleSelect
                        label="ボーダースタイル"
                        value={gameConfig.containerStyle.borderStyle}
                        onChange={handleDatasetChange}
                        data-path="game.config.containerStyle.borderStyle"
                    />

                    <FormField label="ボーダー色">
                        <RgbaColorInput
                        value={gameConfig.containerStyle.borderColor}
                        onChange={handleDatasetChange}
                        data-path="game.config.containerStyle.borderColor"
                        />
                    </FormField>

                    <FormField label="角丸">
                        <StyledInput
                        type="number"
                        value={parseInt(gameConfig.containerStyle.borderRadius) || 0}
                        onChange={handleDatasetChange}
                        inputProps={inputPropsDefaultNum}
                        data-path="game.config.containerStyle.borderRadius"
                        data-type="px"
                        />
                    </FormField>

                    <FormField label="影色">
                        <RgbaColorInput
                        value={gameConfig.containerStyle.shadowColor}
                        onChange={handleDatasetChange}
                        data-path="game.config.containerStyle.shadowColor"
                        />
                    </FormField>
                </MyAccordion>

                <MyAccordion title="文字" defaultOpen={false}>
                    <FormField label="文字サイズ">
                        <StyledInput
                        type="number"
                        value={parseInt(gameConfig.containerStyle.fontSize) || 0}
                        onChange={handleDatasetChange}
                        inputProps={inputPropsDefaultNum}
                        data-path="game.config.containerStyle.fontSize"
                        data-type="px"
                        />
                    </FormField>

                    <FormField label="文字色">
                        <RgbaColorInput
                        value={gameConfig.containerStyle.color}
                        onChange={handleDatasetChange}
                        data-path="game.config.containerStyle.color"
                        />
                    </FormField>
                </MyAccordion>
            </MyAccordion>

            <MyAccordion title="トラック">
                <FormField label="縦幅">
                    <StyledInput
                        type="number"
                        value={gameConfig.trackStyle.height}
                        onChange={handleDatasetChange}
                        inputProps={inputPropsDefaultNum}
                        data-path="game.config.trackStyle.height"
                    />
                </FormField>

                <FormField label="角丸">
                    <StyledInput
                    type="number"
                    value={parseInt(gameConfig.trackStyle.borderRadius) || 0}
                    onChange={handleDatasetChange}
                    inputProps={inputPropsDefaultNum}
                    data-path="game.config.trackStyle.borderRadius"
                    data-type="px"
                    />
                </FormField>

                <FormField label="背景色">
                    <RgbaColorInput
                        value={gameConfig.trackStyle.backgroundColor}
                        onChange={handleDatasetChange}
                        data-path="game.config.trackStyle.backgroundColor"
                    />
                </FormField>
            </MyAccordion>

            <MyAccordion title="つまみ">
                <FormField label="サイズ">
                    <StyledInput
                        type="number"
                        value={gameConfig.thumbStyle.size}
                        onChange={handleDatasetChange}
                        inputProps={inputPropsDefaultNum}
                        data-path="game.config.thumbStyle.size"
                    />
                </FormField>

                <FormField label="背景色">
                    <RgbaColorInput
                        value={gameConfig.thumbStyle.backgroundColor}
                        onChange={handleDatasetChange}
                        data-path="game.config.thumbStyle.backgroundColor"
                    />
                </FormField>

                <FormField label="ボーダー太さ">
                    <StyledInput
                    type="number"
                    value={parseInt(gameConfig.thumbStyle.borderWidth) || 0}
                    onChange={handleDatasetChange}
                    inputProps={inputPropsDefaultNum}
                    data-path="game.config.thumbStyle.borderWidth"
                    data-type="px"
                    />
                </FormField>

                <BorderStyleSelect
                    label="ボーダースタイル"
                    value={gameConfig.thumbStyle.borderStyle}
                    onChange={handleDatasetChange}
                    data-path="game.config.thumbStyle.borderStyle"
                />

                <FormField label="ボーダー色">
                    <RgbaColorInput
                    value={gameConfig.thumbStyle.borderColor}
                    onChange={handleDatasetChange}
                    data-path="game.config.thumbStyle.borderColor"
                    />
                </FormField>
            </MyAccordion>
        </>
    )
}

export default memo(ConfigSetting);
