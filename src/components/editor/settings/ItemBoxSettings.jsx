import { memo } from "react";
import FormField from "../FormField"
import BorderStyleSelect from "../BorderStyleSelect"
import RgbaColorInput from "../RgbaColorInput"
import { StyledInput } from "../StyledInput"
import { inputPropsDefaultNum } from "./inputProps";
import SectionDivider from "../SectionDivider"
import HoverSelector from "../HoverSelector"

const ItemBoxSettings = ({
  gameItemBox,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="列数">
        <StyledInput
          type="number"
          value={gameItemBox.columnCount}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.columnCount"
        />
      </FormField>

      <FormField label="間隔">
        <StyledInput
          type="number"
          value={gameItemBox.space}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.space"
        />
      </FormField>

      <FormField label="ページ送り幅">
        <StyledInput
          type="number"
          value={gameItemBox.paginationSize}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.paginationSize"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色（全体）">
        <RgbaColorInput
          value={gameItemBox.boxStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.itemBox.boxStyle.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像（全体）">
        <StyledInput
          type="text"
          value={gameItemBox.boxStyle.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.itemBox.boxStyle.backgroundImage"
          data-type="url"
        />
      </FormField>

      <SectionDivider />

      <FormField label="文字色">
        <RgbaColorInput
          value={gameItemBox.boxStyle.color}
          onChange={handleDatasetChange}
          data-path="game.itemBox.boxStyle.color"
        />
      </FormField>

      <SectionDivider />

      <FormField label="背景色">
        <RgbaColorInput
          value={gameItemBox.itemStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.itemBox.itemStyle.backgroundColor"
        />
      </FormField>

      <FormField label="角丸">
        <StyledInput
          type="number"
          value={parseInt(gameItemBox.itemStyle.borderRadius)|| 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.itemStyle.borderRadius"
          data-type="px"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ホバー時の見た目">
        <HoverSelector
          value={gameItemBox.hover}
          onChange={handleDatasetChange}
          data-path="game.itemBox.hover"
        />
      </FormField>

      <SectionDivider />

      <FormField label="ボーダー太さ（選択中）">
        <StyledInput
          type="number"
          value={parseInt(gameItemBox.selectedItemBorder.width)|| 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemBox.selectedItemBorder.width"
          data-type="px"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル（選択中）"
        value={gameItemBox.selectedItemBorder.style}
        onChange={handleDatasetChange}
        data-path="game.itemBox.selectedItemBorder.style"
      />

      <FormField label="ボーダー色（選択中）">
        <RgbaColorInput
          value={gameItemBox.selectedItemBorder.color}
          onChange={handleDatasetChange}
          data-path="game.itemBox.selectedItemBorder.color"
        />
      </FormField>
    </>
  )
}

export default memo(ItemBoxSettings);