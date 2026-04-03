import { success, failure } from '../core/result.js';
import { PIX_CONFIG } from '../core/constants.js';
import { padWithLeadingZeros } from '../core/utils.js';

/**
 * Pure Pix validation and parsing logic.
 * Follows EMV-QRCPS (EMV® QR Code Sample for Payment Systems) standards.
 */

const { IDS_WITH_SUBTAGS } = PIX_CONFIG;

/**
 * Analyzes a raw Pix QR Code payload (Copy & Paste format).
 * Narrative:
 * 1. Ensure the raw payload is not empty.
 * 2. Parse the EMV TLV (Tag-Length-Value) structure.
 * 3. Verify the mandatory CRC16 checksum at the end.
 *
 * @param {string} payload 
 * @returns {Result}
 */
export const analyzePixQrCode = (payload) => {
    if (!payload || payload.length === 0) {
        return failure('Código PIX vazio', 'EMPTY_INPUT');
    }

    try {
        const decodedTags = decodeEMVTagLengthValue(payload);
        const hasValidChecksum = verifyPixChecksumCRC16(payload);

        if (Object.keys(decodedTags).length > 0 && hasValidChecksum) {
            return success({ fields: decodedTags, isCrcValid: hasValidChecksum });
        }

        return failure('Código PIX inválido ou com CRC incorreto', 'INVALID_PIX');
    } catch (error) {
        return failure('Erro ao decodificar estrutura do PIX: ' + error.message, 'PROCESS_ERROR');
    }
};

/**
 * Decodes the TLV (Tag-Length-Value) structure of an EMV QR Code.
 * Each segment consists of: ID (2 chars) | Length (2 chars) | Value (Length chars).
 *
 * @param {string} rawData 
 * @returns {Object}
 */
const decodeEMVTagLengthValue = (rawData) => {
    let currentPosition = 0;
    const decodedFields = {};

    while (currentPosition < rawData.length) {
        const tagIdentifier = rawData.substring(currentPosition, currentPosition + 2);
        currentPosition += 2;

        const lengthSegment = rawData.substring(currentPosition, currentPosition + 2);
        const tagLength = parseInt(lengthSegment, 10);
        currentPosition += 2;

        const tagValue = rawData.substring(currentPosition, currentPosition + tagLength);
        currentPosition += tagLength;

        // Part 2: If the tag is a template for nested sub-tags, decode them.
        if (IDS_WITH_SUBTAGS.includes(tagIdentifier)) {
            decodedFields[tagIdentifier] = { 
                length: tagLength, 
                value: tagValue, 
                subtags: decodeNestedEMVTags(tagValue) 
            };
        } else {
            decodedFields[tagIdentifier] = { length: tagLength, value: tagValue };
        }
    }

    return decodedFields;
};

/**
 * Decodes nested sub-tags within a main EMV tag.
 * @param {string} rawNestedData 
 * @returns {Object}
 */
const decodeNestedEMVTags = (rawNestedData) => {
    let currentPosition = 0;
    const nestedTags = {};

    while (currentPosition < rawNestedData.length) {
        const subTagIdentifier = rawNestedData.substring(currentPosition, currentPosition + 2);
        currentPosition += 2;

        const subTagLengthSegment = rawNestedData.substring(currentPosition, currentPosition + 2);
        const subTagLength = parseInt(subTagLengthSegment, 10);
        currentPosition += 2;

        const subTagValue = rawNestedData.substring(currentPosition, currentPosition + subTagLength);
        currentPosition += subTagLength;

        nestedTags[subTagIdentifier] = { subLength: subTagLength, subValue: subTagValue };
    }

    return nestedTags;
};

/**
 * Verifies the integrity of the Pix payload using CRC16-CCITT (0x1021).
 * @param {string} payload 
 * @returns {boolean}
 */
const verifyPixChecksumCRC16 = (payload) => {
    const providedChecksum = payload.slice(-4);
    const payloadWithoutChecksum = payload.slice(0, -4);
    const computedChecksum = computeCRC16(payloadWithoutChecksum);
    
    return computedChecksum.toUpperCase() === providedChecksum.toUpperCase();
};

/**
 * Computes the CRC16-CCITT checksum for a given bitstream.
 * Default polynomial: 0x1021.
 * Initial value: 0xFFFF.
 */
const computeCRC16 = (bitstream) => {
    const polynomial = 0x1021;
    let crcValue = 0xFFFF;

    for (let i = 0; i < bitstream.length; i++) {
        crcValue ^= (bitstream.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crcValue & 0x8000) !== 0) {
                crcValue = (crcValue << 1) ^ polynomial;
            } else {
                crcValue <<= 1;
            }
            crcValue &= 0xFFFF;
        }
    }

    return padWithLeadingZeros(crcValue.toString(16).toUpperCase(), 4);
};
