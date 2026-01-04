import { memo } from "react";
import SelectableListPanel from "../SelectableListPanel";
const noop = () => {};

const SettingsPanel = memo(({items, selectedItem, setSelectedItem}) => {
  return(
    <SelectableListPanel
      items={items}
      value={selectedItem}
      onChange={setSelectedItem}
      showActions={false}
      returnIndex={false}
      onAdd={noop}
      onCopy={noop}
      onDelete={noop}
    />
  )
})

export default SettingsPanel;