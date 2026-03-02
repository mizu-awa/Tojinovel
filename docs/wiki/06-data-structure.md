# データ仕様書（とじのべる）

この仕様書はゲームデータ JSON の構造を記述したものです。  
記載されている値は例であり、 **実際のゲームデータを示すものではありません。**

## 共通仕様
### スタイル（style / backStyle / itemStyle など）について

* CSS プロパティを自由に追加できる

* ゲームシステム側の指定と競合することがある

* 設定値は基本的に CSS と同じ仕様

### hover の設定値
* none：変化なし
* hoverOp：透明度変化
* hoverBt：明るくする
* hoverDk：暗くする
* hoverSp：発光
* hoverSh：キラリ

### 記号の解説
🔑…配列内でユニークである必要がある値

---

## 1. Root 構造

```jsonc
{
  "game": { ... },
  "variables": [],
  "characters": [],
  "scenes": [],
  "items": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
| game       | object             | ゲーム全体設定     |
| variables  | array（要素：Variable）    | 変数一覧           |
| characters | array（要素：Character）   | キャラクター一覧   |
| scenes     | array（要素：Scene）       | シーン一覧         |
| items      | array（要素：Item）        | アイテム一覧       |

## 2. Variable（変数）
```jsonc
{
  "name": "New data",
  "value": "0"
}
```
| Key	| 型	| 説明| 
|------------|--------------------|--------------------|
| name🔑| 	string| 	変数名| 
| value	| string	| 値（数値も文字列で保持）| 

## 3. Character（キャラクター）
```jsonc
{
  "name": "キャラクター1",
  "defaultExpression": "通常",
  "expressions": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
| name🔑       | string             | キャラクター名     |
| defaultExpression  | string    | デフォルトの表情名           |
| expressions | array（要素：Expression）   | キャラクターの表情一覧   |

### 3.1 Expression（表情）
```jsonc
{
  "name": "通常",
  "image": "./data/character_image.png"
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|name🔑	|string	|表情名|
|image	|string	|画像パス|

## 4. Scene（シーン）
```jsonc
{
  "name": "New Scene",
  "background": "./data/scene_image.png",
  "visitEvent": {
    "file": "./data/event.txt",
    "label": "開始画面" 
  },
  "directions": {
    "top": {
      "target": ""
    },
    "right": {
      "target": "正面ドア"
    },
    "bottom": {
      "target": ""
    },
    "left": {
      "target": ""
    }
  },
  "hotspots": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|name🔑	|string	|シーン名
|background	|string	|背景画像パス
|visitEvent	|object	|シーン訪問時イベント
|visitEvent.file	|string	|イベントファイルのパス
|visitEvent.label	|string	|イベントラベル名
|directions	|object	|4方向の遷移設定
|directions.top.target	|string	|上側の遷移先シーン名
|directions.right.target	|string	|右側の遷移先シーン名
|directions.bottom.target	|string	|下側の遷移先シーン名
|directions.left.target	|string	|左側の遷移先シーン名
|hotspots	|array（要素：Hotspot）	|ホットスポット一覧

## 5. Hotspot（ホットスポット）
```jsonc
{
  "name": "New hotspot",
  "state": "default",
  "states": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|name🔑	|string	|ホットスポット名
|state	|string	|現在のステート名（初期ステート）
|states	|array（要素：State）	|ステート一覧

## 6. State（ステート）
```jsonc
{
  "name": "shelf",
  "x": 0,
  "y": 0,
  "width": 100,
  "height": 100,
  "background": "./data/shelf.png",
  "text": "",
  "zIndex": 10,
  "visibility": true,
  "style": { ... },
  "hover": "none",
  "inputMode": false,
  "inputVariable": "",
  "draggable": false,
  "onDragEnd": {
    "file": "",
    "label": ""
  },
  "onClick": {
    "file": "./data/event.txt",
    "label": "棚開閉"
  },
  "usedItems": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|name🔑	|string	|ステート名
|x	|number	|X座標（左上基準）
|y	|number	|Y座標（左上基準）
|width	|number	|幅
|height	|number	|高さ
|background	|string	|背景画像のパス
|text |string | 表示文字列
|zIndex |number |重なり順（大きいほうが前）
|visibility |boolean |表示/非表示
|style |object| ホットスポットに適用するスタイル
|hover |string| マウスホバー時に適用するスタイル名
|inputMode |boolean| 入力モード（有効にするとホットスポットがテキスト入力欄になる）
|inputVariable |string| 入力値をバインドする変数名（入力モード時に使用）
|draggable |boolean| ドラッグ可能（有効にするとプレイヤーがドラッグで移動できる）
|onDragEnd |object| ドラッグ完了時のイベント
|onDragEnd.file |string| イベントファイルのパス
|onDragEnd.label |string| イベントファイルのラベル
|onClick |object |クリック時のイベント
|onClick.file |string |イベントファイルのパス
|onClick.label |string |イベントファイルのラベル
|usedItems |array（要素：UsedItem） |アイテム使用イベント一覧


### 6.1 Style
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0)",
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(0,0,0,0)",
  "shadowColor": "rgba(0,0,0,0)",
  "fontSize": "16px",
  "color": "rgba(0,0,0,1)",
  "textAlign": "left",
  "fontWeight": 400,
  "borderRadius": 0,
  "textVAlign": "center",
  "textPadding": "0px",
  "rotate": 0,
  "fontFamily": ""
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|backgroundColor	|string	|背景色
|borderStyle	|string	|ボーダーの見た目
|borderWidth	|string	|ボーダー太さ
|borderColor	|string	|ボーダー色
|fontSize	|string	|フォントサイズ
|color	|string	|文字色
|textAlign	|string	|行揃え
|fontWeight	|number	|文字太さ
|borderRadius	|	number|角丸サイズ
|textVAlign	|string	|テキストの上下揃え（CSSのalignItemsに準拠）
|textPadding	|string	|テキスト部の余白（CSSのpaddingに準拠）
|rotate |number |回転角度（deg）
|fontFamily |string |フォント（空文字でgameStyle.fontFamilyを継承）

### 6.2 UsedItem
```jsonc
{
  "item": "鍵",
  "file": "./data/event.txt",
  "label": "棚に鍵使用"
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|item	|string	|使用するアイテム名
|file	|string	|イベントファイル名
|label	|string	|イベントラベル

## 7. Item（アイテム）
```jsonc
{
  "name": "New item",
  "image": "./data/item_image.png",
  "have": true,
  "hotspots": []
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|name🔑	|string	|アイテム名
|image	|string	|アイテム画像パス
|have	|boolean	|アイテムを保持しているかどうか
|hotspots	|array（要素：Hotspot）	|ホットスポット一覧

## 8. Game（ゲーム設定）
```jsonc
{
  "title": "Game title",
  "screenSize": [800, 480],
  "startScene": "New Scene",
  "commonSceneName": "",
  "character": {
    "slots": 3
  },
  "backStyle": { ... },
  "gameStyle": { ... },
  "save": { ... },
  "itemBox": { ... },
  "itemDrawer": { ... },
  "textBox": { ... },
  "direction": { ... },
  "option": { ... },
  "image": { ... },
  "input": { ... },
  "menu": { ... },
  "config": { ... },
  "sound": { ... }
}
```
| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|title	|string	|ゲームタイトル
|screenSize	|number[]	|画面最大サイズ（x,y）
|startScene	|string	|開始シーン名
|commonSceneName	|string	|共通部品として使用するシーン名
|character.slots	|number	|立ち絵の同時表示数
|backStyle	|object	|ゲーム画面の背景スタイル
|gameStyle	|object	|ゲーム画面のスタイル
|save	|object	|セーブ・ロード設定
|itemBox	|object	|アイテムボックスの設定
|itemDrawer	|object	|アイテムドロワーの設定
|textBox	|object	|テキストボックスの設定
|direction	|object	|方向移動ボタンの設定
|option	|object	|選択肢の設定
|image	|object	|イベント画像表示の設定
|input	|object	|入力フォームの設定
|menu	|object	|ゲームメニューの設定
|config	|object	|コンフィグ画面の設定
|sound	|object	|音の設定

### 8.1 BackStyle
ゲーム画面の背景スタイル
``` jsonc
{
  "backgroundColor": "rgba(255,255,255,1)",
  "backgroundImage": ""
}
```

| Key                       | 型      | 説明        |
| ------------------------- | ------ | --------- |
| backgroundColor | string | 背景色カラーコード |
| backgroundImage | string | 背景画像URL   |

### 8.2 GameStyle
ゲーム画面のスタイル

``` jsonc
{
  "borderColor": "rgba(0,0,0,1)",
  "borderWidth": 1,
  "borderStyle": "none",
  "shadowColor": "rgba(0, 0, 0, 0.3)",
  "color": "rgba(0,0,0,1)",
  "fontFamily": "system-ui"
}
```

| Key                   | 型      | 説明     |
| --------------------- | ------ | ------ |
|borderColor | string | 枠線の色   |
|borderWidth | number | 枠線の太さ  |
|borderStyle | string | 枠線スタイル |
|shadowColor | string | 影の色    |
|color       | string | 文字色    |
|fontFamily  | string | ゲーム全体のフォント（CSS の font-family に準拠） |


### 8.3 Save
セーブ・ロード設定
```jsonc
{
  "slots": 3,
  "auto": false,
  "dataText": "Save Data",
  "saveText": "Save",
  "loadText": "Load",
  "noDataText": "No Data",
  "autoText": "Auto",
  "hover": "none",
  "gap": 10,
  "backStyle": {...},
  "titleStyle": {...},
  "closeBtnStyle": {...},
  "buttonStyle": {...}
}
```

| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|slots |number |セーブデータスロット数（オートセーブ除く）
|auto |boolean |オートセーブの有効/無効
|dataText |string |セーブデータを示す表示文字列
|loadText |string |ロードを表す表示文字列
|noDataText |string |データがないことを示す表示文字列
|autoText |string |オートセーブを示す
|hover |string | ボタンのマウスホバー時に適用するスタイル名
|gap |number | スロット間の余白
|backStyle |object |背景のスタイル
|titleStyle |object |画面タイトルのスタイル
|closeBtnStyle |object |×ボタンのスタイル
|buttonStyle |object |セーブ・ロードボタンのスタイル

#### 8.3.1 BackStyle
```jsonc
{
  "backgroundColor": "rgba(222,222,222,1)",
  "backgroundImage": "",
  "padding": "10px 30px"
}
```

| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|backgroundColor |string |背景色カラーコード
|backgroundImage |string |背景画像URL
|padding |string |背景の余白

#### 8.3.2 ButtonStyle
```jsonc
{
  "padding": 10,
  "color": "rgba(0,0,0,1)",
  "fontSize": "16px",
  "backgroundColor": "rgba(255,255,255,1)",
  "backgroundImage": "",
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(0,0,0,1)",
  "borderRadius": "5px"
}
```

| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|padding |number |セーブ・ロードボタンの余白
|color |string | ボタンの文字色
|fontSize |string |ボタンのフォントサイズ
|backgroundColor |string |ボタン色
|backgroundImage |string |ボタン背景画像
|borderStyle |string |ボタンのボーダー種類
|borderWidth |string |ボタンのボーダー太さ
|borderColor |string |ボタンのボーダー色
|borderRadius |string |ボタンの角丸サイズ

#### 8.3.3 TitleStyle
```jsonc
{
  "fontSize": "24px",
  "color": "rgba(0,0,0,1)",
  "backgroundColor": "transparent",
  "padding": "0px"
}
```

| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|fontSize |string |タイトルのフォントサイズ
|color |string |タイトルの文字色
|backgroundColor |string |タイトルの背景色
|padding |string |タイトルの余白

#### 8.3.4 CloseBtnStyle
```jsonc
{
  "size": 24,
  "color": "rgba(0,0,0,1)",
  "hover": "hoverOp"
}
```

| Key        | 型                | 説明               |
|------------|--------------------|--------------------|
|size |number |×ボタンのアイコンサイズ
|color |string |×ボタンの色
|hover |string |ホバー時のスタイル名


### 8.4 ItemBox
アイテムボックスの設定
```jsonc
{
  "size": 160,
  "position": "right",
  "space": 10,
  "paginationSize": 16,
  "columnCount": 2,
  "hover":"none",
  "foldable": false,
  "boxStyle": {...},
  "itemStyle": {...},
  "selectedItemBorder": {...}
}
```
| Key                    | 型       | 説明               |
| ---------------------- | ------- | ---------------- |
| size           | number  | アイテムボックスのサイズ |
| position       | string  | 表示位置（top/left/bottom/right）             |
| space          | number  | ボックス間の余白         |
| paginationSize | number  | ページ送りボタン表示部分の高さ（幅）    |
| columnCount    | number  | 列数（行数）               |
| hover          | string  | アイテムホバー時のスタイル名       |
| foldable       | boolean | 折りたたみ可否          |
| boxStyle | object | アイテムボックス全体のスタイル
| itemStyle | object | 1つ1つのアイテムのスタイル
| selectedItemBorder | object | 選択中のアイテムのボーダースタイル

#### 8.4.1 BoxStyle
```jsonc
{
  "backgroundColor": "rgba(240,240,240,1)",
  "backgroundImage": "url(./data/images/item.png)",
  "color": "rgba(0,0,0,1)"
}
```
| Key                              | 型      | 説明       |
| -------------------------------- | ------ | -------- |
| boxStyle.backgroundColor | string | ボックス背景色  |
| boxStyle.backgroundImage | string | ボックス背景画像 |
| boxStyle.color           | string | 文字色      |

#### 8.4.2 ItemStyle
```jsonc
{
  "backgroundColor": "rgba(255,255,255,1)",
  "borderRadius": "0px"
}
```
| Key                               | 型      | 説明      |
| --------------------------------- | ------ | ------- |
| backgroundColor | string | アイテム背景色 |
| borderRadius    | string | アイテム角丸  |

#### 8.4.3 SelectedItemBorder
```jsonc
{
  "color": "rgba(255,0,0,1)",
  "width": "2px",
  "style": "solid"
}
```
| Key                              | 型      | 説明         |
| -------------------------------- | ------ | ---------- |
| color | string | 選択中アイテム枠線色 |
| width | string | 枠線の太さ      |
| style | string | 枠線スタイル     |

### 8.5 ItemDrawer
アイテムドロワーの設定
``` jsonc
{
  "size": [320, 240],
  "style": {...},
  "backStyle": {...}
}
```
| Key                  | 型             | 説明            |
| -------------------- | ------------- | ------------- |
| size      | number[] | 幅・高さ          |
| style     | object        | 表示枠のスタイル      |
| backStyle | object        | 背面オーバーレイのスタイル |


### 8.5.1 Style
``` jsonc
{
  "backgroundColor": "rgba(255,255,255,1)",
  "borderRadius": "0px"
}
```
| Key                              | 型      | 説明  |
| -------------------------------- | ------ | --- |
| backgroundColor | string | 背景色 |
| borderRadius    | string | 角丸  |

### 8.5.2 BackStyle
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0.5)"
}
```
| Key                                  | 型      | 説明        |
| ------------------------------------ | ------ | --------- |
| backgroundColor | string | 背景オーバーレイ色 |

### 8.6 TextBox
テキストボックスの設定
```jsonc
{
  "position": [20, 320],
  "size": [600, 150],
  "speed": 80,
  "style": {...},
  "highlightStyle": {...},
  "nameStyle": {...},
  "indicator": {...}
}
```

| Key                    | 型             | 説明           |
| ---------------------- | ------------- | ------------ |
| position       | number[] | 表示位置（x,y）    |
| size           | number[] | サイズ（幅, 高さ）   |
| speed          | number        | 文字送り速度初期値       |
| style          | object        | テキストボックススタイル |
| highlightStyle | object        | 文字強調表示のスタイル       |
| nameStyle | object        | 名前表示部分のスタイル       |
| indicator | object        | クリック待ちインジケーター |

#### 8.6.1 Style
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0.6)",
  "backgroundImage": "",
  "borderTopStyle": "solid",
  "borderTopWidth": "0px",
  "borderTopColor": "rgba(0,0,0,0)",
  "padding": 10,
  "lineHeight": 1.2,
  "textAlign": "left",
  "borderTopRightRadius": "0px",
  "color": "rgba(255,255,255,1)",
  "fontSize": "16px"
}
```
| Key                                | 型      | 説明      |
| ---------------------------------- | ------ | ------- |
| backgroundColor      | string | 背景色     |
| backgroundImage      | string | 背景画像    |
| borderTopStyle       | string | 枠線の種類（全体）  |
| borderTopWidth       | string | 枠線の太さ（全体）  |
| borderTopColor       | string | 枠線の色（全体）  |
| padding              | number | 内側余白    |
| lineHeight           | number | 行間      |
| textAlign            | string | テキストの揃え |
| borderTopRightRadius | string | 角丸（全体）    |
| color                | string | 文字色     |
| fontSize             | string | 文字サイズ   |


#### 8.6.2 HighlightStyle
```jsonc
{
  "color": "rgba(255,0,0,1)",
  "strokeColor": "rgba(255,255,255,1)"
}
```
| Key                                | 型      | 説明    |
| ---------------------------------- | ------ | ----- |
| color       | string | 強調文字色 |
| strokeColor | string | 縁取り色  |

#### 8.6.3 NameStyle
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0.6)",
  "backgroundImage": "",
  "color": "rgba(255,255,255,1)",
  "fontSize": "16px",
  "padding": 12,
  "minWidth": 120,
  "distance": 0,
  "borderWidth": "0px",
  "borderStyle": "solid",
  "borderColor": "rgba(0,0,0,0)",
  "borderRadius": "0px"
}
```
| Key                                | 型      | 説明    |
| ---------------------------------- | ------ | ----- |
| backgroundColor      | string | 背景色     |
| backgroundImage      | string | 背景画像    |
| color                | string | 文字色 |
| fontSize             | string | フォントサイズ |
| padding              | number | 内側余白 |
| minWidth             | number | 最小幅 |
| distance             | number | テキストボックス上端からの距離（px）|
| borderWidth          | string | 枠線の太さ |
| borderStyle          | string | 枠線の種類 |
| borderColor          | string | 枠線の色 |
| borderRadius         | string | 角丸 |

#### 8.6.4 Indicator
```jsonc
{
  "text": "▼"
}
```
| Key                                | 型      | 説明    |
| ---------------------------------- | ------ | ----- |
| text      | string | クリック待ちに表示するテキスト |

### 8.7 Direction
方向移動ボタンの設定
```jsonc
{
  "size": 40,
  "useDefaultArrow": true,
  "hover": "none",
  "style": {...},
  "images": {
    "top": "",
    "right": "",
    "bottom": "",
    "left": ""
  }
}
```
| Key                       | 型       | 説明         |
| ------------------------- | ------- | ---------- |
| size            | number  | 矢印アイコンのサイズ |
| useDefaultArrow | boolean | 既定矢印を使用するか（現在無効） |
| hover           | string  | ホバー時のスタイル名 |
| style           | object  | スタイル       |
| images          | object  | 各方向のカスタム画像URL（上/右/下/左）空文字でデフォルト矢印を使用 |


#### 8.7.1 Style
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0)",
  "color": "rgba(125,125,125,1)"
}
```
| Key                             | 型      | 説明  |
| ------------------------------- | ------ | --- |
| backgroundColor | string | 背景色 |
| color           | string | 矢印色 |

### 8.8 Option
選択肢の設定
```jsonc
{
  "position": [50, 50],
  "size": 180,
  "gap": 20,
  "hover": "none",
  "style": {...}
}
```

| Key             | 型             | 説明       |
| --------------- | ------------- | -------- |
| position | number[] | 表示位置(x,y)     |
| size     | number        | 横幅      |
| gap      | number        | 項目間の余白   |
| hover    | string        | ホバースタイル名 |
| style    | object        | スタイル     |

#### 8.8.1 Style
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0.5)",
  "backgroundImage": "",
  "padding": 5,
  "borderStyle": "none",
  "borderColor": "rgba(0,0,0,1)",
  "borderWidth": "0px",
  "borderRadius": "0px",
  "fontSize": "16px",
  "color": "rgba(0,0,0,1)",
  "textAlign": "left"
}
```
| Key                          | 型      | 説明      |
| ---------------------------- | ------ | ------- |
| backgroundColor | string | 背景色     |
| backgroundImage | string | 背景画像    |
| padding         | number | 余白      |
| borderStyle     | string | ボーダー種類  |
| borderColor     | string | ボーダー色   |
| borderWidth     | string | ボーダー太さ  |
| borderRadius    | string | 角丸      |
| fontSize        | string | フォントサイズ |
| color           | string | 文字色     |
| textAlign       | string | テキスト揃え  |

### 8.9 Image
イベント実行中の画像表示の設定
```jsonc
{
  "position": [180, 50],
  "size": [300, 400],
  "style": {...}
}
```
| Key            | 型             | 説明    |
| -------------- | ------------- | ----- |
| position | number[] | 表示位置(x,y)  |
| size     | number[] | 画像サイズ(幅,高さ) |
| style    | object        | スタイル  |


#### 8.9.1 Style
```jsonc
{
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(255,255,255,1)"
}
```
| Key                     | 型      | 説明    |
| ----------------------- | ------ | ----- |
| borderStyle | string | 枠線の種類 |
| borderWidth | string | 枠線の太さ |
| borderColor | string | 枠線の色  |

### 8.10 Input
入力フォームの設定
```jsonc
{
  "position": [...],
  "size": [...],
  "hover": "none",
  "backStyle": {...},
  "inputStyle": {...},
  "buttonStyle": {...}
}
```
| Key               | 型             | 説明            |
| ----------------- | ------------- | ------------- |
| position    | number[] | 表示位置          |
| size        | number[] | 入力枠のサイズ       |
| hover       | string        | ホバースタイル名      |
| backStyle   | object        | 背景スタイル        |
| inputStyle  | object        | テキスト入力部分のスタイル |
| buttonStyle | object        | ボタンのスタイル      |

#### 8.10.1 BackStyle
```jsonc
{
  "backgroundColor": "rgba(0,0,0,0.2)",
  "backgroundImage": "",
  "borderRadius": "5px",
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(255, 255, 255, 1)"
}
```
| Key                             | 型      | 説明   |
| ------------------------------- | ------ | ---- |
| backgroundColor | string | 背景色  |
| backgroundImage | string | 背景画像 |
| borderRadius    | string | 角丸   |
| borderStyle     | string | 枠線種  |
| borderWidth     | string | 枠線太さ |
| borderColor     | string | 枠線色  |

#### 8.10.2 InputStyle
```jsonc
{
  "color": "rgba(0,0,0,1)",
  "fontSize": "16px",
  "backgroundColor": "rgba(255,255,255,1)",
  "borderStyle": "solid",
  "borderWidth": "1",
  "borderColor": "rgba(0, 0, 0, 1)",
  "borderRadius": "0px"
}
```
| Key                              | 型      | 説明    |
| -------------------------------- | ------ | ----- |
| color           | string | 文字色   |
| fontSize        | string | 文字サイズ |
| backgroundColor | string | 背景色   |
| borderStyle     | string | 枠線種類  |
| borderWidth     | string | 枠線太さ  |
| borderColor     | string | 枠線色   |
| borderRadius    | string | 角丸    |

#### 8.10.3 ButtonStyle
```jsonc
{
  "color": "rgba(0,0,0,1)",
  "fontSize": "16px",
  "backgroundColor": "rgba(255,255,255,1)",
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(0, 0, 0, 1)",
  "borderRadius": "5px"
}
```
| Key                               | 型      | 説明      |
| --------------------------------- | ------ | ------- |
| color           | string | 文字色     |
| fontSize        | string | フォントサイズ |
| backgroundColor | string | 背景色     |
| borderStyle     | string | 枠線種類    |
| borderWidth     | string | 枠線太さ    |
| borderColor     | string | 枠線色     |
| borderRadius    | string | 角丸      |

### 8.11 Menu
ゲームメニューの設定
```jsonc
"menu": {
  "position": "bottom right",
  "saveText": "Save",
  "loadText": "Load",
  "configText": "config",
  "visibleSave": true,
  "visibleLoad": true,
  "visibleConfig": true,
  "hover": "none",
  "style": {...}
}
```

| Key                | 型       | 説明         |
| ------------------ | ------- | ---------- |
| position      | string  | 表示位置       |
| saveText      | string  | セーブ表示文字列   |
| loadText      | string  | ロード表示文字列   |
| configText    | string  | コンフィグ表示文字列 |
| visibleSave   | boolean | セーブ表示可否    |
| visibleLoad   | boolean | ロード表示可否    |
| visibleConfig | boolean | 設定表示可否     |
| hover         | string  | ホバースタイル名   |
| style         | object  | スタイル       |


#### 8.11.1 Style
```jsonc
{
  "fontSize": "16px",
  "gap": 10,
  "fontWeight": 500,
  "color": "rgba(0,0,0,1)",
  "textOutlineColor": "rgba(0,0,0,0)"
}
```
| Key                   | 型      | 説明      |
| --------------------- | ------ | ------- |
| fontSize        | string | フォントサイズ |
| gap             | number | 項目間隔    |
| fontWeight      | number | 文字太さ      |
| color           | string | 文字色 |
| textOutlineColor | string | テキストアウトライン色 |

### 8.12 Config
コンフィグ画面の設定
```jsonc
{
  "bgmText": "BGM音量",
  "seText": "SE音量",
  "voiceText": "ボイス音量",
  "speedText": "文字送り速度",
  "autoText": "オート",
  "visibleBGM": true,
  "visibleSE": true,
  "visibleVoice": true,
  "visibleSpeed": true,
  "visibleAuto": true,
  "backStyle": {...},
  "containerStyle": {...},
  "trackStyle": {...},
  "thumbStyle": {...}
}
```

| Key                   | 型       | 説明         |
| --------------------- | ------- | ---------- |
| bgmText        | string  | BGM ラベル    |
| seText         | string  | SE ラベル     |
| voiceText      | string  | ボイスラベル     |
| speedText      | string  | 速度ラベル      |
| autoText       | string  | オートラベル     |
| visibleBGM     | boolean | BGM 表示可否   |
| visibleSE      | boolean | SE 表示可否    |
| visibleVoice   | boolean | ボイス表示可否    |
| visibleSpeed   | boolean | 速度表示可否     |
| visibleAuto    | boolean | オート表示可否    |
| backStyle      | object  | 背景スタイル     |
| containerStyle | object  | UIコンテナスタイル |
| trackStyle     | object  | スライダーのバーのスタイル   |
| thumbStyle     | object  | スライダーのつまみのスタイル  |


#### 8.12.1 BackStyle
```jsonc
"backStyle": {
  "backgroundColor": "rgba(255,255,255,1)",
  "backgroundImage": ""
}
```
| Key                              | 型      | 説明   |
| -------------------------------- | ------ | ---- |
| backgroundColor | string | 背景色  |
| backgroundImage | string | 背景画像 |


#### 8.12.2 ContainerStyle
```jsonc
{
  "backgroundColor": "rgba(200,200,200,1)",
  "backgroundImage": "",
  "width": 450,
  "gap": 12,
  "color": "rgba(0,0,0,1)",
  "fontSize": "16px",
  "borderStyle": "none",
  "borderWidth": "1px",
  "borderColor": "rgba(0, 0, 0, 1)",
  "borderRadius": "5px",
  "shadowColor": "rgba(0, 0, 0, 1)"
}
```
| Key             | 型      | 説明     |
| --------------- | ------ | ------ |
| backgroundColor | string | 背景色    |
| backgroundImage | string | 背景画像   |
| width           | number | 幅      |
| gap             | number | 各項目の間隔 |
| color           | string | 文字色    |
| fontSize        | string | 文字サイズ  |
| borderStyle     | string | 枠線スタイル |
| borderWidth     | string | 枠線の太さ  |
| borderColor     | string | 枠線の色   |
| borderRadius    | string | 角丸     |
| shadowColor     | string | 影色     |


#### 8.12.3 TrackStyle
```jsonc
{
  "height": 6,
  "borderRadius": "3px",
  "backgroundColor": "rgba(180, 42, 42, 1)"
}
```
| Key                               | 型      | 説明    |
| --------------------------------- | ------ | ----- |
| height          | number | バーの高さ |
| borderRadius    | string | 角丸    |
| backgroundColor | string | 色     |

#### 8.12.4 ThumbStyle
```jsonc
{
  "size": 20,
  "backgroundColor": "rgba(55, 80, 202, 1)",
  "borderColor": "rgba(255, 255, 255, 1)",
  "borderStyle": "solid",
  "borderWidth": "2px"
}
```
| Key                               | 型      | 説明     |
| --------------------------------- | ------ | ------ |
| size            | number | つまみサイズ |
| backgroundColor | string | 背景色    |
| borderColor     | string | 枠線色    |
| borderStyle     | string | 枠線種類   |
| borderWidth     | string | 枠線太さ   |

### 8.13 Sound
音量設定
```jsonc
{
  "bgm": 0.8,
  "se": 1,
  "voice": 1
}
```
| Key         | 型      | 説明     |
| ----------- | ------ | ------ |
| bgm   | number | BGM 初期音量 |
| se    | number | SE 初期音量  |
| voice | number | ボイス初期音量  |

### 8.14 Auto
オート文字送り設定
```jsonc
{
  "enabled": false,
  "speed": 2000
}
```
| Key         | 型      | 説明     |
| ----------- | ------ | ------ |
| enabled   | boolean | オート文字送りの初期状態 |
| speed    | number | オート文字送りの待機時間（ミリ秒）  |
