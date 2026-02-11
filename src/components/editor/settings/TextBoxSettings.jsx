import { memo } from "react";
import FormField from "../FormField"
import BorderStyleSelect from "../BorderStyleSelect"
import RgbaColorInput from "../RgbaColorInput"
import SectionDivider from "../SectionDivider"
import { StyledInput } from "../StyledInput"
import TextAlignSelector from "../TextAlignSelector"
import { inputPropsDefaultNum, inputPropsLinehight } from "./inputProps";

const TextBoxSettings = ({
  gameTextBox,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="文字送り速度[ms]">
        <StyledInput
          type="number"
          value={gameTextBox.speed}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.textBox.speed"
        />
      </FormField>

      <SectionDivider />

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

      <SectionDivider />

      <FormField label="背景色">
        <RgbaColorInput
          value={gameTextBox.style.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.textBox.style.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像">
        <StyledInput
          type="text"
          value={gameTextBox.style.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.textBox.style.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

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

      <SectionDivider />

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

      <SectionDivider />

      <FormField label="背景色（名前）">
        <RgbaColorInput
          value={gameTextBox.nameStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.textBox.nameStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像（名前）">
        <StyledInput
          type="text"
          value={gameTextBox.nameStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.textBox.nameStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

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

      <SectionDivider />

      <FormField label="インジケーター文字">
        <StyledInput
          type="text"
          value={gameTextBox.indicator?.text ?? "▼"}
          onChange={handleDatasetChange}
          data-path="game.textBox.indicator.text"
        />
      </FormField>

    </>
  )
}

export default memo(TextBoxSettings);