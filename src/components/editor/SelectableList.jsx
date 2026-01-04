import { Typography, List, ListItemButton, ListItemText } from "@mui/material";
import { memo } from "react";

function SelectableList({ items, value, onChange, returnIndex = false }) {
  return (
    <List
      sx={{
        overflowY: "auto"
      }}
    >
      {items.map((item, i) => {
        const selected = returnIndex ? value === i : value === item;

        return (
          <ListItemButton
            key={i}
            selected={selected}
            onClick={() => onChange(returnIndex ? i : item)}
          >
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ color: "text.primary", fontSize: "0.75rem" }}>{item}</Typography>
              } 
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default memo(SelectableList);
