import { memo } from "react"
import FormField from "../FormField"
import BorderStyleSelect from "../BorderStyleSelect"
import RgbaColorInput from "../RgbaColorInput"
import { StyledInput } from "../StyledInput"
import StyledCheckbox from "../StyledCheckBox";
import { inputPropsDefaultNum } from "./inputProps";
import SectionDivider from "../SectionDivider"
import { MenuItem, Select } from "@mui/material"

const ScreenSettings = ({
  game,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="画面横幅">
        <StyledInput
          type="number"
          value={game.screenSize[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.screenSize.0"
        />
      </FormField>

      <FormField label="画面縦幅">
        <StyledInput
          type="number"
          value={game.screenSize[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.screenSize.1"
        />
      </FormField>

      <SelectDirection
        label="アイテムボックス位置"
        value={game.itemBox.position}
        onChange={handleDatasetChange}
        data-path="game.itemBox.position"
      />

      <FormField label="アイテムボックス折り畳み">
        <StyledCheckbox
          checked={game.itemBox.foldable}
          onChange={handleDatasetChange}
          data-path="game.itemBox.foldable"
        />
      </FormField>

      <FormField label="アイテムボックス幅">
        <StyledInput
          type="number"
          value={game.itemBox.size}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.size"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色">
        <RgbaColorInput
          value={game.backStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.backStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像">
        <StyledInput
          type="text"
          value={game.backStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.backStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字色">
        <RgbaColorInput
          value={game.gameStyle.color}
          onChange={handleDatasetChange}
          data-path="game.gameStyle.color"
        />
      </FormField>

      <FormField label="ボーダー太さ">
        <StyledInput
          type="number"
          value={game.gameStyle.borderWidth}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.gameStyle.borderWidth"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル"
        value={game.gameStyle.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.gameStyle.borderStyle"
      />

      <FormField label="ボーダー色">
        <RgbaColorInput
          value={game.gameStyle.borderColor}
          onChange={handleDatasetChange}
          data-path="game.gameStyle.borderColor"
        />
      </FormField>

      <FormField label="影色">
        <RgbaColorInput
          value={game.gameStyle.shadowColor}
          onChange={handleDatasetChange}
          data-path="game.gameStyle.shadowColor"
        />
      </FormField>
      
    </>
  )
}

const SelectDirection = memo(({label, value, onChange, "data-path": dataPath}) => {
   const handleChange = (event) => {
    // datasetを作って handleDatasetChange に渡す
    const e = {
      target: {
        value: event.target.value,
        dataset: {
          path: dataPath
        }
      }
    };
    onChange?.(e);
  };

  return(
    <FormField label={label}>
      <Select
        value={value}
        onChange={handleChange}
      >
        <MenuItem value="top">top</MenuItem>
        <MenuItem value="bottom">bottom</MenuItem>
        <MenuItem value="left">left</MenuItem>
        <MenuItem value="right">right</MenuItem>
      </Select>
    </FormField>
  )
})

export default memo(ScreenSettings);