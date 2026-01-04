import { Autocomplete } from "@mui/material";
import { StyledInput } from "./StyledInput";
import { memo } from "react";

function MyAutoComplete({ options, value, onChange, ...props }) {
  const handleChange = (event, newValue) => {
    // props から data-* を抽出して dataset を作る
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase()); // data-path → path
        dataset[datasetKey] = props[key];
      }
    }

    // synthetic event を作る
    const syntheticEvent = {
      target: {
        value: newValue,
        dataset,
      },
    };

    onChange?.(syntheticEvent);
  };

  return (
    <Autocomplete
      options={Array.from(new Set(options))}
      value={value ?? ""}
      onChange={handleChange}
      renderInput={(params) => (
        <div
          ref={params.InputProps.ref}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <StyledInput
            {...params.inputProps}
            placeholder={params.inputProps?.placeholder}
          />
        </div>
      )}
      {...props} // data-path なども Autocomplete に渡す
    />
  );
}

export default memo(MyAutoComplete);