import { Autocomplete } from "@mui/material";
import { StyledInput } from "./StyledInput";
import { memo, useCallback } from "react";

// ファイルパス入力用オートコンプリート
// MyAutoCompleteと同パターンで、handleDatasetChangeと互換性のあるsynthetic eventを生成する
function FilePathInput({ options, value, onChange, onFocus, ...props }) {
  // Autocomplete選択時
  const handleChange = useCallback((_event, newValue) => {
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase());
        dataset[datasetKey] = props[key];
      }
    }
    const syntheticEvent = {
      target: { value: newValue ?? "", dataset },
    };
    onChange?.(syntheticEvent);
  }, [onChange, props]);

  // テキスト入力時（freeSolo）
  const handleInputChange = useCallback((_event, newValue, reason) => {
    if (reason !== "input") return;
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase());
        dataset[datasetKey] = props[key];
      }
    }
    const syntheticEvent = {
      target: { value: newValue ?? "", dataset },
    };
    onChange?.(syntheticEvent);
  }, [onChange, props]);

  // パスの部分一致フィルタ（ファイル名やディレクトリ名の一部でマッチ）
  const filterOptions = useCallback((opts, { inputValue }) => {
    if (!inputValue) return opts.slice(0, 50); // 未入力時は先頭50件
    const lower = inputValue.toLowerCase();
    return opts.filter((opt) => opt.toLowerCase().includes(lower)).slice(0, 50);
  }, []);

  return (
    <Autocomplete
      freeSolo
      options={options || []}
      value={value ?? ""}
      onChange={handleChange}
      onInputChange={handleInputChange}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <div
          ref={params.InputProps.ref}
          style={{ display: "flex", alignItems: "center", width: "100%" }}
        >
          <StyledInput
            {...params.inputProps}
            onFocus={(e) => {
              params.inputProps.onFocus?.(e);
              onFocus?.(e);
            }}
          />
        </div>
      )}
      slotProps={{
        popper: { style: { width: 320 } },
        listbox: { style: { fontSize: "0.75rem", maxHeight: 240 } },
      }}
    />
  );
}

export default memo(FilePathInput);
