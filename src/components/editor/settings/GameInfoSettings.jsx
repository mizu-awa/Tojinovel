import FormField from "../FormField";
import MyAutoComplete from "../MyAutoComplete";
import { StyledInput } from "../StyledInput";

const GameInfoSettings = ({
  game,
  scenes,
  handleDatasetChange
}) => {
  return(
    <>
      <FormField label="ゲームタイトル">
        <StyledInput value={game.title} onChange={handleDatasetChange} data-path="game.title" />
      </FormField>

      <FormField label="開始シーン">
        <MyAutoComplete
          options={scenes.map(s => s.name)}
          value={game.startScene ?? ""}
          onChange={handleDatasetChange}
          data-path="game.startScene"
        />
      </FormField>
    </>
  )
}

export default GameInfoSettings;