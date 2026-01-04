import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import MyAutoComplete from "../MyAutoComplete";
import SectionDivider from "../SectionDivider";
import NameWarn from "../NameWarn";

const CharacterSettings = ({
  characters,
  characterList,
  index,
  subIndex,
  handleDatasetChange
}) => {
  if(!characters[index]) return null;

  const isChWarn = (characterList.filter(c => c === characters[index].name).length >= 2);
  const isExWarn = (characters[index].expressions?.filter(e => e.name === characters[index].expressions[subIndex]?.name).length >= 2);
  const characterPath = `characters.${index}`;
  const exPath = `${characterPath}.expressions.${subIndex}`;

  return(
    <>
      <FormField label="キャラクター名">
        <StyledInput
          value={characters[index]?.name}
          onChange={handleDatasetChange}
          data-path={`characters.${index}.name`}
        />
        <NameWarn visible={isChWarn} />
      </FormField>

      <FormField label="デフォルト表情">
        <MyAutoComplete
          options={characters[index]?.expressions.map(e => e.name)}
          value={characters[index]?.defaultExpression ?? ""}
          onChange={handleDatasetChange}
          data-path={`${characterPath}.defaultExpression`}
        />
      </FormField>

      {characters[index].expressions[subIndex] &&
        <>
          <SectionDivider />
          <FormField label="表情名">
            <StyledInput
              value={characters[index]?.expressions[subIndex]?.name}
              onChange={handleDatasetChange}
              data-path={`${exPath}.name`}
            />
            <NameWarn visible={isExWarn} />
          </FormField>

          <FormField label="画像">
            <StyledInput
              value={characters[index]?.expressions[subIndex]?.image?.replace(/^\.\/(.*)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path={`${exPath}.image`}
              data-type="path"
            />
          </FormField>
        </>
      }
      
    </>
  )

}

export default CharacterSettings;