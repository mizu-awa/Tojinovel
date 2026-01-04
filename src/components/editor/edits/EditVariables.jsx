import { memo } from "react";
import FormField from "../FormField";
import { StyledInput } from "../StyledInput";
import { defaultVariableData } from "../../../datas/defaultGameData";
import { Fab } from "@mui/material";
import { Add } from "@mui/icons-material";
import NameWarn from "../NameWarn";

const VariableRow = memo(({ variable, index, handleDatasetChange, handleDeleteKey, isWarn }) => {
    const handleDelete = () => handleDeleteKey(`variables.${index}`);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 16px"
        }}>
            <FormField label="変数名">
                <StyledInput
                    value={variable.name}
                    onChange={handleDatasetChange}
                    data-path={`variables.${index}.name`}
                />
                <NameWarn visible={isWarn} />
            </FormField>

            <FormField label="値">
                <StyledInput
                    value={variable.value}
                    onChange={handleDatasetChange}
                    data-path={`variables.${index}.value`}
                />
            </FormField>

            <button
                onClick={handleDelete}
                style={{
                    width: "32px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}
                title="削除"
            >×</button>
        </div>
    )
});

const EditVariables = ({ variables, handleDatasetChange, handleDeleteKey, handleAddArrayItem }) => {

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <div style={{
                paddingTop: "40px",
                width: "100%",
                height: "100%",
                overflowY: "auto",
                boxSizing: "border-box"
            }}>
                {variables.map((variable, i) => {
                    const isWarn = variables.filter(v => v.name === variable.name).length >= 2;//重いかも
                    return(
                        <VariableRow
                            key={i}
                            variable={variable}
                            index={i}
                            handleDatasetChange={handleDatasetChange}
                            handleDeleteKey={handleDeleteKey}
                            isWarn={isWarn}
                        />
                    )})}
            </div>

            <Fab
                color="secondary"
                size="small"
                onClick={() => handleAddArrayItem("variables", defaultVariableData)}
                style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "32px",
                }}
                title="変数を追加"
            >
                <Add />
            </Fab>
        </div>
    )
}

export default EditVariables;
