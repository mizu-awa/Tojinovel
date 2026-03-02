export const defaultExpressionData = {
    "name": "通常",
    "image": "./system/character_image.png"
}

export const defaultCharacterData = {
    "name": "キャラクター1",
    "defaultExpression": "通常",
    "expressions": [defaultExpressionData]
}

export const defaultUsedItemData = {
    "item": "",
    "file": "",
    "label": ""
}

export const defaultStateData = {
    "name": "default",
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 100,
    "background": "",
    "text": "",
    "zIndex": 10,
    "visibility": true,
    "style": {
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
    },
    "hover":"none",
    "inputMode": false,
    "inputVariable": "",
    "draggable": false,
    "onDragEnd": {
        "file": "",
        "label": ""
    },
    "onClick": {
        "file": "",
        "label": ""
    },
    "usedItems": [defaultUsedItemData]
}

export const defaultHotspotData = {
  "name": "New hotspot",
  "state": "default",
  "states": [defaultStateData]
}

export const defaultItemData = { 
    "name": "New item", 
    "image": "./system/item_image.png",
    "have": true,
    "hotspots":[defaultHotspotData]
}

export const defaultSceneData = {
      "name": "New Scene",
      "background": "./system/scene_image.png",
      "visitEvent": {
        "file": "",
        "label": ""
      },
      "directions": {
        "top":{"target": ""},
        "right": {"target": ""},
        "bottom":{"target": ""},
        "left": {"target": ""}
      },
      "hotspots": [defaultHotspotData]
}

export const defaultVariableData = {
      "name": "New data",
      "value": "0"
}

export const defaultGameData = {
  "game": {
    "title": "Game title",
    "screenSize": [800, 480],
    "startScene": "New Scene",
    "commonSceneName": "",
    "character": {
      "slots": 3
    },
    "save": {
      "slots": 3,
      "auto": false,
      "dataText": "Save Data",
      "saveText": "Save",
      "loadText": "Load",
      "noDataText": "No Data",
      "autoText": "Auto",
      "hover": "none",
      "gap": 10,
      "backStyle": {
        "backgroundColor": "rgba(222,222,222,1)",
        "backgroundImage": "",
        "padding": "10px 30px"
      },
      "titleStyle": {
        "fontSize": "24px",
        "color": "rgba(0,0,0,1)",
        "backgroundColor": "transparent",
        "padding": "0px"
      },
      "closeBtnStyle": {
        "size": 24,
        "color": "rgba(0,0,0,1)",
        "hover": "hoverOp"
      },
      "buttonStyle":{
        "padding":10,
        "color": "rgba(0,0,0,1)",
        "fontSize": "16px",
        "backgroundColor": "rgba(255,255,255,1)",
        "backgroundImage": "",
        "borderStyle": "none",
        "borderWidth": "1px",
        "borderColor": "rgba(0, 0, 0, 1)",
        "borderRadius": "5px"
      }
    },
    "backStyle":{
      "backgroundColor": "rgba(255,255,255,1)",
      "backgroundImage": ""
    },
    "gameStyle":{
      "borderColor": "rgba(0,0,0,1)",
      "borderWidth": 1,
      "borderStyle": "none",
      "shadowColor": "rgba(0, 0, 0, 0.3)",
      "color": "rgba(0,0,0,1)",
      "fontFamily": "system-ui"
    },
    "itemBox": {
      "size": 160,
      "position": "right",
      "space": 10,
      "paginationSize": 16,
      "columnCount": 2,
      "hover":"none",
      "foldable": false,
      "boxStyle": {
        "backgroundColor": "rgba(240,240,240,1)",
        "backgroundImage": "",
        "color": "rgba(0,0,0,1)"
      },
      "itemStyle":{
        "backgroundColor": "rgba(255,255,255,1)",
        "borderRadius": "0px"
      },
      "selectedItemBorder":{
        "color": "rgba(255,0,0,1)",
        "width": "2px",
        "style": "solid"
      }
    },
    "itemDrawer":{
      "size": [320, 240],
      "style": {
        "backgroundColor": "rgba(255,255,255,1)",
        "borderRadius": "0px"
      },
      "backStyle": {
        "backgroundColor": "rgba(0,0,0,0.5)"
      }
    },
    "textBox": {
      "position": [20, 320],
      "size": [600, 150],
      "speed": 80,
      "style":{
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
      },
      "highlightStyle":{
        "color": "rgba(255,0,0,1)",
        "strokeColor": "rgba(255,255,255,1)"
      },
      "nameStyle":{
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
      },
      "indicator": {
        "text": "▼"
      }
    },
    "direction":{
      "size": 40,
      "useDefaultArrow": true,
      "hover": "none",
      "style": {
        "backgroundColor": "rgba(0,0,0,0)",
        "color": "rgba(125,125,125,1)"
      },
      "images": {
        "top": "",
        "right": "",
        "bottom": "",
        "left": ""
      }
    },
    "option": {
      "position": [50, 50],
      "size": 180,
      "gap": 20,
      "hover": "none",
      "style": {
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
    },
    "image": {
      "position": [180, 50],
      "size": [300, 400],
      "style": {
        "borderStyle": "none",
        "borderWidth": "1px",
        "borderColor": "rgba(255,255,255,1)"
      }
    },
    "input": {
      "position": [180, 80],
      "size": [300, 140],
      "hover": "none",
      "backStyle": {
        "backgroundColor": "rgba(0,0,0,0.2)",
        "backgroundImage": "",
        "borderRadius": "5px",
        "borderStyle": "none",
        "borderWidth": "1px",
        "borderColor": "rgba(255, 255, 255, 1)"
      },
      "inputStyle": {
        "color": "rgba(0,0,0,1)",
        "fontSize": "16px",
        "backgroundColor": "rgba(255,255,255,1)",
        "borderStyle": "solid",
        "borderWidth": "1",
        "borderColor": "rgba(0, 0, 0, 1)",
        "borderRadius": "0px"
      },
      "buttonStyle": {
        "color": "rgba(0,0,0,1)",
        "fontSize": "16px",
        "backgroundColor": "rgba(255,255,255,1)",
        "borderStyle": "none",
        "borderWidth": "1px",
        "borderColor": "rgba(0, 0, 0, 1)",
        "borderRadius": "5px"
      }
    },
    "menu": {
      "position": "bottom right",
      "saveText": "Save",
      "loadText": "Load",
      "configText": "config",
      "visibleSave": true,
      "visibleLoad": true,
      "visibleConfig": true,
      "hover": "none",
      "style": {
        "fontSize": "16px",
        "gap": 10,
        "fontWeight": 500,
        "color": "rgba(0, 0, 0, 1)",
        "textOutlineColor": "rgba(0, 0, 0, 0)"
      }
    },
    "config": {
      "bgmText": "BGM音量",
      "seText": "SE音量",
      "voiceText": "ボイス音量",
      "speedText": "文字送り速度",
      "visibleBGM": true,
      "visibleSE": true,
      "visibleVoice": true,
      "visibleSpeed": true,
      "visibleAuto": true,
      "autoText": "オート",
      "backStyle": {
        "backgroundColor": "rgba(255,255,255,1)",
        "backgroundImage": ""
      },
      "containerStyle": {
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
      },
      "trackStyle": {
        "height": 6,
        "borderRadius": "3px",
        "backgroundColor": "rgba(180, 42, 42, 1)"
      },
      "thumbStyle": {
        "size": 20,
        "backgroundColor": "rgba(55, 80, 202, 1)",
        "borderColor": "rgba(255, 255, 255, 1)",
        "borderStyle": "solid",
        "borderWidth": "2px"
      }
    },
    "auto": {
      "enabled": false,
      "speed": 2000
    },
    "sound": {
        "bgm": 0.8,
        "se": 1,
        "voice": 1
    }
  },
  "variables": [defaultVariableData],
  "characters": [defaultCharacterData],
  "scenes": [defaultSceneData],
  "items": [defaultItemData]
}