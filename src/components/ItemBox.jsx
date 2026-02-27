import { memo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

// fold用の位置
const foldPosStyle = {
    "top" : {top: 0, left: 0},
    "right" : {right: 0, top: 0},
    "bottom" : {bottom: 0, left: 0},
    "left" : {left: 0, top: 0},
}

const foldTransFormStyle = {
    "top" : "translateY(-100%)",
    "right" : "translateX(100%)",
    "bottom" : "translateY(100%)",
    "left" : "translateX(-100%)",
}

function ItemBox({
    items,
    selectedItem,
    itemBox,
    handleItemClick,
    screenSize
}){
    // ページ送り用
    const [page, setPage] = useState(0)

    // 折り畳み
    const [expand, setExpand] = useState(true);

    if(!items) return null;
    if(!itemBox.size) return null;

    const toggleExpand = () => {
        setExpand(!expand);
    }

    // コードをすっきりさせるために、アイテムボックスの位置設定を横と縦に統合（デフォルトは横）
    const dir = (itemBox.position === "right" || itemBox.position === "left") ? "row"
                : (itemBox.position === "top" || itemBox.position === "bottom") ? "column"
                : "row";

    // 1ページに表示できるアイテム個数
    const pageFill = Math.round(  ( ( dir === "row" )
                    ? ( ( screenSize[1] - itemBox.paginationSize - itemBox.space - itemBox.space ) / itemBox.size )
                    : ( ( screenSize[0] - itemBox.paginationSize - itemBox.space - itemBox.space ) / itemBox.size ) ) * itemBox.columnCount  ) * itemBox.columnCount;

    // 所有しているアイテムに限定し、入手順でソート
    const haveItems = items.filter(item => item.have)
        .sort((a, b) => (a.acquiredOrder ?? 0) - (b.acquiredOrder ?? 0));

    // ページ数
    const maxPage = Math.max(1, Math.ceil(haveItems.length / pageFill));

    const prevPage = () => {
        setPage(Math.max(0, page - 1))
    }

    const nextPage = () => {
        setPage(Math.min(page + 1, maxPage - 1))
    }

    return(
        <>
        <div
            style={{
                ...itemBox.boxStyle,
                ...foldPosStyle[itemBox.position],
                width: dir === "row" ? itemBox.size : "100%",
                height: dir === "row" ? "100%" : itemBox.size,
                minWidth: dir === "row" ? itemBox.size : "100%",
                minHeight: dir === "row" ? "100%" : itemBox.size,
                display: "flex",
                flexDirection: dir === "row" ? "column" : "row",
                boxSizing: "border-box",
                position: itemBox.foldable ? "absolute" : "static",
                zIndex: 2000,
                transform: (itemBox.foldable && !expand) ? foldTransFormStyle[itemBox.position] : "none",
                transition: "transform 0.3s ease"
            }}
        >
            <div
                style={{
                    width: dir === "row" ? "100%" : `calc(100% - ${itemBox.paginationSize}px)`,
                    height: dir === "row" ? `calc(100% - ${itemBox.paginationSize}px)` : "100%",
                    boxSizing: "border-box",
                    display: "grid",
                    gridAutoFlow: dir,
                    gridTemplateColumns: dir === "row" ?  `repeat(${itemBox.columnCount},  1fr)` : "auto" ,
                    gridTemplateRows: dir === "row" ?  `auto` : `repeat(${itemBox.columnCount},  1fr)` ,
                    gap: `${itemBox.space}px`,
                    padding: `${itemBox.space}px`,
                    alignContent: "start",
                    justifyContent: "start"
                }}
                >
                {haveItems.slice(page * pageFill, (page + 1) * pageFill).map((item)=>{
                    return(
                        <div
                            key={item.name}
                            className={itemBox.hover}
                            style={{
                                ...itemBox.itemStyle,
                                aspectRatio: "1 / 1",  /* 正方形にする */
                                width: dir === "row" ? "100%" : "auto",
                                height: dir === "row" ? "auto" : "100%",
                                borderWidth: itemBox.selectedItemBorder.width,
                                borderStyle: itemBox.selectedItemBorder.style,
                                borderColor: item.name === selectedItem ? itemBox.selectedItemBorder.color : "transparent",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxSizing: "border-box",
                                position: "relative"
                            }}
                            onClick={() => {handleItemClick(item.name)}}
                        >
                        <img
                            src={item.image}
                            draggable={false}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%"
                            }}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "./system/transparent.png";
                            }}
                        />
                        </div>
                    )}
                )}
            </div>
            <div
                style={{
                    height: dir === "row" ? `${itemBox.paginationSize}px` : "100%",
                    width: dir === "row" ? "100%" : `${itemBox.paginationSize}px`,
                    display: "flex",
                    flexDirection: dir,
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: `${itemBox.paginationSize * 0.8}px`
                }}
            >
                {dir === "row"
                    ? <ChevronLeft
                        size={itemBox.paginationSize * 0.9}
                        className="hoverOp"
                        onClick={prevPage}
                    />
                    : < ChevronUp
                        size={itemBox.paginationSize * 0.9}
                        className="hoverOp"
                        onClick={prevPage}
                    />
                }
                <p
                    style={{
                        writingMode: dir === "row" ? "horizontal-tb" : "sideways-lr"
                    }}
                >
                    {page + 1} / {maxPage}
                </p>
                {dir === "row"
                    ? <ChevronRight
                        size={itemBox.paginationSize * 0.9}
                        className="hoverOp"
                        onClick={nextPage}
                    />
                    : < ChevronDown
                        size={itemBox.paginationSize * 0.9}
                        className="hoverOp"
                        onClick={nextPage}
                    />
                }
            </div>

            {itemBox.foldable &&
                itemBox.position === "right" ?
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transform: "translateX(-100%)",
                            backgroundColor: itemBox.boxStyle.backgroundColor
                        }}
                        onClick={toggleExpand}
                    >
                        {expand ? <ChevronRight /> : <ChevronLeft />}
                    </div>
                
                :itemBox.position === "left" ?
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            transform: "translateX(100%)",
                            backgroundColor: itemBox.boxStyle.backgroundColor
                        }}
                        onClick={toggleExpand}
                    >
                        {expand ? <ChevronLeft /> : <ChevronRight />}
                    </div>

                :itemBox.position === "top" ?
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            transform: "translateY(100%)",
                            backgroundColor: itemBox.boxStyle.backgroundColor
                        }}
                        onClick={toggleExpand}
                    >
                        {expand ? <ChevronUp /> : <ChevronDown />}
                    </div>

                :itemBox.position === "bottom" ?
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transform: "translateY(-100%)",
                            backgroundColor: itemBox.boxStyle.backgroundColor
                        }}
                        onClick={toggleExpand}
                    >
                        {expand ? <ChevronDown /> : <ChevronUp />}
                    </div>

                : null
                
            }
        </div>
        </>
    )
}

export default memo(ItemBox);