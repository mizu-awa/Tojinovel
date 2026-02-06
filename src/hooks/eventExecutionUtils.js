/**
 * useEventExecution から切り出したユーティリティ関数
 * イベント実行に必要な純粋関数群
 */

/**
 * 数値に変換できる場合変換する関数
 * @param {*} value - 変換する値
 * @returns {number|*} - 数値に変換できれば数値、できなければ元の値
 */
export function parseIfNumber(value) {
    // 空文字や null, undefined はそのまま返す
    if (value === "" || value == null) return value;

    // 数値として変換できるか確認
    const num = Number(value);

    // NaN でないなら数値と判断
    return isNaN(num) ? value : num;
}

/**
 * 変数・数値・文字列リテラルを判定してパースする
 * @param {string} str - パースする文字列
 * @param {Array<{name: string, value: *}>} variables - 変数の配列
 * @returns {number|string} - パースした値
 */
export function parseOperand(str, variables) {
    str = str.trim();

    // 数値
    if (!isNaN(Number(str))) {
        return Number(str);
    }

    // 文字列リテラル（"abc" または 'abc'）
    if (/^".*"$/.test(str) || /^'.*'$/.test(str)) {
        return str.slice(1, -1);
    }

    // それ以外は変数名として扱う
    const variable = variables.find((v) => v.name === str);
    if(variable){
        return parseIfNumber(variable.value);
    }

    return str;
}

/**
 * 条件式をパースして評価する
 * @param {string} cond - 条件式（例: "score > 10"）
 * @param {Array<{name: string, value: *}>} variables - 変数の配列
 * @returns {boolean} - 条件式の評価結果
 * @throws {Error} - 不正な条件式の場合
 */
export function evalCondition(cond, variables) {
    // 左辺/右辺/演算子に分解
    const regex = /^(.+?)\s*(==|!=|<=|>=|<|>)\s*(.+)$/;

    const match = cond.match(regex);
    if (!match) throw new Error(`不正な条件式: ${cond}`);

    const [, leftRaw, op, rightRaw] = match;
    const leftVal = parseOperand(leftRaw, variables);
    const rightVal = parseOperand(rightRaw, variables);

    switch (op) {
        case "==": return leftVal == rightVal;
        case "!=": return leftVal != rightVal;
        case "<":  return leftVal < rightVal;
        case ">":  return leftVal > rightVal;
        case "<=": return leftVal <= rightVal;
        case ">=": return leftVal >= rightVal;
        default: throw new Error(`未知の演算子: ${op}`);
    }
}

/**
 * フラグ式をパースして実行する
 * @param {Array<{name: string, value: *}>} variables - 変数の配列（破壊的に更新される）
 * @param {string} formula - 式（例: "score + 10"）
 * @returns {Array<{name: string, value: *}>} - 更新後の変数配列
 * @throws {Error} - 不正な数式の場合
 */
export function calcFlag(variables, formula){
    const regex = /^(.+?)\s*(\+|-|=|\*|\/|%)\s*(.+)$/;
    const match = formula.match(regex);
    if (!match) throw new Error(`不正な数式: ${formula}`);

    const [, left, op, rightRaw] = match;
    const rightVal = parseOperand(rightRaw, variables);

    const leftIndex = variables.findIndex(v => v.name === left);
    if(leftIndex !== -1){
        const leftVar = variables[leftIndex];
        const leftVal = parseIfNumber(leftVar.value);
        switch(op){
            case "+":  variables[leftIndex].value = leftVal + rightVal; break;
            case "-": variables[leftIndex].value = leftVal - rightVal; break;
            case "*": variables[leftIndex].value = leftVal * rightVal; break;
            case "/": variables[leftIndex].value = Math.floor(leftVal / rightVal); break;
            case "%": variables[leftIndex].value = leftVal % rightVal; break;
            case "=": variables[leftIndex].value = rightVal; break;
        }
    }
    else if(op === "="){// 無い場合は変数を追加する（テキストでも変数定義可能）
        variables.push({name: left, value: rightVal});
    }

    return variables;
}

/**
 * 乱数を返す関数
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} - 両端含む整数 [min, max]
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 変数に乱数を格納する
 * @param {Array<{name: string, value: *}>} variables - 変数の配列
 * @param {string} varName - 乱数を格納する変数名
 * @param {number|string} min - 最小値
 * @param {number|string} max - 最大値
 * @returns {Array<{name: string, value: *}>} - 更新後の変数配列
 */
export function random(variables, varName, min, max) {
    // 数値化（NaNの場合も考慮してデフォルト値を設定）
    const minNum = Number(min);
    const maxNum = Number(max);

    // 無効な値だった場合のフォールバック（例: min > max や NaN）
    const safeMin = isNaN(minNum) ? 0 : minNum;
    const safeMax = isNaN(maxNum) ? safeMin + 1 : Math.max(safeMin, maxNum);

    const index = variables.findIndex(v => v.name === varName);
    if (index !== -1) {
        variables[index].value = randomInt(safeMin, safeMax);
    }
    return variables;
}

/**
 * 文字列中の変数参照を展開する
 * @param {string} str - 展開する文字列（例: "スコアは[score]です"）
 * @param {Array<{name: string, value: *}>} vars - 変数の配列
 * @returns {string} - 変数が展開された文字列
 */
export function expandVars(str, vars) {
    return str.replace(/\[([^\]]+)\]/g, (_, name) => {
        const variable = vars.find(v => v.name === name);
        return variable ? variable.value : `[${name}]`;
    });
}

/**
 * オブジェクトの各プロパティの変数参照を展開する（浅い展開）
 * @param {Object} block - 展開するオブジェクト
 * @param {Array<{name: string, value: *}>} vars - 変数の配列
 * @returns {Object} - 変数が展開されたオブジェクト
 */
export function expandVarsShallow(block, vars) {
    const result = {};

    for (const key in block) {
        const value = block[key];

        if (typeof value === "string") {
            // 値が文字列なら直接展開
            result[key] = expandVars(value, vars);
        }
        else if (Array.isArray(value)) {
            // 1次元配列の場合 → 各要素が文字列である前提なので展開
            result[key] = value.map(s => expandVars(s, vars));
        }
        else {
            // 文字列でも配列でもない → そのまま（基本このケースは無い）
            result[key] = value;
        }
    }

    return result;
}

/**
 * セリフ文を1文字ずつに解体する（ハイライト情報付き）
 * @param {string} text - 解体する文字列
 * @returns {Array<{char: string, highlight: boolean}>} - 文字配列
 */
export function parseLineText(text) {
    let highlight = false;

    let result = [];

    for (const ch of text) {
        if(ch === '"'){
            highlight = !highlight; // 反転
        }
        else{
            result.push({char: ch, highlight: highlight});
        }
    }

    return result;
}
