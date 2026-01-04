import { useTheme } from "@emotion/react";
import { Warning } from "@mui/icons-material";
import { memo } from "react";

const NameWarn = ({visible}) => {
    const theme = useTheme();

    if(!visible){
        return null;
    }

    return(
        <div
            style={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: theme.palette.warning.main
                
            }}
        >
            <Warning /> 名前が重複しています
        </div>
    )
}

export default memo(NameWarn);