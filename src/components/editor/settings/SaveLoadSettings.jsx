import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import HoverSelector from "../HoverSelector";
import { inputPropsDefaultNum } from "./inputProps";
import StyledCheckbox from "../StyledCheckBox";
import MyAccordion from "../MyAccordion";

const SaveLoadSettings = ({
  gameSave,
  handleDatasetChange
}) => {

  return(
    <>
      <MyAccordion title="基本設定">
        <FormField label="スロット数（オートセーブ以外）">
          <StyledInput
            type="number"
            value={gameSave.slots}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.save.slots"
          />
        </FormField>

        <FormField label="オートセーブあり">
          <StyledCheckbox
            checked={gameSave.auto}
            onChange={handleDatasetChange}
            data-path="game.save.auto"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="テキスト設定">
        <FormField label="データテキスト">
          <StyledInput
            value={gameSave.dataText}
            onChange={handleDatasetChange}
            data-path="game.save.dataText"
          />
        </FormField>

        <FormField label="ノーデータテキスト">
          <StyledInput
            value={gameSave.noDataText}
            onChange={handleDatasetChange}
            data-path="game.save.noDataText"
          />
        </FormField>

        <FormField label="セーブテキスト">
          <StyledInput
            value={gameSave.saveText}
            onChange={handleDatasetChange}
            data-path="game.save.saveText"
          />
        </FormField>

        <FormField label="ロードテキスト">
          <StyledInput
            value={gameSave.loadText}
            onChange={handleDatasetChange}
            data-path="game.save.loadText"
          />
        </FormField>

        <FormField label="自動セーブテキスト">
          <StyledInput
            value={gameSave.autoText}
            onChange={handleDatasetChange}
            data-path="game.save.autoText"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="背景">
        <FormField label="背景色">
          <RgbaColorInput
            value={gameSave.backStyle.backgroundColor}
            onChange={handleDatasetChange}
            data-path="game.save.backStyle.backgroundColor"
          />
        </FormField>

        <FormField label="背景画像">
          <StyledInput
            type="text"
            value={gameSave.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path="game.save.backStyle.backgroundImage"
            data-type="url"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="ボタンスタイル">
        <MyAccordion title="背景" defaultOpen={false}>
          <FormField label="余白">
            <StyledInput
              type="number"
              value={gameSave.buttonStyle.padding}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.save.buttonStyle.padding"
            />
          </FormField>

          <FormField label="背景色">
            <RgbaColorInput
              value={gameSave.buttonStyle.backgroundColor}
              onChange={handleDatasetChange}
              data-path="game.save.buttonStyle.backgroundColor"
            />
          </FormField>

          <FormField label="背景画像">
            <StyledInput
              type="text"
              value={gameSave.buttonStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path="game.save.buttonStyle.backgroundImage"
              data-type="url"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="ボーダー" defaultOpen={false}>
          <FormField label="ボーダー太さ">
            <StyledInput
              type="number"
              value={parseInt(gameSave.buttonStyle.borderWidth) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.save.buttonStyle.borderWidth"
            />
          </FormField>

          <BorderStyleSelect
            label="ボーダースタイル"
            value={gameSave.buttonStyle.borderStyle}
            onChange={handleDatasetChange}
            data-path="game.save.buttonStyle.borderStyle"
          />

          <FormField label="ボーダー色">
            <RgbaColorInput
              value={gameSave.buttonStyle.borderColor}
              onChange={handleDatasetChange}
              data-path="game.save.buttonStyle.borderColor"
            />
          </FormField>

          <FormField label="角丸">
            <StyledInput
              type="number"
              value={parseInt(gameSave.buttonStyle.borderRadius) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.save.buttonStyle.borderRadius"
              data-type="px"
            />
          </FormField>
        </MyAccordion>

        <MyAccordion title="文字" defaultOpen={false}>
          <FormField label="文字サイズ">
            <StyledInput
              type="number"
              value={parseInt(gameSave.buttonStyle.fontSize) || 0}
              onChange={handleDatasetChange}
              inputProps={inputPropsDefaultNum}
              data-path="game.save.buttonStyle.fontSize"
              data-type="px"
            />
          </FormField>

          <FormField label="文字色">
            <RgbaColorInput
              value={gameSave.buttonStyle.color}
              onChange={handleDatasetChange}
              data-path="game.save.buttonStyle.color"
            />
          </FormField>

          <FormField label="ホバー時の見た目">
            <HoverSelector
              value={gameSave.hover}
              onChange={handleDatasetChange}
              data-path="game.save.hover"
            />
          </FormField>
        </MyAccordion>
      </MyAccordion>
    </>
  )
}

export default memo(SaveLoadSettings);
