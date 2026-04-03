import { success, failure } from '../core/result.js';
import { BANK_CODES } from '../core/constants.js';
import { computeMod10CheckDigit, formatAsBRLCurrency } from '../core/utils.js';

/**
 * Pure Bank Slip (Boleto) validation and conversion logic.
 * Follows FEBRABAN and BACEN standards for payment barcodes.
 */

/**
 * Validates and analyzes a payment slip's numeric line or barcode.
 * Narrative:
 * 1. Sanitize the input to numeric only.
 * 2. Identify the input format (44 digits for Barcode, 47 for Digitable Line).
 * 3. Process according to the industry standard for that format.
 *
 * @param {string} rawInput 
 * @returns {Result} The analysis result payload.
 */
export const analyzePaymentSlipLine = (rawInput) => {
    const sanitizedNumericLine = rawInput.replace(/\D/g, '');

    if (!sanitizedNumericLine || sanitizedNumericLine.length === 0) {
        return failure('Boleto vazio', 'EMPTY_INPUT');
    }

    if (sanitizedNumericLine.length === 44) {
        return processBarcodePayload(sanitizedNumericLine);
    } else if (sanitizedNumericLine.length === 47) {
        return processDigitableLineData(sanitizedNumericLine);
    }

    return failure('Comprimento inválido (esperado: 44 ou 47 dígitos)', 'INVALID_LENGTH');
};

/**
 * Processes a 44-digit Barcode payload.
 * Structure: BANK(3) | CURRENCY(1) | CHECK(1) | FACTOR(4) | AMOUNT(10) | FREE_FIELD(25)
 */
const processBarcodePayload = (barcode) => {
    const bankCode = barcode.substring(0, 3);
    const bankName = BANK_CODES[bankCode] || 'Banco Desconhecido';
    const overallCheckDigit = parseInt(barcode.charAt(4), 10);
    
    // Part 2: Verify the overall barcode integrity (Mod11)
    const payloadWithoutCheckDigit = barcode.slice(0, 4) + barcode.slice(5);
    const computedCheckDigit = computeMod11CheckDigit(payloadWithoutCheckDigit);

    if (overallCheckDigit !== computedCheckDigit) {
        return failure(`Dígito verificador inválido (Esperado: ${computedCheckDigit}, Obtido: ${overallCheckDigit})`, 'INVALID_VERIFIER');
    }

    return success({
        type: 'Código de Barras',
        bank: { code: bankCode, name: bankName },
        verifier: overallCheckDigit,
        dueDate: resolveExpiryDate(barcode.substring(5, 9)),
        amount: extractMonetaryValue(barcode.substring(9, 19)),
        converted: convertBarcodeToDigitableLine(barcode),
        length: barcode.length
    });
};

/**
 * Processes a 47-digit Digitable Line payload.
 * Structure: 3 Fields with their own Check Digits (Mod10) + Overall Check Digit + Factor + Amount.
 */
const processDigitableLineData = (digitableLine) => {
    const bankCode = digitableLine.substring(0, 3);
    const bankName = BANK_CODES[bankCode] || 'Banco Desconhecido';
    
    // Part 1: Extract segments and their verification digits
    const segment1 = digitableLine.substring(0, 9);
    const checkDigit1 = parseInt(digitableLine.charAt(9), 10);
    const segment2 = digitableLine.substring(10, 20);
    const checkDigit2 = parseInt(digitableLine.charAt(20), 10);
    const segment3 = digitableLine.substring(21, 31);
    const checkDigit3 = parseInt(digitableLine.charAt(31), 10);

    // Part 2: Cross-verify all three segment check digits
    const isSegmentIntegrityValid = 
        computeMod10CheckDigit(segment1) === checkDigit1 && 
        computeMod10CheckDigit(segment2) === checkDigit2 && 
        computeMod10CheckDigit(segment3) === checkDigit3;

    if (!isSegmentIntegrityValid) {
        return failure('Um ou mais dígitos verificadores de campo estão incorretos', 'INVALID_FIELD_VERIFIER');
    }

    return success({
        type: 'Linha Digitável',
        bank: { code: bankCode, name: bankName },
        verifiers: [checkDigit1, checkDigit2, checkDigit3],
        overallVerifier: digitableLine.charAt(32),
        dueDate: resolveExpiryDate(digitableLine.substring(33, 37)),
        amount: formatAsBRLCurrency(parseFloat(digitableLine.substring(37, 47)) / 100),
        converted: convertDigitableLineToBarcode(digitableLine),
        length: digitableLine.length
    });
};

/**
 * Computes the Mod11 Check Digit for Boletos.
 * Weights: 2 to 9 cyclical.
 */
const computeMod11CheckDigit = (payload) => {
    const sequence = '4329876543298765432987654329876543298765432';
    let weightedSum = 0;

    for (let i = 0; i < payload.length; i++) {
        weightedSum += parseInt(payload.charAt(i), 10) * parseInt(sequence.charAt(i), 10);
    }

    const remainder = weightedSum % 11;
    let checksum = 11 - remainder;

    // Rule: if 0, 1 or > 9, use 1.
    return (checksum === 0 || checksum === 1 || checksum > 9) ? 1 : checksum;
};

/**
 * Resolves the localized expiry date from the payment factor.
 * Factor 1000 = Oct 7, 1997 (the 'base' date defined by BACEN).
 */
const resolveExpiryDate = (factor) => {
    const daysSinceBase = parseInt(factor, 10);
    if (daysSinceBase === 0) return 'Sem vencimento (A vista)';

    const baseDate = new Date(Date.UTC(1997, 9, 7));
    const expiryDate = new Date(baseDate.getTime() + (daysSinceBase * 86400000));
    
    return expiryDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/**
 * Extracts and formats the monetary value from a numeric string.
 * @param {string} rawAmount 
 * @returns {string} Formatted BRL currency.
 */
const extractMonetaryValue = (rawAmount) => {
    const numericAmount = parseInt(rawAmount, 10);
    return formatAsBRLCurrency(numericAmount / 100);
};

/**
 * Converts a 44-digit Barcode string into a 47-digit formatted Digitable Line.
 */
const convertBarcodeToDigitableLine = (barcode) => {
    const block1 = `${barcode.substring(0, 4)}${barcode.substring(19, 24)}`;
    const block1DV = computeMod10CheckDigit(block1);
    
    const block2 = barcode.substring(24, 34);
    const block2DV = computeMod10CheckDigit(block2);
    
    const block3 = barcode.substring(34, 44);
    const block3DV = computeMod10CheckDigit(block3);
    
    const overallCheckDigit = barcode.charAt(4);
    const summaryFactorAndAmount = barcode.substring(5, 19);

    return `${block1.substring(0, 5)}.${block1.substring(5)}${block1DV} ` +
           `${block2.substring(0, 5)}.${block2.substring(5)}${block2DV} ` +
           `${block3.substring(0, 5)}.${block3.substring(5)}${block3DV} ` +
           `${overallCheckDigit} ${summaryFactorAndAmount}`;
};

/**
 * Converts a 47-digit Digitable Line into its 44-digit Barcode equivalent.
 */
const convertDigitableLineToBarcode = (digitableLine) => {
    return digitableLine.replace(/^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/, '$1$5$2$3$4');
};
