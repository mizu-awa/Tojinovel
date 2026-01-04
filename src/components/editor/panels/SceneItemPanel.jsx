import { memo, useCallback, useMemo } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SelectableListPanel from "../SelectableListPanel";
import { handleStyleVertical } from "../handleStyle";

const SceneItemPanel = memo(({
  mainTab,
  items,
  selectedItem,
  setSelectedItem,
  addScene,
  copyScene,
  deleteScene,
  addItem,
  copyItem,
  deleteItem,
  subItems,
  selectedSubItem,
  setSelectedSubItem,
  addHotspot,
  copyHotspot,
  deleteHotspot,
  addItemHotspot,
  copyItemHotspot,
  deleteItemHotspot,
  thirdItems,
  selectedThirdItem,
  setSelectedThirdItem,
  addState,
  copyState,
  deleteState,
  addItemState,
  copyItemState,
  deleteItemState,
  copy,
  paste
}) => {

  const onChangeHotspot = useCallback((value) => {
    setSelectedSubItem(value);
    setSelectedThirdItem(null);
  },[setSelectedSubItem, setSelectedThirdItem]);

  const onAdd = useMemo(() => mainTab === "scenes" ? addScene : addItem, [mainTab, addScene, addItem]);
  const onDuplicate = useMemo(() => mainTab === "scenes" ? copyScene : copyItem, [mainTab, copyScene, copyItem]);
  const onDelete = useMemo(() => mainTab === "scenes" ? deleteScene : deleteItem, [mainTab, deleteScene, deleteItem]);

  const onAddHotspot = useMemo(() => mainTab === "scenes" ? addHotspot : addItemHotspot, [mainTab, addHotspot, addItemHotspot]);
  const onDuplicateHotspot = useMemo(() => mainTab === "scenes" ? copyHotspot : copyItemHotspot, [mainTab, copyHotspot, copyItemHotspot]);
  const onDeleteHotspot = useMemo(() => mainTab === "scenes" ? deleteHotspot : deleteItemHotspot, [mainTab, deleteHotspot, deleteItemHotspot]);

  const onAddState = useMemo(() => mainTab === "scenes" ? addState : addItemState, [mainTab, addState, addItemState]);
  const onDuplicateState = useMemo(() => mainTab === "scenes" ? copyState : copyItemState, [mainTab, copyState, copyItemState]);
  const onDeleteState = useMemo(() => mainTab === "scenes" ? deleteState : deleteItemState, [mainTab, deleteState, deleteItemState]);

  const onCopy = useMemo(() => () => (mainTab === "scenes" ? copy("scene") : copy("item"), [mainTab, copy]));
  const onCopyHotspot = useMemo(() => () => (mainTab === "scenes" ? copy("sceneHotspot") : copy("itemHotspot"), [mainTab, copy]));
  const onCopyState = useMemo(() => () => (mainTab === "scenes" ? copy("sceneState") : copy("itemState"), [mainTab, copy]));
  const onPaste = useMemo(() => () => (mainTab === "scenes" ? paste("scene") : paste("item"), [mainTab, paste]));
  const onPasteHotspot = useMemo(() => () => (mainTab === "scenes" ? paste("sceneHotspot") : paste("itemHotspot"), [mainTab, paste]));
  const onPasteState = useMemo(() => () => (mainTab === "scenes" ? paste("sceneState") : paste("itemState"), [mainTab, paste]));

  return(
    <PanelGroup direction="vertical" style={{ flex: 1, minHeight: 0 }}>
      <Panel
        defaultSize={40}
        minSize={10}
      >
        <SelectableListPanel
          items={items}
          value={selectedItem}
          onChange={setSelectedItem}
          showActions={true}
          returnIndex={true}
          onAdd={onAdd}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onCopy={onCopy}
          onPaste={onPaste}
        />
      </Panel>

      <PanelResizeHandle style={handleStyleVertical} />

      <Panel
        defaultSize={30}
        minSize={10}
      >
        <SelectableListPanel
          items={subItems}
          value={selectedSubItem}
          onChange={onChangeHotspot}
          showActions={true}
          returnIndex={true}
          onAdd={onAddHotspot}
          onDuplicate={onDuplicateHotspot}
          onDelete={onDeleteHotspot}
          onCopy={onCopyHotspot}
          onPaste={onPasteHotspot}
        />
      </Panel>

      <PanelResizeHandle style={handleStyleVertical} />

      <Panel
        defaultSize={30}
        minSize={10}
      >
        <SelectableListPanel
          items={thirdItems}
          value={selectedThirdItem}
          onChange={setSelectedThirdItem}
          showActions={true}
          returnIndex={true}
          onAdd={onAddState}
          onDuplicate={onDuplicateState}
          onDelete={onDeleteState}
          onCopy={onCopyState}
          onPaste={onPasteState}
        />
      </Panel>
    </PanelGroup>
  )
})

export default SceneItemPanel;