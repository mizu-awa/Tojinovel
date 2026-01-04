import { Save } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material"
import { memo } from "react";

const MyAppBar = memo(({save, isSaved}) => {
  return(
    <AppBar position="static" color="secondary">
      <Toolbar>
        <Typography variant="h5" sx={{ color: "primary.contrastText" }}>
          Tojinovel Editor {!isSaved && "*"}
        </Typography>
        <Typography sx={{ color: "primary.contrastText", flexGrow: 1 }} pl={1}>
          ver :{ import.meta.env.RELEASE_VERSION ?? ( import.meta.env.VITE_COMMIT_HASH ?? "dev" ) }
        </Typography>

        <Box sx={{display: "flex"}}>
          <IconButton onClick={save} title="gamedata.jsonに保存" sx={{color: "primary.contrastText"}}>
            <Save />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
})

export default MyAppBar;