import { IconButton, Stack } from "@mui/material";
import SelectableList from "./SelectableList";
import { Add, ContentCopy, ContentPaste, Delete } from "@mui/icons-material";
import { memo } from "react";
import { CopyPlus } from "lucide-react";

const SelectableListPanel = memo(({
  items,
  value,
  onChange,
  onAdd,
  onDuplicate,
  onDelete,
  showActions = true,
  returnIndex = false,
  onCopy,
  onPaste
}) => {
  return (
    <Stack
      sx={{
        flex: 1,
        overflowY: "hidden",
        minHeight: 0,
        justifyContent: "space-between",
        height: "100%"
      }}
      direction="column"
    >
      <SelectableList
        items={items}
        value={value}
        onChange={onChange}
        returnIndex={returnIndex}
      />

      {showActions && (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" p={0.5}>
          <IconButton size="small" onClick={onCopy} title="コピー">
            <ContentCopy fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onPaste} title="ペースト">
            <ContentPaste fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onAdd} title="追加">
            <Add fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDuplicate} title="複製">
            <CopyPlus size={18} />
          </IconButton>
          <IconButton size="small" onClick={onDelete} title="削除">
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
})

export default SelectableListPanel;