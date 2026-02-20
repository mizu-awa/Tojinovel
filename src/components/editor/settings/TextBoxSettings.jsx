import { memo } from "react";
import FormField from "../FormField"
import BorderStyleSelect from "../BorderStyleSelect"
import RgbaColorInput from "../RgbaColorInput"
import { StyledInput } from "../StyledInput"
import FilePathInput from "../FilePathInput"
import TextAlignSelector from "../TextAlignSelector"
import { inputPropsDefaultNum, inputPropsLinehight } from "./inputProps";
import MyAccordion from "../MyAccordion";

const TextBoxSettings = ({
  gameTextBox,
  handleDatasetChange,
  fileList,
  ensureFileListLoaded
}) => {

  return(
    <>
      <MyAccordion title="基本設定">
        <FormField label="文字送り速度[ms]">
          <StyledInput
            type="number"
            value={gameTextBox.speed}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.speed"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="位置・サイズ">
        <FormField label="位置（横軸）">
          <StyledInput
            type="number"
            value={gameTextBox.position[0]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.position.0"
          />
        </FormField>

        <FormField label="位置（縦軸）">
          <StyledInput
            type="number"
            value={gameTextBox.position[1]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.position.1"
          />
        </FormField>

        <FormField label="横幅">
          <StyledInput
            type="number"
            value={gameTextBox.size[0]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.size.0"
          />
        </FormField>

        <FormField label="縦幅">
          <StyledInput
            type="number"
            value={gameTextBox.size[1]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.size.1"
          />
        </FormField>

        <FormField label="余白">
          <StyledInput
            type="number"
            value={gameTextBox.style.padding}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.style.padding"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="スタイル">
        <FormField label="背景色">
          <RgbaColorInput
            value={gameTextBox.style.backgroundColor}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.backgroundColor"
          />
        </FormField>

        <FormField label="背景画像">
          <FilePathInput
            options={fileList}
            onFocus={ensureFileListLoaded}
            value={gameTextBox.style.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.backgroundImage"
            data-type="url"
          />
        </FormField>

        <FormField label="ボーダー太さ">
          <StyledInput
            type="number"
            value={parseInt(gameTextBox.style.borderTopWidth) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.style.borderTopWidth"
            data-type="px"
          />
        </FormField>

        <BorderStyleSelect
          label="ボーダースタイル"
          value={gameTextBox.style.borderTopStyle}
          onChange={handleDatasetChange}
          data-path="game.textBox.style.borderTopStyle"
        />

        <FormField label="ボーダー色">
          <RgbaColorInput
            value={gameTextBox.style.borderTopColor}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.borderTopColor"
          />
        </FormField>

        <FormField label="角丸">
          <StyledInput
            type="number"
            value={parseInt(gameTextBox.style.borderTopRightRadius) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.style.borderTopRightRadius"
            data-type="px"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="文字設定">
        <FormField label="文字サイズ">
          <StyledInput
            type="number"
            value={parseInt(gameTextBox.style.fontSize) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.textBox.style.fontSize"
            data-type="px"
          />
        </FormField>

        <FormField label="行揃え">
          <TextAlignSelector
            value={gameTextBox.style.textAlign}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.textAlign"
          />
        </FormField>

        <FormField label="行間">
          <StyledInput
            inputProps={inputPropsLinehight}
            value={gameTextBox.style.lineHeight}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.lineHeight"
          />
        </FormField>

        <FormField label="文字色">
          <RgbaColorInput
            value={gameTextBox.style.color}
            onChange={handleDatasetChange}
            data-path="game.textBox.style.color"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="名前表示">
        <MyAccordion title="基本">
          <FormField label="テキストボックスとの距離">
            <StyledInput
              type="number"
              value={gameTextBox.nameStyle.distance}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.distance"
            />
          </FormField>

          <FormField label="パディング">
            <StyledInput
              type="number"
              value={gameTextBox.nameStyle.padding}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.padding"
            />
          </FormField>

          <FormField label="最小幅">
            <StyledInput
              type="number"
              value={gameTextBox.nameStyle.minWidth}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.minWidth"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="背景">
          <FormField label="背景色">
            <RgbaColorInput
              value={gameTextBox.nameStyle.backgroundColor}
              onChange={handleDatasetChange}
              data-path="game.textBox.nameStyle.backgroundColor"
            />
          </FormField>

          <FormField label="背景画像">
            <FilePathInput
              options={fileList}
              onFocus={ensureFileListLoaded}
              value={gameTextBox.nameStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path="game.textBox.nameStyle.backgroundImage"
              data-type="url"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="文字">
          <FormField label="文字色">
            <RgbaColorInput
              value={gameTextBox.nameStyle.color}
              onChange={handleDatasetChange}
              data-path="game.textBox.nameStyle.color"
            />
          </FormField>

          <FormField label="文字サイズ">
            <StyledInput
              type="number"
              value={parseInt(gameTextBox.nameStyle.fontSize) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.fontSize"
              data-type="px"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="枠線">
          <FormField label="ボーダー太さ">
            <StyledInput
              type="number"
              value={parseInt(gameTextBox.nameStyle.borderWidth) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.borderWidth"
              data-type="px"
            />
          </FormField>

          <BorderStyleSelect
            label="ボーダースタイル"
            value={gameTextBox.nameStyle.borderStyle}
            onChange={handleDatasetChange}
            data-path="game.textBox.nameStyle.borderStyle"
          />

          <FormField label="ボーダー色">
            <RgbaColorInput
              value={gameTextBox.nameStyle.borderColor}
              onChange={handleDatasetChange}
              data-path="game.textBox.nameStyle.borderColor"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="角丸">
          <FormField label="角丸">
            <StyledInput
              type="number"
              value={parseInt(gameTextBox.nameStyle.borderRadius) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.textBox.nameStyle.borderRadius"
              data-type="px"
            />
          </FormField>
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "8px" }}>
            距離が0の場合は下部の角丸が無効になります
          </p>
        </MyAccordion>
      </MyAccordion>

      <MyAccordion title="ハイライト・インジケーター">
        <FormField label="文字色（ハイライト）">
          <RgbaColorInput
            value={gameTextBox.highlightStyle.color}
            onChange={handleDatasetChange}
            data-path="game.textBox.highlightStyle.color"
          />
        </FormField>

        <FormField label="縁色（ハイライト）">
          <RgbaColorInput
            value={gameTextBox.highlightStyle.strokeColor}
            onChange={handleDatasetChange}
            data-path="game.textBox.highlightStyle.strokeColor"
          />
        </FormField>

        <FormField label="インジケーター文字">
          <StyledInput
            type="text"
            value={gameTextBox.indicator?.text ?? "▼"}
            onChange={handleDatasetChange}
            data-path="game.textBox.indicator.text"
          />
        </FormField>
      </MyAccordion>
    </>
  )
}

export default memo(TextBoxSettings);
