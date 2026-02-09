import { X } from "lucide-react";
import { memo } from "react";

function SaveLoad({
  saveLoadSlots,
  save,
  saveClick,
  loadClick,
  closeSaveLoad,
  screenSize
}){
    // 2桁ゼロ埋め関数
    const pad = (n) => n.toString().padStart(2, '0');

    // 時間成形関数
    const toTimeStamp = (date) => {
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const mi = pad(date.getMinutes());
      const ss = pad(date.getSeconds());

      const timestamp = `${date.getFullYear()}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      return timestamp;
    }

    if(!saveLoadSlots) return null;

    const titleFontSize = screenSize ? Math.max(12, Math.round(screenSize[1] * 0.04)) : (parseInt(save?.buttonStyle?.fontSize) || 16);

    return(
        <div
          style={{
            ...save.backStyle,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 3002,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box"
          }}
        >
          <h2 style={{ padding: `${titleFontSize / 2}px`, fontSize: `${titleFontSize}px` }}>
            {saveLoadSlots.type === "save" ? save.saveText : save.loadText}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "visible"
            }}
          >
            {saveLoadSlots.slots.map((slot, i) => {
              const slotNumPre = save.auto ? i - 1 : i;
              const slotNum = (slotNumPre <= -1) ? "auto" : slotNumPre;
              const slotText = slotNum === "auto" ? save.autoText : slotNum;

              return (
                <div
                  className={save.hover}
                  style={{
                    ...save.buttonStyle,
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0
                  }}
                  key={slotNum}
                  onClick={()=>{
                    if(saveLoadSlots.type === "save"){
                        saveClick(slotNum)
                    }
                    else if(slot && saveLoadSlots.type === "load"){
                        loadClick(slotNum)
                    } 
                  }}
                >
                  <p>
                    {slot ? save.dataText + " " + slotText : save.noDataText}
                  </p>
                  <p>
                    {slot && slot.date ?  toTimeStamp(new Date(slot.date)) : ""}
                  </p>
                </div>
              )
            })}
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: `${titleFontSize / 2}px`,
              cursor: "pointer"
            }}
            onClick={closeSaveLoad}
          >
            <X size={titleFontSize} />
          </div>
        </div>
    )
}

export default memo(SaveLoad);