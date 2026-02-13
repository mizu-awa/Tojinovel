import {
    parseIfNumber,
    parseOperand,
    evalCondition,
    evalCompoundCondition,
    checkOverlap,
    calcFlag,
    randomInt,
    random,
    expandVars,
    expandVarsShallow,
    parseLineText
} from './eventExecutionUtils.js';

describe('eventExecutionUtils', () => {
    // parseIfNumber のテスト
    describe('parseIfNumber', () => {
        it('数値文字列を数値に変換する', () => {
            expect(parseIfNumber('42')).toBe(42);
            expect(parseIfNumber('3.14')).toBe(3.14);
            expect(parseIfNumber('-10')).toBe(-10);
        });

        it('数値はそのまま返す', () => {
            expect(parseIfNumber(42)).toBe(42);
            expect(parseIfNumber(0)).toBe(0);
        });

        it('数値に変換できない文字列はそのまま返す', () => {
            expect(parseIfNumber('hello')).toBe('hello');
            expect(parseIfNumber('abc123')).toBe('abc123');
        });

        it('空文字、null、undefined はそのまま返す', () => {
            expect(parseIfNumber('')).toBe('');
            expect(parseIfNumber(null)).toBe(null);
            expect(parseIfNumber(undefined)).toBe(undefined);
        });
    });

    // parseOperand のテスト
    describe('parseOperand', () => {
        const variables = [
            { name: 'score', value: '100' },
            { name: 'name', value: 'テスト' },
            { name: 'count', value: 5 }
        ];

        it('数値リテラルをパースする', () => {
            expect(parseOperand('42', variables)).toBe(42);
            expect(parseOperand('  100  ', variables)).toBe(100);
            expect(parseOperand('-5', variables)).toBe(-5);
        });

        it('ダブルクォートの文字列リテラルをパースする', () => {
            expect(parseOperand('"hello"', variables)).toBe('hello');
            expect(parseOperand('"テスト"', variables)).toBe('テスト');
        });

        it('シングルクォートの文字列リテラルをパースする', () => {
            expect(parseOperand("'world'", variables)).toBe('world');
        });

        it('変数名から値を取得する', () => {
            expect(parseOperand('score', variables)).toBe(100);
            expect(parseOperand('name', variables)).toBe('テスト');
            expect(parseOperand('count', variables)).toBe(5);
        });

        it('存在しない変数名はそのまま返す', () => {
            expect(parseOperand('unknown', variables)).toBe('unknown');
        });
    });

    // evalCondition のテスト
    describe('evalCondition', () => {
        const variables = [
            { name: 'score', value: '100' },
            { name: 'level', value: '5' },
            { name: 'flag', value: '1' }
        ];

        it('== 演算子を評価する', () => {
            expect(evalCondition('score == 100', variables)).toBe(true);
            expect(evalCondition('score == 50', variables)).toBe(false);
            expect(evalCondition('flag == 1', variables)).toBe(true);
        });

        it('!= 演算子を評価する', () => {
            expect(evalCondition('score != 50', variables)).toBe(true);
            expect(evalCondition('score != 100', variables)).toBe(false);
        });

        it('> 演算子を評価する', () => {
            expect(evalCondition('score > 50', variables)).toBe(true);
            expect(evalCondition('score > 100', variables)).toBe(false);
            expect(evalCondition('score > 150', variables)).toBe(false);
        });

        it('< 演算子を評価する', () => {
            expect(evalCondition('score < 150', variables)).toBe(true);
            expect(evalCondition('score < 100', variables)).toBe(false);
            expect(evalCondition('score < 50', variables)).toBe(false);
        });

        it('>= 演算子を評価する', () => {
            expect(evalCondition('score >= 100', variables)).toBe(true);
            expect(evalCondition('score >= 50', variables)).toBe(true);
            expect(evalCondition('score >= 150', variables)).toBe(false);
        });

        it('<= 演算子を評価する', () => {
            expect(evalCondition('score <= 100', variables)).toBe(true);
            expect(evalCondition('score <= 150', variables)).toBe(true);
            expect(evalCondition('score <= 50', variables)).toBe(false);
        });

        it('変数同士を比較できる', () => {
            expect(evalCondition('score > level', variables)).toBe(true);
            expect(evalCondition('level < score', variables)).toBe(true);
        });

        it('文字列リテラルと比較できる', () => {
            const vars = [{ name: 'status', value: 'active' }];
            expect(evalCondition('status == "active"', vars)).toBe(true);
            expect(evalCondition('status == "inactive"', vars)).toBe(false);
        });

        it('不正な条件式でエラーをスローする', () => {
            expect(() => evalCondition('invalid', variables)).toThrow('不正な条件式');
        });

        it('>< 演算子でホットスポットの重なりを判定する', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 100, height: 100 }] },
                { name: 'B', state: 's1', states: [{ name: 's1', visibility: true, x: 50, y: 50, width: 100, height: 100 }] },
                { name: 'C', state: 's1', states: [{ name: 's1', visibility: true, x: 200, y: 200, width: 50, height: 50 }] },
            ];
            expect(evalCondition('A >< B', [], hotspots)).toBe(true);
            expect(evalCondition('A >< C', [], hotspots)).toBe(false);
            expect(evalCondition('B >< C', [], hotspots)).toBe(false);
        });

        it('>< 演算子で非表示ステートは偽になる', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 100, height: 100 }] },
                { name: 'B', state: 's1', states: [{ name: 's1', visibility: false, x: 50, y: 50, width: 100, height: 100 }] },
            ];
            expect(evalCondition('A >< B', [], hotspots)).toBe(false);
        });

        it('>< 演算子で存在しないホットスポットは偽になる', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 100, height: 100 }] },
            ];
            expect(evalCondition('A >< NotExist', [], hotspots)).toBe(false);
        });
    });

    // evalCompoundCondition のテスト
    describe('evalCompoundCondition', () => {
        const variables = [
            { name: 'score', value: '100' },
            { name: 'level', value: '5' },
            { name: 'flag', value: '1' },
            { name: 'key', value: '1' },
            { name: 'door', value: '0' }
        ];

        it('単一条件はevalConditionと同じ結果を返す', () => {
            expect(evalCompoundCondition('score == 100', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50', variables)).toBe(false);
        });

        it('「かつ」でAND条件を評価する', () => {
            expect(evalCompoundCondition('score == 100 かつ level == 5', variables)).toBe(true);
            expect(evalCompoundCondition('score == 100 かつ level == 10', variables)).toBe(false);
            expect(evalCompoundCondition('score == 50 かつ level == 5', variables)).toBe(false);
        });

        it('&&でAND条件を評価する', () => {
            expect(evalCompoundCondition('score == 100 && level == 5', variables)).toBe(true);
            expect(evalCompoundCondition('score == 100 && level == 10', variables)).toBe(false);
        });

        it('「または」でOR条件を評価する', () => {
            expect(evalCompoundCondition('score == 100 または level == 10', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50 または level == 5', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50 または level == 10', variables)).toBe(false);
        });

        it('||でOR条件を評価する', () => {
            expect(evalCompoundCondition('score == 100 || level == 10', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50 || level == 10', variables)).toBe(false);
        });

        it('ANDはORより優先される', () => {
            // key==1 かつ door==0 → true, score==50は偽だが OR で true
            expect(evalCompoundCondition('score == 50 または key == 1 かつ door == 0', variables)).toBe(true);
            // score==50 かつ level==5 → false, key==1は真なので OR で true
            expect(evalCompoundCondition('score == 50 かつ level == 5 または key == 1', variables)).toBe(true);
            // 両方のOR部分が偽
            expect(evalCompoundCondition('score == 50 かつ level == 5 または key == 0 かつ door == 0', variables)).toBe(false);
        });

        it('3つ以上のAND条件を評価する', () => {
            expect(evalCompoundCondition('score == 100 かつ level == 5 かつ flag == 1', variables)).toBe(true);
            expect(evalCompoundCondition('score == 100 かつ level == 5 かつ flag == 0', variables)).toBe(false);
        });

        it('3つ以上のOR条件を評価する', () => {
            expect(evalCompoundCondition('score == 50 または level == 10 または flag == 1', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50 または level == 10 または flag == 0', variables)).toBe(false);
        });

        it('かつと&&、またはと||を混在できる', () => {
            expect(evalCompoundCondition('score == 100 && level == 5', variables)).toBe(true);
            expect(evalCompoundCondition('score == 50 || level == 5', variables)).toBe(true);
        });
    });

    // checkOverlap のテスト
    describe('checkOverlap', () => {
        it('重なっている矩形を検出する', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 100, height: 100 }] },
                { name: 'B', state: 's1', states: [{ name: 's1', visibility: true, x: 50, y: 50, width: 100, height: 100 }] },
            ];
            expect(checkOverlap('A', 'B', hotspots)).toBe(true);
        });

        it('重なっていない矩形を検出する', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 50, height: 50 }] },
                { name: 'B', state: 's1', states: [{ name: 's1', visibility: true, x: 100, y: 100, width: 50, height: 50 }] },
            ];
            expect(checkOverlap('A', 'B', hotspots)).toBe(false);
        });

        it('辺が接しているだけでは重ならない', () => {
            const hotspots = [
                { name: 'A', state: 's1', states: [{ name: 's1', visibility: true, x: 0, y: 0, width: 100, height: 100 }] },
                { name: 'B', state: 's1', states: [{ name: 's1', visibility: true, x: 100, y: 0, width: 100, height: 100 }] },
            ];
            expect(checkOverlap('A', 'B', hotspots)).toBe(false);
        });

        it('空の hotspots 配列で偽を返す', () => {
            expect(checkOverlap('A', 'B', [])).toBe(false);
            expect(checkOverlap('A', 'B', null)).toBe(false);
        });
    });

    // calcFlag のテスト
    describe('calcFlag', () => {
        it('= で値を代入する', () => {
            const variables = [{ name: 'score', value: '0' }];
            calcFlag(variables, 'score = 100');
            expect(variables[0].value).toBe(100);
        });

        it('+ で加算する', () => {
            const variables = [{ name: 'score', value: '50' }];
            calcFlag(variables, 'score + 10');
            expect(variables[0].value).toBe(60);
        });

        it('- で減算する', () => {
            const variables = [{ name: 'score', value: '50' }];
            calcFlag(variables, 'score - 10');
            expect(variables[0].value).toBe(40);
        });

        it('* で乗算する', () => {
            const variables = [{ name: 'score', value: '5' }];
            calcFlag(variables, 'score * 3');
            expect(variables[0].value).toBe(15);
        });

        it('/ で切り捨て除算する', () => {
            const variables = [{ name: 'score', value: '10' }];
            calcFlag(variables, 'score / 3');
            expect(variables[0].value).toBe(3);
        });

        it('% で剰余を計算する', () => {
            const variables = [{ name: 'score', value: '10' }];
            calcFlag(variables, 'score % 3');
            expect(variables[0].value).toBe(1);
        });

        it('+ で文字列を連結する', () => {
            const variables = [{ name: 'name', value: 'hello' }];
            calcFlag(variables, 'name + "world"');
            expect(variables[0].value).toBe('helloworld');
        });

        it('存在しない変数を = で新規作成する', () => {
            const variables = [];
            calcFlag(variables, 'newVar = 42');
            expect(variables).toHaveLength(1);
            expect(variables[0]).toEqual({ name: 'newVar', value: 42 });
        });

        it('変数の値を使って計算できる', () => {
            const variables = [
                { name: 'a', value: '10' },
                { name: 'b', value: '5' }
            ];
            calcFlag(variables, 'a + b');
            expect(variables[0].value).toBe(15);
        });

        it('不正な数式でエラーをスローする', () => {
            const variables = [];
            expect(() => calcFlag(variables, 'invalid')).toThrow('不正な数式');
        });
    });

    // randomInt のテスト
    describe('randomInt', () => {
        it('指定範囲内の整数を返す', () => {
            for (let i = 0; i < 100; i++) {
                const result = randomInt(1, 10);
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(10);
                expect(Number.isInteger(result)).toBe(true);
            }
        });

        it('min と max が同じ場合はその値を返す', () => {
            expect(randomInt(5, 5)).toBe(5);
        });
    });

    // random のテスト
    describe('random', () => {
        it('変数に乱数を格納する', () => {
            const variables = [{ name: 'rand', value: '0' }];
            random(variables, 'rand', 1, 100);
            expect(variables[0].value).toBeGreaterThanOrEqual(1);
            expect(variables[0].value).toBeLessThanOrEqual(100);
        });

        it('存在しない変数には何もしない', () => {
            const variables = [{ name: 'other', value: '0' }];
            random(variables, 'notexist', 1, 100);
            expect(variables[0].value).toBe('0');
        });

        it('文字列の数値を正しく処理する', () => {
            const variables = [{ name: 'rand', value: '0' }];
            random(variables, 'rand', '5', '10');
            expect(variables[0].value).toBeGreaterThanOrEqual(5);
            expect(variables[0].value).toBeLessThanOrEqual(10);
        });

        it('NaNの場合はフォールバック値を使う', () => {
            const variables = [{ name: 'rand', value: '0' }];
            random(variables, 'rand', 'invalid', 'also_invalid');
            // safeMin = 0, safeMax = 1 になる
            expect(variables[0].value).toBeGreaterThanOrEqual(0);
            expect(variables[0].value).toBeLessThanOrEqual(1);
        });
    });

    // expandVars のテスト
    describe('expandVars', () => {
        const variables = [
            { name: 'name', value: '太郎' },
            { name: 'score', value: 100 }
        ];

        it('変数を展開する', () => {
            expect(expandVars('こんにちは、[name]さん', variables)).toBe('こんにちは、太郎さん');
            expect(expandVars('スコア: [score]点', variables)).toBe('スコア: 100点');
        });

        it('複数の変数を展開する', () => {
            expect(expandVars('[name]のスコアは[score]です', variables)).toBe('太郎のスコアは100です');
        });

        it('存在しない変数はそのまま残す', () => {
            expect(expandVars('[unknown]', variables)).toBe('[unknown]');
        });

        it('変数がない文字列はそのまま返す', () => {
            expect(expandVars('変数なし', variables)).toBe('変数なし');
        });
    });

    // expandVarsShallow のテスト
    describe('expandVarsShallow', () => {
        const variables = [
            { name: 'name', value: '太郎' },
            { name: 'item', value: '鍵' }
        ];

        it('オブジェクトの文字列プロパティを展開する', () => {
            const block = { message: '[name]が[item]を取得した' };
            const result = expandVarsShallow(block, variables);
            expect(result.message).toBe('太郎が鍵を取得した');
        });

        it('配列プロパティの各要素を展開する', () => {
            const block = { options: ['[name]に渡す', '[item]を使う'] };
            const result = expandVarsShallow(block, variables);
            expect(result.options).toEqual(['太郎に渡す', '鍵を使う']);
        });

        it('文字列でも配列でもないプロパティはそのまま', () => {
            const block = { count: 5, flag: true };
            const result = expandVarsShallow(block, variables);
            expect(result.count).toBe(5);
            expect(result.flag).toBe(true);
        });
    });

    // parseLineText のテスト
    describe('parseLineText', () => {
        it('文字列を1文字ずつに分解する', () => {
            const result = parseLineText('ABC');
            expect(result).toEqual([
                { char: 'A', highlight: false },
                { char: 'B', highlight: false },
                { char: 'C', highlight: false }
            ]);
        });

        it('ダブルクォートで囲まれた部分をハイライトする', () => {
            const result = parseLineText('普通"強調"普通');
            expect(result).toEqual([
                { char: '普', highlight: false },
                { char: '通', highlight: false },
                { char: '強', highlight: true },
                { char: '調', highlight: true },
                { char: '普', highlight: false },
                { char: '通', highlight: false }
            ]);
        });

        it('複数のハイライト領域を処理する', () => {
            const result = parseLineText('A"B"C"D"E');
            expect(result).toEqual([
                { char: 'A', highlight: false },
                { char: 'B', highlight: true },
                { char: 'C', highlight: false },
                { char: 'D', highlight: true },
                { char: 'E', highlight: false }
            ]);
        });

        it('空文字列は空配列を返す', () => {
            expect(parseLineText('')).toEqual([]);
        });
    });
});
