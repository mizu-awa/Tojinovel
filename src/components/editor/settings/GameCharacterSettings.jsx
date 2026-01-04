import FormField from "../FormField"
import { StyledInput } from "../StyledInput"
import { inputPropsDefaultNum } from "./inputProps";

const GameCharacterSettings = (({
  gameCharacter,
  handleDatasetChange
}) => {
  return(
    <>
      <FormField label="表示数">
        <StyledInput
          type="number"
          value={gameCharacter.slots}
          onChange={handleDatasetChange}
          inputProps={inputPropsDefaultNum}
          data-path="game.character.slots"
        />
      </FormField>
    </>
  )
})

export default GameCharacterSettings;