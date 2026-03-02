import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import FilePathInput from "../FilePathInput";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import { inputPropsDefaultNum } from "./inputProps";
import HoverSelector from "../HoverSelector";
import MyAccordion from "../MyAccordion";

const FormSettings = ({
  gameInput,
  handleDatasetChange,
  fileList,
  ensureFileListLoaded
}) => {

  return(
    <>
      <MyAccordion title="コンテナ">
        <MyAccordion title="位置・サイズ" defaultOpen={false}>
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
        </MyAccordion>

        <MyAccordion title="背景" defaultOpen={false}>
          <FormField label="背景色">
            <RgbaColorInput
              value={gameInput.backStyle.backgroundColor}
              onChange={handleDatasetChange}
              data-path="game.input.backStyle.backgroundColor"
            />
          </FormField>

          <FormField label="背景画像">
            <FilePathInput
              options={fileList}
              onFocus={ensureFileListLoaded}
              value={gameInput.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path="game.input.backStyle.backgroundImage"
              data-type="url"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="ボーダー" defaultOpen={false}>
          <FormField label="ボーダー太さ">
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
            label="ボーダースタイル"
            value={gameInput.backStyle.borderStyle}
            onChange={handleDatasetChange}
            data-path="game.input.backStyle.borderStyle"
          />

          <FormField label="ボーダー色">
            <RgbaColorInput
              value={gameInput.backStyle.borderColor}
              onChange={handleDatasetChange}
              data-path="game.input.backStyle.borderColor"
            />
          </FormField>

          <FormField label="角丸">
            <StyledInput
              type="number"
              value={parseInt(gameInput.backStyle.borderRadius) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.input.backStyle.borderRadius"
              data-type="px"
            />
          </FormField>
        </MyAccordion>
      </MyAccordion>

      <MyAccordion title="フォーム">
        <FormField label="背景色">
          <RgbaColorInput
            value={gameInput.inputStyle.backgroundColor}
            onChange={handleDatasetChange}
            data-path="game.input.inputStyle.backgroundColor"
          />
        </FormField>

        <FormField label="ボーダー太さ">
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
          label="ボーダースタイル"
          value={gameInput.inputStyle.borderStyle}
          onChange={handleDatasetChange}
          data-path="game.input.inputStyle.borderStyle"
        />

        <FormField label="ボーダー色">
          <RgbaColorInput
            value={gameInput.inputStyle.borderColor}
            onChange={handleDatasetChange}
            data-path="game.input.inputStyle.borderColor"
          />
        </FormField>

        <FormField label="角丸">
          <StyledInput
            type="number"
            value={parseInt(gameInput.inputStyle.borderRadius) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.input.inputStyle.borderRadius"
            data-type="px"
          />
        </FormField>

        <FormField label="文字サイズ">
          <StyledInput
            type="number"
            value={parseInt(gameInput.inputStyle.fontSize) || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.input.inputStyle.fontSize"
            data-type="px"
          />
        </FormField>

        <FormField label="文字色">
          <RgbaColorInput
            value={gameInput.inputStyle.color}
            onChange={handleDatasetChange}
            data-path="game.input.inputStyle.color"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="ボタン">
        <MyAccordion title="スタイル" defaultOpen={false}>
          <FormField label="背景色">
            <RgbaColorInput
              value={gameInput.buttonStyle.backgroundColor}
              onChange={handleDatasetChange}
              data-path="game.input.buttonStyle.backgroundColor"
            />
          </FormField>

          <FormField label="ボーダー太さ">
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
            label="ボーダースタイル"
            value={gameInput.buttonStyle.borderStyle}
            onChange={handleDatasetChange}
            data-path="game.input.buttonStyle.borderStyle"
          />

          <FormField label="ボーダー色">
            <RgbaColorInput
              value={gameInput.buttonStyle.borderColor}
              onChange={handleDatasetChange}
              data-path="game.input.buttonStyle.borderColor"
            />
          </FormField>

          <FormField label="角丸">
            <StyledInput
              type="number"
              value={parseInt(gameInput.buttonStyle.borderRadius) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.input.buttonStyle.borderRadius"
              data-type="px"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="文字" defaultOpen={false}>
          <FormField label="文字サイズ">
            <StyledInput
              type="number"
              value={parseInt(gameInput.buttonStyle.fontSize) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.input.buttonStyle.fontSize"
              data-type="px"
            />
          </FormField>

          <FormField label="文字色">
            <RgbaColorInput
              value={gameInput.buttonStyle.color}
              onChange={handleDatasetChange}
              data-path="game.input.buttonStyle.color"
            />
          </FormField>

          <FormField label="ホバー時の見た目">
            <HoverSelector
              value={gameInput.hover}
              onChange={handleDatasetChange}
              data-path="game.input.hover"
            />
          </FormField>
        </MyAccordion>
      </MyAccordion>
    </>
  )
}

export default memo(FormSettings);
