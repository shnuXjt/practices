export function deconstruct(number) {
    // 数值 = 符号位 * 系数 * （ 2 ** 指数）
    let sign = 1;
    let coefficient = number;
    let exponent = 0;

    // 从系数中提取符号
    if(coefficient < 0) {
        coefficient = -coefficient;
        sign = -1;
    }

    if (Number.isFinite(number) && number !== 0) {
        exponent = -1128; // -1128就是Number.MIN_VALUE 的指数减去有效位数再减去奖励位的结果。
        let reduction = coefficient;
        while (reduction !== 0 ) {
            exponent += 1;
            reduction /= 2;
        }

        reduction = exponent;
        while(reduction > 0) {
            coefficient /= 2;
            reduction -= 1;
        }

        while(reduction < 0) {
            coefficient *= 2;
            reduction += 1;
        }

    }

    return {
        sign,
        coefficient,
        exponent,
        number
    }

}