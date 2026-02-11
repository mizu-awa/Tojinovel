import { memo } from "react";
import FormField from "../FormField";
import HoverSelector from "../HoverSelector";
import RgbaColorInput from "../RgbaColorInput";
import { StyledInput } from "../StyledInput";
import { inputPropsDefaultNum } from "./inputProps";

const DirectionSettings = ({
  gameDirection,
  handleDatasetChange
}) => {
  return(
    <>
      <FormField label="大きさ">
        <StyledInput
          type="number"
          value={gameDirection.size}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.direction.size"
        />
      </FormField>

      <FormField label="背景色">
        <RgbaColorInput
          value={gameDirection.style.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.direction.style.backgroundColor"
        />
      </FormField>

      <FormField label="矢印色">
        <RgbaColorInput
          value={gameDirection.style.color}
          onChange={handleDatasetChange}
          data-path="game.direction.style.color"
        />
      </FormField>

      <FormField label="ホバー時の見た目">
        <HoverSelector
          value={gameDirection.hover}
          onChange={handleDatasetChange}
          data-path="game.direction.hover"
        />
      </FormField>
    </>
  )
}

export default memo(DirectionSettings);