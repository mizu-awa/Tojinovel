import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { memo } from 'react';

function MainTabs({ value, onChange }) {
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
    </Tabs>
  );
}

export default memo(MainTabs);