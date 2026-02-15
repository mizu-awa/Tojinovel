import { Redo, Save, Undo } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material"
import { memo } from "react";

const MyAppBar = memo(({save, isSaved, undo, redo, canUndo, canRedo}) => {
  return(
    <AppBar position="static" color="secondary">
      <Toolbar>
        <Typography variant="h5" sx={{ color: "primary.contrastText" }}>
          Tojinovel Editor {!isSaved && "*"}
        </Typography>
        <Typography sx={{ color: "primary.contrastText", flexGrow: 1 }} pl={1}>
          ver :{ import.meta.env.VITE_RELEASE_VERSION ?? ( import.meta.env.VITE_COMMIT_HASH ?? "dev" ) }
        </Typography>

        <Box sx={{display: "flex"}}>
          <IconButton onClick={undo} disabled={!canUndo} title="元に戻す (Ctrl+Z)" sx={{color: "primary.contrastText", "&.Mui-disabled": {color: "action.disabled"}}}>
            <Undo />
          </IconButton>
          <IconButton onClick={redo} disabled={!canRedo} title="やり直し (Ctrl+Y)" sx={{color: "primary.contrastText", "&.Mui-disabled": {color: "action.disabled"}}}>
            <Redo />
          </IconButton>
          <IconButton onClick={save} title="gamedata.jsonに保存" sx={{color: "primary.contrastText"}}>
            <Save />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
})

export default MyAppBar;
