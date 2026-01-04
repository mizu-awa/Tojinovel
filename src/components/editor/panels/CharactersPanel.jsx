import { memo, useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SelectableListPanel from "../SelectableListPanel";
import { handleStyleVertical } from "../handleStyle";

const CharactersPanel = memo(({
  items,
  selectedItem,
  setSelectedItem,
  addCharacter,
  duplicateCharacter,
  deleteCharacter,
  subItems,
  selectedSubItem,
  setSelectedSubItem,
  addExpression,
  duplicateExpression,
  deleteExpression,
  copy,
  paste
}) => {
  const copyCharacter = useCallback(() => {
    copy("character");
  },[copy]);

  const copyExpression = useCallback(() => {
    paste("expression")
  }, [paste]);

  const pasteCharacter = useCallback(() => {
    copy("character");
  },[copy]);

  const pasteExpression = useCallback(() => {
    paste("expression")
  }, [paste]);

  return(
    <PanelGroup direction="vertical" style={{ flex: 1, minHeight: 0 }}>
      <Panel
        defaultSize={50}
        minSize={10}
      >
        <SelectableListPanel
          items={items}
          value={selectedItem}
          onChange={setSelectedItem}
          showActions={true}
          returnIndex={true}
          onAdd={addCharacter}
          onDuplicate={duplicateCharacter}
          onDelete={deleteCharacter}
          onCopy={copyCharacter}
          onPaste={pasteCharacter}
        />
      </Panel>

      <PanelResizeHandle style={handleStyleVertical} />

      <Panel
        defaultSize={50}
        minSize={10}
      >
        <SelectableListPanel
          items={subItems}
          value={selectedSubItem}
          onChange={setSelectedSubItem}
          showActions={true}
          returnIndex={true}
          onAdd={addExpression}
          onDuplicate={duplicateExpression}
          onDelete={deleteExpression}
          onCopy={copyExpression}
          onPaste={pasteExpression}
        />
      </Panel>
    </PanelGroup>
  )
})

export default CharactersPanel;