import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import RgbaColorInput from "../RgbaColorInput";
import BorderStyleSelect from "../BorderStyleSelect";
import { inputPropsDefaultNum } from "./inputProps";
import SectionDivider from "../SectionDivider";

const EventImageSettings = ({
  gameImage,
  handleDatasetChange
}) => {

  return(
    <>
      <FormField label="位置（横軸）">
        <StyledInput
          type="number"
          value={gameImage.position[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.image.position.0"
        />
      </FormField>

      <FormField label="位置（縦軸）">
        <StyledInput
          type="number"
          value={gameImage.position[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.image.position.1"
        />
      </FormField>

      <FormField label="幅">
        <StyledInput
          type="number"
          value={gameImage.size[0]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.image.size.0"
        />
      </FormField>

      <FormField label="高さ">
        <StyledInput
          type="number"
          value={gameImage.size[1]}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.image.size.1"
        />
      </FormField>

      <SectionDivider />

    {/*
      <FormField label="背景色">
        <RgbaColorInput
          value={gameImage.style.backgroundColor}
          onChange={handleDatasetChange}
          data-path="game.image.style.backgroundColor"
        />
      </FormField>

      <FormField label="背景画像">
        <StyledInput
          type="text"
          value={gameImage.style.backgroundImage?.replace(/^url\(\.\/(.*)\)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path="game.image.style.backgroundImage"
          data-type="url"
        />
      </FormField>
    */}

      <FormField label="ボーダー太さ">
        <StyledInput
          type="number"
          value={parseInt(gameImage.style.borderWidth) || 0}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.image.style.borderWidth"
          data-type="px"
        />
      </FormField>

      <BorderStyleSelect
        label="ボーダースタイル"
        value={gameImage.style.borderStyle}
        onChange={handleDatasetChange}
        data-path="game.image.style.borderStyle"
      />

      <FormField label="ボーダー色">
        <RgbaColorInput
          value={gameImage.style.borderColor}
          onChange={handleDatasetChange}
          data-path="game.image.style.borderColor"
        />
      </FormField>
    </>
  )
}

export default EventImageSettings;