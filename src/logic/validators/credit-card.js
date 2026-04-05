import { success, failure } from '../core/result.js';
import { CARD_BINS, API_URLS } from '../core/constants.js';
import { isLuhnAlgorithmValid } from '../core/utils.js';

/**
 * Pure Credit Card validation and brand detection logic.
 * Follows ISO/IEC 7812 standards for identification cards.
 */

/**
 * Identifies the card brand using a local registry of IIN/BIN prefixes.
 * @param {string} cardNumber 
 * @returns {Object} Brand metadata.
 */
const identifyCardBrandByPrefix = (cardNumber) => {
    let brandMetadata = { brand: 'Desconhecida', minLength: 13, maxLength: 19 };

    for (const brandPattern of CARD_BINS) {
        if (brandPattern.binRegex.test(cardNumber)) {
            brandMetadata = brandPattern;
            break;
        }
    }

    return brandMetadata;
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
    const binInfo = await response.json();

    return binInfo;
};

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
const validateCreditCardData = async (rawCardNumber) => {
    const sanitizedCreditCardNumber = rawCardNumber.replace(/\D/g, '');

    if (!sanitizedCreditCardNumber || sanitizedCreditCardNumber.length === 0) {
        const emptyInputFailure = failure('Número do cartão vazio', 'EMPTY_INPUT');
        return emptyInputFailure;
    }

    const detectedBrandMetadata = identifyCardBrandByPrefix(sanitizedCreditCardNumber);

    // Part 1: Quick Integrity Checks (Length & Luhn)
    const isLengthValid = 
        sanitizedCreditCardNumber.length >= detectedBrandMetadata.minLength && 
        sanitizedCreditCardNumber.length <= detectedBrandMetadata.maxLength;

    if (!isLengthValid) {
        const lengthFailure = failure(
            `Comprimento inválido (esperado: ${detectedBrandMetadata.minLength}-${detectedBrandMetadata.maxLength})`, 
            'INVALID_LENGTH'
        );
        return lengthFailure;
    }

    if (!isLuhnAlgorithmValid(sanitizedCreditCardNumber)) {
        const luhnFailure = failure('Número do cartão inválido (Falha no algoritmo de Luhn)', 'LUHN_FAILED');
        return luhnFailure;
    }

    // Part 2: Deep BIN Analysis (External Registry)
    const binPrefix = sanitizedCreditCardNumber.substring(0, 6);
    
    try {
        const registryData = await queryBinInformationRegistry(binPrefix);
        
        if (registryData.error) {
            const binNotFoundFailure = failure('BIN não encontrado ou inválido no registro externo', 'BIN_NOT_FOUND');
            return binNotFoundFailure;
        }

        const successAnalysis = success({
            brand: registryData.brand || detectedBrandMetadata.brand,
            type: registryData.type || 'Desconhecido',
            issuer: registryData.issuer || 'Desconhecido',
            country: registryData.country || 'Desconhecido',
            bin: binPrefix,
            masked: `${sanitizedCreditCardNumber.slice(0, 4)} **** **** ${sanitizedCreditCardNumber.slice(-4)}`,
            sequence: sanitizedCreditCardNumber.slice(6, 15),
            verifier: sanitizedCreditCardNumber.slice(-1),
            length: sanitizedCreditCardNumber.length
        });

        return successAnalysis;
    } catch (error) {
        // Resilience: Safe fallback to local brand detection if external API fails (CORS or Network)
        const fallbackAnalysis = success({
            brand: detectedBrandMetadata.brand,
            type: 'Desconhecido (Offline)',
            issuer: 'Desconhecido',
            country: 'Desconhecido',
            bin: binPrefix,
            masked: `${sanitizedCreditCardNumber.slice(0, 4)} **** **** ${sanitizedCreditCardNumber.slice(-4)}`,
            sequence: sanitizedCreditCardNumber.slice(6, 15),
            verifier: sanitizedCreditCardNumber.slice(-1),
            length: sanitizedCreditCardNumber.length,
            isPartial: true
        });

        return fallbackAnalysis;
    }
};

export {
    validateCreditCardData
};
