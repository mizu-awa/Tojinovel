import { memo } from "react";
import { inputPropsFontWeight, inputPropsDefaultNum } from "./inputProps";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import SectionDivider from "../SectionDivider";
import { MenuItem, Select } from "@mui/material";
import HoverSelector from "../HoverSelector";
import StyledCheckbox from "../StyledCheckBox";

const MenuSettings = ({
  gameMenu,
  handleDatasetChange
}) => {

  return(
    <>
      <PositionSelect
        label="位置"
        value={gameMenu.position}
        onChange={handleDatasetChange}
        data-path="game.menu.position"
      />

      <FormField label="間隔">
        <StyledInput
          type="number"
          value={parseInt(gameMenu.style.gap) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.menu.style.gap"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="セーブボタン表示">
        <StyledCheckbox
          checked={gameMenu.visibleSave}
          onChange={handleDatasetChange}
          data-path="game.menu.visibleSave"
        />
      </FormField>

      <FormField label="ロードボタン表示">
        <StyledCheckbox
          checked={gameMenu.visibleLoad}
          onChange={handleDatasetChange}
          data-path="game.menu.visibleLoad"
        />
      </FormField>

      <FormField label="コンフィグボタン表示">
        <StyledCheckbox
          checked={gameMenu.visibleConfig}
          onChange={handleDatasetChange}
          data-path="game.menu.visibleConfig"
        />
      </FormField>

      <SectionDivider />

      <FormField label="セーブテキスト">
        <StyledInput
          value={gameMenu.saveText}
          onChange={handleDatasetChange}
          data-path="game.menu.saveText"
        />
      </FormField>

      <FormField label="ロードテキスト">
        <StyledInput
          value={gameMenu.loadText}
          onChange={handleDatasetChange}
          data-path="game.menu.loadText"
        />
      </FormField>

      <FormField label="コンフィグテキスト">
        <StyledInput
          value={gameMenu.configText}
          onChange={handleDatasetChange}
          data-path="game.menu.configText"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字サイズ">
        <StyledInput
          type="number"
          value={parseInt(gameMenu.style.fontSize) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.menu.style.fontSize"
          data-type="px"
        />
      </FormField>

      <FormField label="文字太さ">
        <StyledInput
          type="number"
          value={parseInt(gameMenu.style.fontWeight) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsFontWeight}
          data-path="game.menu.style.fontWeight"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ホバー時の見た目">
        <HoverSelector
          value={gameMenu.hover}
          onChange={handleDatasetChange}
          data-path="game.menu.hover"
        />
      </FormField>
    </>
  )
}

const PositionSelect = memo(({value, onChange, "data-path": dataPath}) => {
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
    <FormField label="位置">
      <Select
        value={value}
        onChange={handleChange}
      >
        <MenuItem value="top left">top left</MenuItem>
        <MenuItem value="bottom left">bottom left</MenuItem>
        <MenuItem value="top right">top right</MenuItem>
        <MenuItem value="bottom right">bottom right</MenuItem>
        <MenuItem value="none">表示なし</MenuItem>
      </Select>
    </FormField>
  )
})

export default MenuSettings;