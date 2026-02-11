import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import RgbaColorInput from "../RgbaColorInput";
import SectionDivider from "../SectionDivider";
import BorderStyleSelect from "../BorderStyleSelect";
import { inputPropsDefaultNum } from "./inputProps";
import HoverSelector from "../HoverSelector";

const FormSettings = ({
  gameInput,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="位置（横軸）">
        <StyledInput
          type="number"
          value={gameInput.position[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.position.0"
        />
      </FormField>

      <FormField label="位置（縦軸）">
        <StyledInput
          type="number"
          value={gameInput.position[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.position.1"
        />
      </FormField>

      <FormField label="幅">
        <StyledInput
          type="number"
          value={gameInput.size[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.size.0"
        />
      </FormField>

      <FormField label="高さ">
        <StyledInput
          type="number"
          value={gameInput.size[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.size.1"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色（背景）">
        <RgbaColorInput
          value={gameInput.backStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.input.backStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像（背景）">
        <StyledInput
          type="text"
          value={gameInput.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.input.backStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ボーダー太さ（背景）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.backStyle.borderWidth) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.backStyle.borderWidth"
          data-type="px"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル（背景）"
        value={gameInput.backStyle.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.input.backStyle.borderStyle"
      />

      <FormField label="ボーダー色（背景）">
        <RgbaColorInput
          value={gameInput.backStyle.borderColor}
          onChange={handleDatasetChange}
          data-path="game.input.backStyle.borderColor"
        />
      </FormField>

      <FormField label="角丸（背景）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.backStyle.borderRadius) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.backStyle.borderRadius"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色（フォーム）">
        <RgbaColorInput
          value={gameInput.inputStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.input.inputStyle.backgroundColor"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ボーダー太さ（フォーム）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.inputStyle.borderWidth) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.inputStyle.borderWidth"
          data-type="px"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル（フォーム）"
        value={gameInput.inputStyle.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.input.inputStyle.borderStyle"
      />

      <FormField label="ボーダー色（フォーム）">
        <RgbaColorInput
          value={gameInput.inputStyle.borderColor}
          onChange={handleDatasetChange}
          data-path="game.input.inputStyle.borderColor"
        />
      </FormField>

      <FormField label="角丸（フォーム）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.inputStyle.borderRadius) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.inputStyle.borderRadius"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字サイズ（フォーム）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.inputStyle.fontSize) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.inputStyle.fontSize"
          data-type="px"
        />
      </FormField>

      <FormField label="文字色（フォーム）">
        <RgbaColorInput
          value={gameInput.inputStyle.color}
          onChange={handleDatasetChange}
          data-path="game.input.inputStyle.color"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色（ボタン）">
        <RgbaColorInput
          value={gameInput.buttonStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.input.buttonStyle.backgroundColor"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ボーダー太さ（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.buttonStyle.borderWidth) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.buttonStyle.borderWidth"
          data-type="px"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル（ボタン）"
        value={gameInput.buttonStyle.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.input.buttonStyle.borderStyle"
      />

      <FormField label="ボーダー色（ボタン）">
        <RgbaColorInput
          value={gameInput.buttonStyle.borderColor}
          onChange={handleDatasetChange}
          data-path="game.input.buttonStyle.borderColor"
        />
      </FormField>

      <FormField label="角丸（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.buttonStyle.borderRadius) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.buttonStyle.borderRadius"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字サイズ（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameInput.buttonStyle.fontSize) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.input.buttonStyle.fontSize"
          data-type="px"
        />
      </FormField>

      <FormField label="文字色（ボタン）">
        <RgbaColorInput
          value={gameInput.buttonStyle.color}
          onChange={handleDatasetChange}
          data-path="game.input.buttonStyle.color"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ホバー時の見た目（ボタン）">
        <HoverSelector
          value={gameInput.hover}
          onChange={handleDatasetChange}
          data-path="game.input.hover"
        />
      </FormField>
    </>
  )
}

export default memo(FormSettings);