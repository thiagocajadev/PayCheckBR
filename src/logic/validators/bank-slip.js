import { success, failure } from "../core/result.js";
import { BANK_CODES } from "../core/constants.js";
import { computeMod10CheckDigit, formatAsBRLCurrency } from "../core/utils.js";

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
const analyzePaymentSlipLine = (rawInput) => {
  const BARCODE_LENGTH = 44;
  const DIGITABLE_LINE_LENGTH = 47;

  const digitsOnly = rawInput.replace(/\D/g, "");

  if (!digitsOnly || digitsOnly.length === 0) {
    const emptyInputFailure = failure("Boleto vazio", "EMPTY_INPUT");
    return emptyInputFailure;
  }

  const isBarcode = digitsOnly.length === BARCODE_LENGTH;
  const isDigitableLine = digitsOnly.length === DIGITABLE_LINE_LENGTH;

  if (isBarcode) {
    const barcodeResult = processBarcodePayload(digitsOnly);
    return barcodeResult;
  }

  if (isDigitableLine) {
    const digitableLineResult = processDigitableLineData(digitsOnly);
    return digitableLineResult;
  }

  const lengthFailure = failure(
    `Comprimento inválido (esperado: ${BARCODE_LENGTH} ou ${DIGITABLE_LINE_LENGTH} dígitos)`,
    "INVALID_LENGTH",
  );

  return lengthFailure;
};

/**
 * Processes a 44-digit Barcode payload.
 * Structure: BANK(3) | CURRENCY(1) | CHECK(1) | FACTOR(4) | AMOUNT(10) | FREE_FIELD(25)
 */
const processBarcodePayload = (rawBarcode) => {
  const bankCode = rawBarcode.substring(0, 3);
  const bankName = BANK_CODES[bankCode] || "Banco Desconhecido";
  const barcodeVerifier = parseInt(rawBarcode.charAt(4), 10);

  // Part 2: Verify the overall barcode integrity (Mod11)
  const contentToVerify = rawBarcode.slice(0, 4) + rawBarcode.slice(5);
  const expectedVerifier = computeMod11CheckDigit(contentToVerify);

  if (barcodeVerifier !== expectedVerifier) {
    const verifierFailure = failure(
      `Dígito verificador inválido (Esperado: ${expectedVerifier}, Obtido: ${barcodeVerifier})`,
      "INVALID_VERIFIER",
    );
    return verifierFailure;
  }

  const barcodeAnalysis = {
    type: "Código de Barras",
    bank: { code: bankCode, name: bankName },
    verifier: barcodeVerifier,
    dueDate: resolveExpiryDate(rawBarcode.substring(5, 9)),
    amount: extractMonetaryValue(rawBarcode.substring(9, 19)),
    converted: convertBarcodeToDigitableLine(rawBarcode),
    length: rawBarcode.length,
    raw: rawBarcode,
  };

  return success(barcodeAnalysis);
};

/**
 * Processes a 47-digit Digitable Line payload.
 * Structure: 3 Fields with their own Check Digits (Mod10) + Overall Check Digit + Factor + Amount.
 */
const processDigitableLineData = (digitableLine) => {
  const issuerBankCode = digitableLine.substring(0, 3);
  const issuerBankName = BANK_CODES[issuerBankCode] || "Banco Desconhecido";

  // Segment analysis (Fields 1, 2, 3 with their respective check digits)
  const firstFieldContent = digitableLine.substring(0, 9);
  const firstFieldChecksum = parseInt(digitableLine.charAt(9), 10);

  const secondFieldContent = digitableLine.substring(10, 20);
  const secondFieldChecksum = parseInt(digitableLine.charAt(20), 10);

  const thirdFieldContent = digitableLine.substring(21, 31);
  const thirdFieldChecksum = parseInt(digitableLine.charAt(31), 10);

  const allFieldsAreValid =
    computeMod10CheckDigit(firstFieldContent) === firstFieldChecksum &&
    computeMod10CheckDigit(secondFieldContent) === secondFieldChecksum &&
    computeMod10CheckDigit(thirdFieldContent) === thirdFieldChecksum;

  if (!allFieldsAreValid) {
    const segmentFailure = failure(
      "Um ou mais dígitos verificadores de campo estão incorretos",
      "INVALID_FIELD_VERIFIER",
    );
    return segmentFailure;
  }

  const digitableLineAnalysis = {
    type: "Linha Digitável",
    bank: { code: issuerBankCode, name: issuerBankName },
    verifiers: [firstFieldChecksum, secondFieldChecksum, thirdFieldChecksum],
    overallVerifier: digitableLine.charAt(32),
    dueDate: resolveExpiryDate(digitableLine.substring(33, 37)),
    amount: formatAsBRLCurrency(
      parseFloat(digitableLine.substring(37, 47)) / 100,
    ),
    converted: convertDigitableLineToBarcode(digitableLine),
    length: digitableLine.length,
    raw: digitableLine,
  };

  return success(digitableLineAnalysis);
};

/**
 * Computes the Mod11 Check Digit for Boletos.
 * Weights: 2 to 9 cyclical.
 */
const computeMod11CheckDigit = (payload) => {
  const sequence = "4329876543298765432987654329876543298765432";
  let weightedSum = 0;

  for (let i = 0; i < payload.length; i++) {
    weightedSum +=
      parseInt(payload.charAt(i), 10) * parseInt(sequence.charAt(i), 10);
  }

  const remainder = weightedSum % 11;
  const checksum = 11 - remainder;

  // Rule: if 0, 1 or > 9, use 1.
  const checkDigit = checksum === 0 || checksum === 1 || checksum > 9 ? 1 : checksum;

  return checkDigit;
};

/**
 * Resolve a data de vencimento localizada a partir do fator de vencimento do boleto.
 *
 * O fator de vencimento é um campo de 4 dígitos (0-9999) no código de barras onde
 * o fator 1000 mapeia para a data base do ciclo, e cada +1 representa +1 dia.
 *
 * Fator 0 significa "sem vencimento" (à vista).
 *
 * FEBRABAN 2025 Reset:
 * O espaço do fator de 4 dígitos reinicia aproximadamente a cada 9000 dias (~24,6 anos).
 * O ciclo legado (Ciclo 1) terminou em 21/02/2025 (Fator 9999).
 * O novo ciclo (Cycle 2) começou em 22/02/2025 (Fator 1000).
 *
 * Quando a data do ciclo legado cai a mais de 10 anos no passado, assumimos que
 * o fator pertence ao novo ciclo (base: 2022-05-29).
 * A aproximação de 10 anos (3650 dias) ignora intencionalmente anos bissextos —
 * a precisão é irrelevante para uma heurística com um intervalo de ~24 anos entre os ciclos.
 *
 * @param {number|string} expiryFactor - The 4-digit expiry factor from the barcode.
 * @param {number} [now=Date.now()] - Reference timestamp for testability.
 * @returns {string} Formatted date in pt-BR locale, or "Sem vencimento (À vista)".
 */
const resolveExpiryDate = (expiryFactor, now = Date.now()) => {
  const dayOffset = Number(expiryFactor);

  if (dayOffset === 0) return "Sem vencimento (À vista)";

  const MS_PER_DAY = 86_400_000;
  const LEGACY_BASE = Date.UTC(1997, 9, 7); // Ciclo 1
  const RESET_BASE = Date.UTC(2022, 4, 29); // Ciclo 2
  const TEN_YEARS_MS = 3_650 * MS_PER_DAY;

  const legacyTimestamp = LEGACY_BASE + dayOffset * MS_PER_DAY;
  const isLegacyCycle = legacyTimestamp >= now - TEN_YEARS_MS;

  const baseDate = isLegacyCycle ? LEGACY_BASE : RESET_BASE;
  const timestamp = baseDate + dayOffset * MS_PER_DAY;

  const formattedExpiryDate = new Date(timestamp).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });

  return formattedExpiryDate;
};

/**
 * Extracts and formats the monetary value from a numeric string.
 * @param {string} rawAmount
 * @returns {string} Formatted BRL currency.
 */
const extractMonetaryValue = (rawAmount) => {
  const numericAmount = parseInt(rawAmount, 10);
  const monetaryValue = formatAsBRLCurrency(numericAmount / 100);

  return monetaryValue;
};

/**
 * Converts a 44-digit Barcode string into a 47-digit formatted Digitable Line.
 */
const convertBarcodeToDigitableLine = (barcode) => {
  const dataBlock1 = `${barcode.substring(0, 4)}${barcode.substring(19, 24)}`;
  const dataBlock1Checksum = computeMod10CheckDigit(dataBlock1);

  const dataBlock2 = barcode.substring(24, 34);
  const dataBlock2Checksum = computeMod10CheckDigit(dataBlock2);

  const dataBlock3 = barcode.substring(34, 44);
  const dataBlock3Checksum = computeMod10CheckDigit(dataBlock3);

  const barcodeOverallVerifier = barcode.charAt(4);
  const summaryFactorAndAmount = barcode.substring(5, 19);

  const digitableLine = (
    `${dataBlock1.substring(0, 5)}.${dataBlock1.substring(5)}${dataBlock1Checksum} ` +
    `${dataBlock2.substring(0, 5)}.${dataBlock2.substring(5)}${dataBlock2Checksum} ` +
    `${dataBlock3.substring(0, 5)}.${dataBlock3.substring(5)}${dataBlock3Checksum} ` +
    `${barcodeOverallVerifier} ${summaryFactorAndAmount}`
  );

  return digitableLine;
};

/**
 * Converts a 47-digit Digitable Line into its 44-digit Barcode equivalent.
 */
const convertDigitableLineToBarcode = (digitableLine) => {
  const barcode = digitableLine.replace(
    /^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/,
    "$1$5$2$3$4",
  );

  return barcode;
};

export {
  analyzePaymentSlipLine
};
