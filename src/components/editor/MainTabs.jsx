import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { memo } from 'react';

function MainTabs({ value, onChange }) {
  // Wails環境判定（コンポーネント内で評価してモジュールロード時のタイミング問題を回避）
  const isWails = !!window?.go;

  return (
    <Tabs
      value={value}
      onChange={onChange}
      aria-label="basic tabs example"
      variant="scrollable"
      scrollButtons="auto"
    >
        <Tab label="全体設定" value="settings" />
        <Tab label="キャラクター" value="characters" />
        <Tab label="シーン" value="scenes" />
        <Tab label="アイテム" value="items" />
        {isWails && <Tab label="エクスプローラー" value="explorer" />}
    </Tabs>
  );
}

export default memo(MainTabs);