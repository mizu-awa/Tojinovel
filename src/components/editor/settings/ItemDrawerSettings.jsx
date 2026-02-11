import { memo } from "react";
import FormField from "../FormField"
import RgbaColorInput from "../RgbaColorInput"
import { StyledInput } from "../StyledInput"
import { inputPropsDefaultNum } from "./inputProps";

const ItemDrawerSettings = ({
  gameItemDrawer,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="横幅">
        <StyledInput
          type="number"
          value={gameItemDrawer.size[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemDrawer.size.0"
        />
      </FormField>

      <FormField label="縦幅">
        <StyledInput
          type="number"
          value={gameItemDrawer.size[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemDrawer.size.1"
        />
      </FormField>

      <FormField label="背景色">
        <RgbaColorInput
          value={gameItemDrawer.style.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.itemDrawer.style.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像">
        <StyledInput
          type="text"
          value={gameItemDrawer.style.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.itemDrawer.style.backgroundImage"
          data-type="url"
        />
      </FormField>

      <FormField label="角丸">
        <StyledInput
          type="number"
          value={parseInt(gameItemDrawer.style.borderRadius)|| 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.itemDrawer.style.borderRadius"
          data-type="px"
        />
      </FormField>

      <FormField label="背景色（後部）">
        <RgbaColorInput
          value={gameItemDrawer.backStyle.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.itemDrawer.backStyle.backgroundColor"
        />
      </FormField>

    </>
  )
}

export default memo(ItemDrawerSettings);