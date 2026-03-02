import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import FilePathInput from "../FilePathInput";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import TextAlignSelector from "../TextAlignSelector";
import HoverSelector from "../HoverSelector";
import { inputPropsDefaultNum, } from "./inputProps";
import MyAccordion from "../MyAccordion";

const OptionSettings = ({
  gameOption,
  handleDatasetChange,
  fileList,
  ensureFileListLoaded
}) => {

  return(
    <>
      <MyAccordion title="位置・サイズ">
        <FormField label="位置（横軸）">
          <StyledInput
            type="number"
            value={gameOption.position[0]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.position.0"
          />
        </FormField>

        <FormField label="位置（縦軸）">
          <StyledInput
            type="number"
            value={gameOption.position[1]}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.position.1"
          />
        </FormField>

        <FormField label="幅">
          <StyledInput
            type="number"
            value={gameOption.size}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.size"
          />
        </FormField>

        <FormField label="間隔">
          <StyledInput
            type="number"
            value={gameOption.gap}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.gap"
          />
        </FormField>

        <FormField label="余白">
          <StyledInput
            type="number"
            value={gameOption.style.padding}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.style.padding"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="スタイル">
        <FormField label="背景色">
          <RgbaColorInput
            value={gameOption.style.backgroundColor}
            onChange={handleDatasetChange}
            data-path="game.option.style.backgroundColor"
          />
        </FormField>

        <FormField label="背景画像">
          <FilePathInput
            options={fileList}
            onFocus={ensureFileListLoaded}
            value={gameOption.style.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path="game.option.style.backgroundImage"
            data-type="url"
          />
        </FormField>

        <FormField label="ボーダー太さ">
          <StyledInput
            type="number"
            value={parseInt(gameOption.style.borderWidth) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.style.borderWidth"
            data-type="px"
          />
        </FormField>

        <BorderStyleSelect
          label="ボーダースタイル"
          value={gameOption.style.borderStyle}
          onChange={handleDatasetChange}
          data-path="game.option.style.borderStyle"
        />

        <FormField label="ボーダー色">
          <RgbaColorInput
            value={gameOption.style.borderColor}
            onChange={handleDatasetChange}
            data-path="game.option.style.borderColor"
          />
        </FormField>

        <FormField label="角丸">
          <StyledInput
            type="number"
            value={parseInt(gameOption.style.borderRadius) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.style.borderRadius"
            data-type="px"
          />
        </FormField>

        <FormField label="ホバー時の見た目">
          <HoverSelector
            value={gameOption.hover}
            onChange={handleDatasetChange}
            data-path="game.option.hover"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="文字設定">
        <FormField label="文字サイズ">
          <StyledInput
            type="number"
            value={parseInt(gameOption.style.fontSize) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.option.style.fontSize"
            data-type="px"
          />
        </FormField>

        <FormField label="行揃え">
          <TextAlignSelector
            value={gameOption.style.textAlign}
            onChange={handleDatasetChange}
            data-path="game.option.style.textAlign"
          />
        </FormField>

        <FormField label="文字色">
          <RgbaColorInput
            value={gameOption.style.color}
            onChange={handleDatasetChange}
            data-path="game.option.style.color"
          />
        </FormField>
      </MyAccordion>
    </>
  )
}

export default memo(OptionSettings);
