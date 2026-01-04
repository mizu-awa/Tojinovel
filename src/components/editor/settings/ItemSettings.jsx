import { memo, useMemo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import SectionDivider from "../SectionDivider";
import RgbaColorInput from "../RgbaColorInput";
import TextAlignSelector from "../TextAlignSelector";
import TextVerticalAlignSelector from "../TextVerticalAlignSelector";
import BorderStyleSelect from "../BorderStyleSelect";
import HoverSelector from "../HoverSelector";
import MyAutoComplete from "../MyAutoComplete";
import StyledCheckbox from "../StyledCheckBox";
import MyAccordion from "../MyAccordion";
import { Box, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { inputPropsFontWeight, inputPropsDefaultNum, inputPropsZIndex } from "./inputProps";
import NameWarn from "../NameWarn";

const ItemSettings = ({
  item,
  selectedItem,
  selectedSubItem,
  selectedThirdItem,
  itemList,
  addUsedItem,
  deleteUsedItem,
  hotspot,
  state,
  states,
  handleDatasetChange
}) => {
  if(!item) return null

  // 固定値
  const stateListFix = useMemo(() => states, [states?.join("") || ""]);
  const itemListFix = useMemo(() => itemList, [itemList?.join("") || ""]);

  const isItWarn = useMemo(() => (itemListFix.filter(s => s === item.name).length >= 2), [itemListFix, item.name]);
  const isHsWarn = item.hotspots.filter(h => h.name === hotspot?.name).length >= 2;
  const isStWarn = useMemo(() => (stateListFix?.filter(s => s === state?.name).length >= 2), [stateListFix, state?.name]);

  const itemPath = `items.${selectedItem}`;
  const hotspotPath = `${itemPath}.hotspots.${selectedSubItem}`;
  const statePath = `${hotspotPath}.states.${selectedThirdItem}`;

  return(
    <>
    <MyAccordion title="アイテム設定">
      <FormField label="アイテム名">
        <StyledInput
          value={item.name}
          onChange={handleDatasetChange}
          data-path={`${itemPath}.name`}
        />
        <NameWarn visible={isItWarn} />
      </FormField>

      <FormField label="画像">
        <StyledInput
          value={item.image?.replace(/^\.\/(.*)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path={`${itemPath}.image`}
          data-type="path"
        />
      </FormField>

      <FormField label="初期状態で所持">
          <StyledCheckbox
            checked={item.have}
            onChange={handleDatasetChange}
            data-path={`${itemPath}.have`}
            data-type="checkbox"
          />
        </FormField>
    </MyAccordion>

      {hotspot &&
      <MyAccordion title="ホットスポット設定">
        <SectionDivider />
        <FormField label="ホットスポット名">
          <StyledInput
            value={hotspot.name}
            onChange={handleDatasetChange}
            data-path={`${hotspotPath}.name`}
          />
          <NameWarn visible={isHsWarn} />
        </FormField>

        <FormField label="初期ステート">
          <MyAutoComplete
            options={stateListFix}
            value={hotspot.state}
            onChange={handleDatasetChange}
            data-path={`${hotspotPath}.state`}
          />
        </FormField>

      </MyAccordion>}

      {state &&
      <MyAccordion title="ステート設定">
        <SectionDivider />
        <FormField label="ステート名">
          <StyledInput
            value={state.name}
            onChange={handleDatasetChange}
            data-path={`${statePath}.name`}
          />
          <NameWarn visible={isStWarn} />
        </FormField>

        <SectionDivider />

        <FormField label="表示/非表示">
          <StyledCheckbox
            checked={state.visibility}
            onChange={handleDatasetChange}
            data-path={`${statePath}.visibility`}
            data-type="checkbox"
          />
        </FormField>

        <FormField label="始点（x）">
          <StyledInput
            type="number"
            value={state.area[0]}
            onChange={handleDatasetChange}
            data-path={`${statePath}.area.0`}
          />
        </FormField>

        <FormField label="始点（y）">
          <StyledInput
            type="number"
            value={state.area[1]}
            onChange={handleDatasetChange}
            data-path={`${statePath}.area.1`}
          />
        </FormField>

        <FormField label="終点（x）">
          <StyledInput
            type="number"
            value={state.area[2]}
            onChange={handleDatasetChange}
            data-path={`${statePath}.area.2`}
          />
        </FormField>

        <FormField label="終点（y）">
          <StyledInput
            type="number"
            value={state.area[3]}
            onChange={handleDatasetChange}
            data-path={`${statePath}.area.3`}
          />
        </FormField>

        <FormField label="回転">
          <StyledInput
            type="number"
            value={state.style.rotate}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.rotate`}
          />
        </FormField>

        <FormField label="重なり順">
          <StyledInput
            type="number"
            value={state.zIndex}
            onChange={handleDatasetChange}
            data-path={`${statePath}.zIndex`}
            inputProps={inputPropsZIndex}
          />
        </FormField>

        <SectionDivider />

        <FormField label="画像">
          <StyledInput
            value={state.background?.replace(/^\.\/(.*)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path={`${statePath}.background`}
            data-type="path"
          />
        </FormField>

        <FormField label="背景色">
          <RgbaColorInput
            value={state.style.backgroundColor}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.backgroundColor`}
          />
        </FormField>

        <SectionDivider />

        <FormField label="テキスト">
          <StyledInput
            value={state.text}
            onChange={handleDatasetChange}
            data-path={`${statePath}.text`}
          />
        </FormField>

        <FormField label="文字サイズ">
          <StyledInput
            type="number"
            value={parseInt(state.style.fontSize) || 0}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.fontSize`}
            data-type="px"
            inputProps={inputPropsDefaultNum}
          />
        </FormField>

        <FormField label="文字太さ">
          <StyledInput
            type="number"
            value={state.style.fontWeight || 0}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.fontWeight`}
            inputProps={inputPropsFontWeight}
          />
        </FormField>

        <FormField label="文字色">
          <RgbaColorInput
            value={state.style.color}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.color`}
          />
        </FormField>

        <FormField label="行揃え">
          <TextAlignSelector
            value={state.style.textAlign}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.textAlign`}
          />
        </FormField>

        <FormField label="テキスト上下位置">
          <TextVerticalAlignSelector
            value={state.style.textVAlign}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.textVAlign`}
          />
        </FormField>

        <FormField label="余白">
          <StyledInput
            type="number"
            value={parseInt(state.style.textPadding) || 0}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.textPadding`}
            data-type="px"
            inputProps={inputPropsDefaultNum}
          />
        </FormField>

        <SectionDivider />

        <BorderStyleSelect
          label="ボーダースタイル"
          value={state.style.borderStyle}
          onChange={handleDatasetChange}
            data-path={`${statePath}.style.borderStyle`}
        />

        <FormField label="ボーダー太さ">
          <StyledInput
            type="number"
            value={parseInt(state.style.borderWidth) || 0}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.borderWidth`}
            data-type="px"
            inputProps={inputPropsDefaultNum}
          />
        </FormField>

        <FormField label="ボーダー色">
          <RgbaColorInput
            value={state.style.borderColor}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.borderColor`}
          />
        </FormField>

        <FormField label="角丸">
          <StyledInput
            type="number"
            value={state.style.borderRadius || 0}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.borderRadius`}
            inputProps={inputPropsDefaultNum}
          />
        </FormField>

        <SectionDivider />

        <FormField label="影色">
          <RgbaColorInput
            value={state.style.shadowColor}
            onChange={handleDatasetChange}
            data-path={`${statePath}.style.shadowColor`}
          />
        </FormField>

        <FormField label="ホバー時の見た目">
          <HoverSelector
            value={state.hover}
            onChange={handleDatasetChange}
            data-path={`${statePath}.hover`}
          />
        </FormField>

        <SectionDivider />

        <FormField label="クリックイベント ファイル">
          <StyledInput
            value={state.onClick.file?.replace(/^\.\/(.*)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path={`${statePath}.onClick.file`}
            data-type="path"
          />
        </FormField>

        <FormField label="クリックイベント ラベル">
          <StyledInput
            value={state.onClick.label}
            onChange={handleDatasetChange}
            data-path={`${statePath}.onClick.label`}
          />
        </FormField>

        <UsedItemFormSet
          usedItems = {state.usedItems}
          itemList = {itemListFix}
          handleDatasetChange= {handleDatasetChange}
          deleteUsedItem = {deleteUsedItem}
          statePath={statePath}
        />
        
        <Box sx={{textAlign: "right"}}>
          <IconButton
            size="small"
            onClick={addUsedItem}
          >
            <Add />
          </IconButton>
        </Box>
      </MyAccordion>}
    </>
  )
}

const UsedItemFormSet = memo(({
  usedItems,
  itemList,
  handleDatasetChange,
  deleteUsedItem,
  statePath
}) => {
  return(
    usedItems.map((u, index) => {
      const indexPath = `${statePath}.usedItems.${index}`;

      return(
        <Box key={index}>
          <SectionDivider />

          <UsedItemForm
            itemList={itemList}
            item={u.item}
            handleDatasetChange={handleDatasetChange}
            indexPath={indexPath}
          />

          <FormField label="アイテム使用イベント ファイル">
            <StyledInput
              value={u.file?.replace(/^\.\/(.*)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path={`${indexPath}.file`}
              data-type="path"
            />
          </FormField>

          <FormField label="アイテム使用イベント ラベル">
            <StyledInput
              value={u.label}
              onChange={handleDatasetChange}
              data-path={`${indexPath}.label`}
            />
          </FormField>
          <Box sx={{textAlign: "right"}}>
            <IconButton
              size="small"
              onClick={() => {deleteUsedItem(index)}}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      )
    })
  )
})

const UsedItemForm = memo(({
  itemList,
  item,
  handleDatasetChange,
  indexPath
}) => {
  return (
    <FormField label="対象アイテム">
      <MyAutoComplete
        options={itemList}
        value={item ?? ""}
        onChange={handleDatasetChange}
        data-path={`${indexPath}.item`}
      />
    </FormField>
  )
})

export default ItemSettings;