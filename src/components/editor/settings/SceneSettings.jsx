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
import MyAccordion from "../MyAccordion";
import StyledCheckbox from "../StyledCheckBox";
import { Box, IconButton } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { inputPropsFontWeight, inputPropsDefaultNum, inputPropsZIndex } from "./inputProps";
import NameWarn from "../NameWarn";

const SceneSettings = ({
  scene,
  selectedItem,
  selectedSubItem,
  selectedThirdItem,
  sceneList,
  itemList,
  variableList,
  addUsedItem,
  deleteUsedItem,
  hotspot,
  state,
  states,
  handleDatasetChange,
  loadEventFile
}) => {
  // 固定値（フックはearly returnの前に配置）
  const sceneListFix = useMemo(() => sceneList || [], [sceneList?.join("") || ""]);
  const stateListFix = useMemo(() => states || [], [states?.join("") || ""]);
  const itemListFix = useMemo(() => itemList || [], [itemList?.join("") || ""]);

  const variableListFix = useMemo(() => variableList || [], [variableList?.join("") || ""]);

  const isScWarn = useMemo(() => (scene && sceneListFix.filter(s => s === scene.name).length >= 2), [sceneListFix, scene?.name]);
  const isStWarn = useMemo(() => (stateListFix?.filter(s => s === state?.name).length >= 2), [stateListFix, state?.name]);

  if(scene == null || scene === undefined) return null;

  const isHsWarn = scene.hotspots?.filter(h => h.name === hotspot?.name).length >= 2;

  const scenePath = `scenes.${selectedItem}`;
  const hotspotPath = `${scenePath}.hotspots.${selectedSubItem}`;
  const statePath = `${hotspotPath}.states.${selectedThirdItem}`;

  return(
    <>
    <MyAccordion title="シーン設定">
      <FormField label="シーン名">
        <StyledInput
          value={scene.name}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.name`}
        />
        <NameWarn visible={isScWarn} />
      </FormField>

      <FormField label="背景画像">
        <StyledInput
          value={scene.background?.replace(/^\.\/(.*)$/, "$1") || ""}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.background`}
          data-type="path"
        />
      </FormField>

      <SectionDivider />

      <FormField label="シーン訪問イベント ファイル名">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
          <StyledInput
            value={scene.visitEvent.file?.replace(/^\.\/(.*)$/, "$1") || ""}
            onChange={handleDatasetChange}
            data-path={`${scenePath}.visitEvent.file`}
            data-type="path"
          />
          <IconButton
            size="small"
            onClick={() => loadEventFile(scene.visitEvent.file, scene.visitEvent.label)}
            disabled={!scene.visitEvent.file}
            title="シナリオエディタで開く"
            sx={{ p: 0.25 }}
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </FormField>

      <FormField label="シーン訪問イベント ラベル名">
        <StyledInput
          value={scene.visitEvent.label}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.visitEvent.label`}
        />
      </FormField>

      <SectionDivider />

      <FormField label="遷移先（上）">
        <MyAutoComplete
          options={sceneListFix}
          value={scene.directions.top.target}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.directions.top.target`}
        />
      </FormField>

      <FormField label="遷移先（右）">
        <MyAutoComplete
          options={sceneListFix}
          value={scene.directions.right.target}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.directions.right.target`}
        />
      </FormField>

      <FormField label="遷移先（下）">
        <MyAutoComplete
          options={sceneListFix}
          value={scene.directions.bottom.target}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.directions.bottom.target`}
        />
      </FormField>

      <FormField label="遷移先（左）">
        <MyAutoComplete
          options={sceneListFix}
          value={scene.directions.left.target}
          onChange={handleDatasetChange}
          data-path={`${scenePath}.directions.left.target`}
        />
      </FormField>

      </MyAccordion>

      {hotspot &&
      <MyAccordion title="ホットスポット設定">
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

        <FormField label="X座標">
          <StyledInput
            type="number"
            value={state.x}
            onChange={handleDatasetChange}
            data-path={`${statePath}.x`}
          />
        </FormField>

        <FormField label="Y座標">
          <StyledInput
            type="number"
            value={state.y}
            onChange={handleDatasetChange}
            data-path={`${statePath}.y`}
          />
        </FormField>

        <FormField label="幅">
          <StyledInput
            type="number"
            value={state.width}
            onChange={handleDatasetChange}
            data-path={`${statePath}.width`}
          />
        </FormField>

        <FormField label="高さ">
          <StyledInput
            type="number"
            value={state.height}
            onChange={handleDatasetChange}
            data-path={`${statePath}.height`}
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
            inputProps={inputPropsZIndex}
            data-path={`${statePath}.zIndex`}
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

        <FormField label="入力モード">
          <StyledCheckbox
            checked={state.inputMode}
            onChange={handleDatasetChange}
            data-path={`${statePath}.inputMode`}
            data-type="checkbox"
          />
        </FormField>

        {state.inputMode && (
          <FormField label="バインド変数">
            <MyAutoComplete
              options={variableListFix}
              value={state.inputVariable}
              onChange={handleDatasetChange}
              data-path={`${statePath}.inputVariable`}
            />
          </FormField>
        )}

        <FormField label="ドラッグ可能">
          <StyledCheckbox
            checked={state.draggable}
            onChange={handleDatasetChange}
            data-path={`${statePath}.draggable`}
            data-type="checkbox"
          />
        </FormField>

        {state.draggable && (
          <>
            <FormField label="ドラッグ完了イベント ファイル">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
                <StyledInput
                  value={state.onDragEnd?.file?.replace(/^\.\/(.*)$/, "$1") || ""}
                  onChange={handleDatasetChange}
                  data-path={`${statePath}.onDragEnd.file`}
                  data-type="path"
                />
                <IconButton
                  size="small"
                  onClick={() => loadEventFile(state.onDragEnd?.file, state.onDragEnd?.label)}
                  disabled={!state.onDragEnd?.file}
                  title="シナリオエディタで開く"
                  sx={{ p: 0.25 }}
                >
                  <Edit sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </FormField>

            <FormField label="ドラッグ完了イベント ラベル">
              <StyledInput
                value={state.onDragEnd?.label || ""}
                onChange={handleDatasetChange}
                data-path={`${statePath}.onDragEnd.label`}
              />
            </FormField>
          </>
        )}

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
            inputProps={inputPropsDefaultNum}
            data-path={`${statePath}.style.fontSize`}
            data-type="px"
          />
        </FormField>

        <FormField label="文字太さ">
          <StyledInput
            type="number"
            value={state.style.fontWeight || 0}
            onChange={handleDatasetChange}
            inputProps={inputPropsFontWeight}
            data-path={`${statePath}.style.fontWeight`}
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
            inputProps={inputPropsDefaultNum}
            data-path={`${statePath}.style.textPadding`}
            data-type="px"
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
            inputProps={inputPropsDefaultNum}
            data-path={`${statePath}.style.borderWidth`}
            data-type="px"
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
            inputProps={inputPropsDefaultNum}
            data-path={`${statePath}.style.borderRadius`}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
            <StyledInput
              value={state.onClick.file?.replace(/^\.\/(.*)$/, "$1") || ""}
              onChange={handleDatasetChange}
              data-path={`${statePath}.onClick.file`}
              data-type="path"
            />
            <IconButton
              size="small"
              onClick={() => loadEventFile(state.onClick.file, state.onClick.label)}
              disabled={!state.onClick.file}
              title="シナリオエディタで開く"
              sx={{ p: 0.25 }}
            >
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
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
          handleDatasetChange={handleDatasetChange}
          selectedItem = {selectedItem}
          selectedSubItem = {selectedSubItem}
          selectedThirdItem = {selectedThirdItem}
          deleteUsedItem = {deleteUsedItem}
          statePath={statePath}
          loadEventFile={loadEventFile}
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
  statePath,
  loadEventFile
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
            index
          />

          <FormField label="アイテム使用イベント ファイル">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
              <StyledInput
                value={u.file?.replace(/^\.\/(.*)$/, "$1") || ""}
                onChange={handleDatasetChange}
                data-path={`${indexPath}.file`}
                data-type="path"
              />
              <IconButton
                size="small"
                onClick={() => loadEventFile(u.file, u.label)}
                disabled={!u.file}
                title="シナリオエディタで開く"
                sx={{ p: 0.25 }}
              >
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
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

export default memo(SceneSettings);