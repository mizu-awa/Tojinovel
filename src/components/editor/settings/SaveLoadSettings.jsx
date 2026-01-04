import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import SectionDivider from "../SectionDivider";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import HoverSelector from "../HoverSelector";
import { inputPropsDefaultNum } from "./inputProps";
import StyledCheckbox from "../StyledCheckBox";

const SaveLoadSettings = ({
  gameSave,
  handleDatasetChange
}) => {

  return(
    <>
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

      <SectionDivider />

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

      <SectionDivider />

      <FormField label="背景色（背景）">
        <RgbaColorInput
          value={gameSave.backStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.save.backStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像（背景）">
        <StyledInput
          type="text"
          value={gameSave.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.save.backStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

      <FormField label="余白（ボタン）">
        <StyledInput
          type="number"
          value={gameSave.buttonStyle.padding}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.save.buttonStyle.padding"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色（ボタン）">
        <RgbaColorInput
          value={gameSave.buttonStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.save.buttonStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像（ボタン）">
        <StyledInput
          type="text"
          value={gameSave.buttonStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.save.buttonStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ボーダー太さ（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameSave.buttonStyle.borderWidth) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.save.buttonStyle.borderWidth"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル（ボタン）"
        value={gameSave.buttonStyle.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.save.buttonStyle.borderStyle"
      />

      <FormField label="ボーダー色（ボタン）">
        <RgbaColorInput
          value={gameSave.buttonStyle.borderColor}
          onChange={handleDatasetChange}
          data-path="game.save.buttonStyle.borderColor"
        />
      </FormField>

      <FormField label="角丸（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameSave.buttonStyle.borderRadius) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.save.buttonStyle.borderRadius"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字サイズ（ボタン）">
        <StyledInput
          type="number"
          value={parseInt(gameSave.buttonStyle.fontSize) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.save.buttonStyle.fontSize"
          data-type="px"
        />
      </FormField>

      <FormField label="文字色（ボタン）">
        <RgbaColorInput
          value={gameSave.buttonStyle.color}
          onChange={handleDatasetChange}
          data-path="game.save.buttonStyle.color"
        />
      </FormField>

       <SectionDivider />

      <FormField label="ホバー時の見た目">
          <HoverSelector
            value={gameSave.hover}
            onChange={handleDatasetChange}
            data-path="game.save.hover"
          />
        </FormField>
    </>
  )
}

export default SaveLoadSettings;