import { success, failure } from '../core/result.js';
import { CARD_BINS, API_URLS } from '../core/constants.js';
import { isLuhnAlgorithmValid } from '../core/utils.js';

/**
 * Pure Credit Card validation and brand detection logic.
 * Follows ISO/IEC 7812 standards for identification cards.
 */

/**
 * Validates credit card integrity and identifies brand metadata.
 * Narrative:
 * 1. Sanitize input (numeric only).
 * 2. Identify the brand based on the BIN (Bank Identification Number) prefix.
 * 3. Verify card length and mathematical integrity (Luhn Algorithm).
 * 4. Query an external registry for detailed issuer/country attributes.
 *
 * @param {string} rawCardNumber 
 * @returns {Promise<Result>}
 */
export const validateCreditCardData = async (rawCardNumber) => {
    const sanitizedCreditCardNumber = rawCardNumber.replace(/\D/g, '');

    if (!sanitizedCreditCardNumber || sanitizedCreditCardNumber.length === 0) {
        return failure("Número do cartão vazio", "EMPTY_INPUT");
    }

    const detectedBrandMetadata = identifyCardBrandByPrefix(sanitizedCreditCardNumber);

    // Part 1: Quick Integrity Checks (Length & Luhn)
    const isLengthValid = 
        sanitizedCreditCardNumber.length >= detectedBrandMetadata.minLength && 
        sanitizedCreditCardNumber.length <= detectedBrandMetadata.maxLength;

    if (!isLengthValid) {
        return failure(`Comprimento inválido (esperado: ${detectedBrandMetadata.minLength}-${detectedBrandMetadata.maxLength})`, "INVALID_LENGTH");
    }

    if (!isLuhnAlgorithmValid(sanitizedCreditCardNumber)) {
        return failure("Número do cartão inválido (Falha no algoritmo de Luhn)", "LUHN_FAILED");
    }

    // Part 2: Deep BIN Analysis (External Registry)
    const binPrefix = sanitizedCreditCardNumber.substring(0, 6);
    try {
        const registryData = await queryBinInformationRegistry(binPrefix);
        
        if (registryData.error) {
            return failure("BIN não encontrado ou inválido no registro externo", "BIN_NOT_FOUND");
        }

        return success({
            brand: registryData.brand || detectedBrandMetadata.brand,
            type: registryData.type || "Desconhecido",
            issuer: registryData.issuer || "Desconhecido",
            country: registryData.country || "Desconhecido",
            bin: binPrefix,
            masked: `${sanitizedCreditCardNumber.slice(0, 4)} **** **** ${sanitizedCreditCardNumber.slice(-4)}`,
            sequence: sanitizedCreditCardNumber.slice(6, 15),
            verifier: sanitizedCreditCardNumber.slice(-1),
            length: sanitizedCreditCardNumber.length
        });
    } catch (error) {
        // Resilience: Safe fallback to local brand detection if external API fails (CORS or Network)
        return success({
            brand: detectedBrandMetadata.brand,
            type: "Desconhecido (Offline)",
            issuer: "Desconhecido",
            country: "Desconhecido",
            bin: binPrefix,
            masked: `${sanitizedCreditCardNumber.slice(0, 4)} **** **** ${sanitizedCreditCardNumber.slice(-4)}`,
            sequence: sanitizedCreditCardNumber.slice(6, 15),
            verifier: sanitizedCreditCardNumber.slice(-1),
            length: sanitizedCreditCardNumber.length,
            isPartial: true
        });
    }
};

/**
 * Identifies the card brand using a local registry of IIN/BIN prefixes.
 * @param {string} cardNumber 
 * @returns {Object} Brand metadata.
 */
const identifyCardBrandByPrefix = (cardNumber) => {
    for (const brandPattern of CARD_BINS) {
        if (brandPattern.binRegex.test(cardNumber)) {
            return brandPattern;
        }
    }
    return { brand: "Desconhecida", minLength: 13, maxLength: 19 };
};

/**
 * Queries an external BIN registry for deep authorization metadata.
 * @param {string} binPrefix 
 * @returns {Promise<Object>}
 */
const queryBinInformationRegistry = async (binPrefix) => {
    const fetchOptions = { method: 'GET', headers: { accept: 'application/json' } };
    const apiEndpoint = `${API_URLS.CHARGEBLAST}/${binPrefix}`;
    
    const response = await fetch(apiEndpoint, fetchOptions);
    return response.json();
};
