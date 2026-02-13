import { memo } from "react";
import FormField from "../FormField";
import HoverSelector from "../HoverSelector";
import RgbaColorInput from "../RgbaColorInput";
import { StyledInput } from "../StyledInput";
import StyledCheckbox from "../StyledCheckBox";
import MyAccordion from "../MyAccordion";
import { inputPropsDefaultNum } from "./inputProps";

const DirectionSettings = ({
  gameDirection,
  handleDatasetChange
}) => {
  return(
    <>
      <MyAccordion title="基本設定">
        <FormField label="デフォルト矢印を使用">
          <StyledCheckbox
            checked={gameDirection.useDefaultArrow}
            onChange={handleDatasetChange}
            data-path="game.direction.useDefaultArrow"
          />
        </FormField>

        <FormField label="大きさ">
          <StyledInput
            type="number"
            value={gameDirection.size}
            onChange={handleDatasetChange}
            inputProps={inputPropsDefaultNum}
            data-path="game.direction.size"
          />
        </FormField>

        <FormField label="ホバー時の見た目">
          <HoverSelector
            value={gameDirection.hover}
            onChange={handleDatasetChange}
            data-path="game.direction.hover"
          />
        </FormField>
      </MyAccordion>

      <MyAccordion title="スタイル">
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
      </MyAccordion>

      <MyAccordion title="カスタム画像">
        <FormField label="上方向の画像">
          <StyledInput
            type="text"
            value={gameDirection.images?.top || ""}
            onChange={handleDatasetChange}
            data-path="game.direction.images.top"
          />
        </FormField>

        <FormField label="右方向の画像">
          <StyledInput
            type="text"
            value={gameDirection.images?.right || ""}
            onChange={handleDatasetChange}
            data-path="game.direction.images.right"
          />
        </FormField>

        <FormField label="下方向の画像">
          <StyledInput
            type="text"
            value={gameDirection.images?.bottom || ""}
            onChange={handleDatasetChange}
            data-path="game.direction.images.bottom"
          />
        </FormField>

        <FormField label="左方向の画像">
          <StyledInput
            type="text"
            value={gameDirection.images?.left || ""}
            onChange={handleDatasetChange}
            data-path="game.direction.images.left"
          />
        </FormField>
      </MyAccordion>
    </>
  )
}

export default memo(DirectionSettings);