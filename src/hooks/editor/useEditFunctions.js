import { useCallback, useRef } from "react";
import { defaultCharacterData, defaultExpressionData, defaultHotspotData, defaultItemData, defaultSceneData, defaultStateData, defaultUsedItemData } from "../../datas/defaultGameData";

export default function useEditFunctions({
    gameDataRef, handleAddArrayItem, handleDeleteKey,
    selectedItem, setSelectedItem, selectedSubItem, setSelectedSubItem, selectedThirdItem, setSelectedThirdItem,
    mainTab
}){
    const copyRef = useRef(null);


    const addCharacter = useCallback((data=defaultCharacterData) => {
        if (data && data.nativeEvent) {
            data = defaultCharacterData;
        }

        handleAddArrayItem("characters", data);
        setSelectedItem(gameDataRef.current.characters.length);
    }, [handleAddArrayItem, setSelectedItem])

    const copyCharacter = useCallback(() => {
        if(gameDataRef.current.characters[selectedItem]){

        handleAddArrayItem("characters", gameDataRef.current.characters[selectedItem]);
        setSelectedItem(gameDataRef.current.characters.length);
        }
    },[selectedItem, handleAddArrayItem, setSelectedItem])

    const deleteCharacter = useCallback(() => {
        if(gameDataRef.current.characters[selectedItem]){

        handleDeleteKey(`characters.${selectedItem}`);
        setSelectedItem(Math.min(gameDataRef.current.characters.length - 2, selectedItem));
        }
    },[handleDeleteKey, setSelectedItem, selectedItem])

    const addExpression = useCallback((data=defaultExpressionData) => {
        if(gameDataRef.current.characters[selectedItem]){
            if (data && data.nativeEvent) {
                data = defaultExpressionData;
            }
    
            handleAddArrayItem(`characters.${selectedItem}.expressions`, data);
            setSelectedSubItem(gameDataRef.current.characters[selectedItem].expressions.length);
            }
    },[ handleAddArrayItem, setSelectedSubItem, selectedItem ])

    const copyExpression = useCallback(() => {
        if(gameDataRef.current.characters[selectedItem]?.expressions[selectedSubItem]){

        handleAddArrayItem(
            `characters.${selectedItem}.expressions`,
            gameDataRef.current.characters[selectedItem].expressions[selectedSubItem]
        );
        setSelectedSubItem(gameDataRef.current.characters[selectedItem].expressions.length);
        }
    },[handleAddArrayItem, setSelectedSubItem, selectedItem, selectedSubItem])

    const deleteExpression = useCallback(() => {
        if(gameDataRef.current.characters[selectedItem]?.expressions[selectedSubItem]){

        handleDeleteKey(`characters.${selectedItem}.expressions.${selectedSubItem}`);
        setSelectedSubItem(Math.min(gameDataRef.current.characters[selectedItem].expressions.length - 2, selectedSubItem));
        }
    },[handleDeleteKey, setSelectedSubItem, selectedItem, selectedSubItem])

    const addScene = useCallback((data=defaultSceneData) => {
        if (data && data.nativeEvent) {
            data = defaultSceneData;
        }

        handleAddArrayItem("scenes", data);
        setSelectedItem(gameDataRef.current.scenes.length);
    },[handleAddArrayItem, setSelectedItem])

    const copyScene = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]){

        handleAddArrayItem("scenes", gameDataRef.current.scenes[selectedItem]);
        setSelectedItem(gameDataRef.current.scenes.length);
        }
    },[handleAddArrayItem, setSelectedItem,selectedItem])

    const deleteScene = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]){

        handleDeleteKey(`scenes.${selectedItem}`);
        setSelectedItem(Math.min(gameDataRef.current.scenes.length - 2, selectedItem));
        }
    },[handleDeleteKey, setSelectedItem, selectedItem])

    const addItem = useCallback((data=defaultItemData) => {
        if (data && data.nativeEvent) {
            data = defaultItemData;
        }

        handleAddArrayItem("items", data);
        setSelectedItem(gameDataRef.current.items.length);
    },[handleAddArrayItem, setSelectedItem])

    const copyItem = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]){

        handleAddArrayItem("items", gameDataRef.current.items[selectedItem]);
        setSelectedItem(gameDataRef.current.items.length);
        }
    },[handleAddArrayItem, setSelectedItem, selectedItem])

    const deleteItem = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]){

        handleDeleteKey(`items.${selectedItem}`);
        setSelectedItem(Math.min(gameDataRef.current.items.length - 2, selectedItem));
        }
    },[handleDeleteKey, setSelectedItem, selectedItem])

    const addHotspot = useCallback((data=defaultHotspotData) => {
        if(gameDataRef.current.scenes[selectedItem]){
            if (data && data.nativeEvent) {
                data = defaultHotspotData;
            }
    
            handleAddArrayItem(`scenes.${selectedItem}.hotspots`, data);
            setSelectedSubItem(gameDataRef.current.scenes[selectedItem].hotspots.length);
        }
    }, [handleAddArrayItem, setSelectedSubItem, selectedItem])

    const copyHotspot = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]){

        handleAddArrayItem(`scenes.${selectedItem}.hotspots`, structuredClone(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]));
        setSelectedSubItem(gameDataRef.current.scenes[selectedItem].hotspots.length);
        }
    }, [handleAddArrayItem, setSelectedSubItem, selectedItem, selectedSubItem])

    const deleteHotspot = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]){

        handleDeleteKey(`scenes.${selectedItem}.hotspots.${selectedSubItem}`);
        setSelectedSubItem(Math.min((gameDataRef.current.scenes[selectedItem].hotspots.length) - 2, selectedSubItem));
        }
    }, [handleDeleteKey, setSelectedSubItem, selectedItem, selectedSubItem])

    const addState = useCallback((data=defaultStateData) => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]){
            if (data && data.nativeEvent) {
                data = defaultStateData;
            }
    
            handleAddArrayItem(`scenes.${selectedItem}.hotspots.${selectedSubItem}.states`, data);
            setSelectedThirdItem(gameDataRef.current.scenes[selectedItem].hotspots[selectedSubItem].states.length);
        }
    },[handleAddArrayItem, setSelectedThirdItem, selectedItem, selectedSubItem])

    const copyState = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]){

        handleAddArrayItem(`scenes.${selectedItem}.hotspots.${selectedSubItem}.states`, gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]);
        setSelectedThirdItem(gameDataRef.current.scenes[selectedItem].hotspots[selectedSubItem].states.length);
        }
    },[handleAddArrayItem, setSelectedThirdItem, selectedItem, selectedSubItem, selectedThirdItem])

    const deleteState = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]){

        handleDeleteKey(`scenes.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}`);
        setSelectedThirdItem(Math.min((gameDataRef.current.scenes[selectedItem].hotspots[selectedSubItem].states.length ?? 0) - 2, selectedThirdItem));
        }
    },[handleDeleteKey, setSelectedThirdItem, selectedItem, selectedSubItem, selectedThirdItem])

    const addItemHotspot = useCallback((data=defaultHotspotData) => {
        if(gameDataRef.current.items[selectedItem]){
            if (data && data.nativeEvent) {
                data = defaultHotspotData;
            }
    
            handleAddArrayItem(`items.${selectedItem}.hotspots`, data);
            setSelectedSubItem(gameDataRef.current.items[selectedItem].hotspots.length);
        }
    }, [handleAddArrayItem, setSelectedSubItem, selectedItem])

    const copyItemHotspot = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]){

        handleAddArrayItem(`items.${selectedItem}.hotspots`, structuredClone(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]));
        setSelectedSubItem(gameDataRef.current.items[selectedItem].hotspots.length);
        }
    }, [handleAddArrayItem, setSelectedSubItem, selectedItem, selectedSubItem])

    const deleteItemHotspot = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]){

        handleDeleteKey(`items.${selectedItem}.hotspots.${selectedSubItem}`);
        setSelectedSubItem(Math.min(gameDataRef.current.items[selectedItem].hotspots.length - 2, selectedSubItem));
        }
    }, [handleDeleteKey, setSelectedSubItem, selectedItem, selectedSubItem])

    const addItemState = useCallback((data=defaultStateData) => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]){
            if (data && data.nativeEvent) {
                data = defaultStateData;
            }
    
            handleAddArrayItem(`items.${selectedItem}.hotspots.${selectedSubItem}.states`, data);
            setSelectedThirdItem(gameDataRef.current.items[selectedItem].hotspots[selectedSubItem].states.length);
        }
    },[handleAddArrayItem, setSelectedThirdItem, selectedItem, selectedSubItem])

    const copyItemState = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]){

        handleAddArrayItem(`items.${selectedItem}.hotspots.${selectedSubItem}.states`, gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]);
        setSelectedThirdItem(gameDataRef.current.items[selectedItem].hotspots[selectedSubItem]);
        }
    },[handleAddArrayItem, setSelectedThirdItem, selectedItem, selectedSubItem, selectedThirdItem])

    const deleteItemState = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]){

        handleDeleteKey(`items.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}`);
        setSelectedThirdItem(Math.min(gameDataRef.current.items[selectedItem].hotspots[selectedSubItem].states.length - 2, selectedThirdItem));
        }
    },[handleDeleteKey, setSelectedThirdItem, selectedItem, selectedSubItem, selectedThirdItem])

    const addUsedItem = useCallback(() => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]?.usedItems){

        handleAddArrayItem(`scenes.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}.usedItems`, defaultUsedItemData);
        }
    }, [handleAddArrayItem, selectedItem, selectedSubItem, selectedThirdItem])

    const deleteUsedItem = useCallback((index) => {
        if(gameDataRef.current.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]?.usedItems[index]){

        handleDeleteKey(`scenes.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}.usedItems.${index}`);
        }
    },[handleDeleteKey, selectedItem, selectedSubItem, selectedThirdItem])

    const addUsedItemItem = useCallback(() => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]?.usedItems){

        handleAddArrayItem(`items.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}.usedItems`, defaultUsedItemData);
        }
    }, [handleAddArrayItem, selectedItem, selectedSubItem, selectedThirdItem])

    const deleteUsedItemItem = useCallback((index) => {
        if(gameDataRef.current.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem]?.usedItems[index]){

        handleDeleteKey(`items.${selectedItem}.hotspots.${selectedSubItem}.states.${selectedThirdItem}.usedItems.${index}`);
        }
    },[handleDeleteKey, selectedItem, selectedSubItem, selectedThirdItem])

    // キーを使った削除
    const deleteByKey = useCallback(() => {
        if(selectedThirdItem !== null){
            if(mainTab === "scenes"){
                deleteState();
            }
            else if(mainTab === "items"){
                deleteItemState();
            }
        }
        else if(selectedSubItem !== null){
            if(mainTab === "characters"){
                deleteExpression();
            }
            else if(mainTab === "scenes"){
                deleteHotspot();
            }
            else if(mainTab === "items"){
                deleteItemHotspot();
            }
        }
        else if(selectedItem !== null){
            if(mainTab === "scenes"){
                deleteScene();
            }
            else if(mainTab === "items"){
                deleteItem();
            }
            else if(mainTab === "characters"){
                deleteCharacter();
            }
        }
    },[selectedItem, selectedSubItem, selectedThirdItem,
        deleteState, deleteItemState, deleteExpression, deleteHotspot, deleteItemHotspot, deleteScene, deleteItem, deleteCharacter])


    // コピー＆ペースト-----------------------------------------------------------------------------------
    const copy = useCallback((type) => {
        let data = null;
        
        if(type === "character"){
            data = gameDataRef.current?.characters[selectedItem];
        }
        else if(type === "expression"){
            data = gameDataRef.current?.characters[selectedItem]?.expressions[selectedSubItem];
        }
        else if(type === "scene"){
            data = gameDataRef.current?.scenes[selectedItem];
        }
        else if(type === "item"){
            data = gameDataRef.current?.items[selectedItem] ;
        }
        else if(type === "sceneHotspot"){
            data = gameDataRef.current?.scenes[selectedItem]?.hotspots[selectedSubItem];
        }
        else if(type === "itemHotspot"){
            data = gameDataRef.current?.items[selectedItem]?.hotspots[selectedSubItem];
        }
        else if(type === "sceneState"){
            data = gameDataRef.current?.scenes[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem];
        }
        else if(type === "itemState"){
            data = gameDataRef.current?.items[selectedItem]?.hotspots[selectedSubItem]?.states[selectedThirdItem];
        }

        if(data !== null && data !== undefined){
            copyRef.current = { type: type, data: data };
        }
        else{
            /* コピーできないものをコピーした場合、何もしない（それまでのコピー状態を保持） */
            console.error("コピー失敗 type:" + type);
        }

    },[selectedItem, selectedSubItem, selectedThirdItem]);

    const copyBykey = useCallback(() => {
        if(selectedThirdItem !== null){
            if(mainTab === "scenes"){
                copy("sceneState");
            }
            else if(mainTab === "items"){
                copy("itemState");
            }
        }
        else if(selectedSubItem !== null){
            if(mainTab === "characters"){
                copy("expression")
            }
            else if(mainTab === "scenes"){
                copy("sceneHotspot");
            }
            else if(mainTab === "items"){
                copy("itemHotspot");
            }
        }
        else if(selectedItem !== null){
            if(mainTab === "scenes"){
                copy("scene");
            }
            else if(mainTab === "items"){
                copy("item");
            }
            else if(mainTab === "characters"){
                copy("character");
            }
        }
    },[mainTab, selectedItem, selectedSubItem, selectedThirdItem,copy])

    const paste = useCallback((type) => {
        if(copyRef.current && (
            type === copyRef.current.type
            || ( type.includes("Hotspot") && copyRef.current.type.includes("Hotspot"))
            || ( type.includes("State") && copyRef.current.type.includes("State"))
        )){
            if(type === "character"){
                addCharacter(copyRef.current.data);
            }
            else if(type === "expression"){
                addExpression(copyRef.current.data);
            }
            else if(type === "scene"){
                addScene(copyRef.current.data);
            }
            else if(type === "item"){
                addItem(copyRef.current.data);
            }
            else if(type === "sceneHotspot"){
                addHotspot(structuredClone(copyRef.current.data));
            }
            else if(type === "itemHotspot"){
                addItemHotspot(structuredClone(copyRef.current.data));
            }
            else if(type === "sceneState"){
                addState(copyRef.current.data);
            }
            else if(type === "itemState"){
                addItemState(copyRef.current.data);
            }
        }
    }, [addCharacter,addExpression,addScene,addItem,addHotspot,addItemHotspot,addState,addItemState])

    const pasteByKey = useCallback(() => {
        const type = copyRef.current?.type;
        if(type !== undefined){
            if(mainTab === "characters"){
                if(type ===  "character" || type === "expression"){
                    paste(type);
                }
            }
            else if(mainTab === "scenes"){
                if(type.includes("scene")){
                    paste(type);
                }
            }
            else if(mainTab === "items"){
                if(type.includes("item")){
                    paste(type);
                }
            }
        }
    }, [paste])

    return({
        addCharacter,
        copyCharacter,
        deleteCharacter,
        addExpression,
        copyExpression,
        deleteExpression,
        addScene,
        copyScene,
        deleteScene,
        addItem,
        copyItem,
        deleteItem,
        addHotspot,
        copyHotspot,
        deleteHotspot,
        addState,
        copyState,
        deleteState,
        addItemHotspot,
        copyItemHotspot,
        deleteItemHotspot,
        addItemState,
        copyItemState,
        deleteItemState,
        addUsedItem,
        deleteUsedItem,
        addUsedItemItem,
        deleteUsedItemItem,
        copy,
        paste,
        copyBykey,
        pasteByKey,
        deleteByKey
    })
}