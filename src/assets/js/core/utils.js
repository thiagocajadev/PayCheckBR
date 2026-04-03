/**
 * Shared utility functions for PayCheckBR.
 * Focus: Logic deduplication, Resilience and Narrative Coding.
 */

/**
 * Computes the Mod10 (Luhn) Check Digit for a given numeric string.
 * This digit is used to verify the integrity of payment segments.
 *
 * Narrative:
 * 1. Traverse digits from right to left, alternating multipliers (2, 1).
 * 2. Sum the components of the product.
 * 3. Calculate the complement of the sum's modulo 10.
 *
 * @param {string} numericValue 
 * @returns {number} The calculated verification digit (0-9).
 */
export const computeMod10CheckDigit = (numericValue) => {
    let weightedSum = 0;
    let multiplier = 2;

    for (let i = numericValue.length - 1; i >= 0; i--) {
        let product = parseInt(numericValue.charAt(i), 10) * multiplier;
        
        // Sum components of digits > 9 (e.g., 14 -> 1 + 4 = 5)
        if (product > 9) {
            product = Math.floor(product / 10) + (product % 10);
        }
        
        weightedSum += product;
        multiplier = (multiplier === 2) ? 1 : 2;
    }

    const remainder = weightedSum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
};

/**
 * Verifies a string of digits using the standard Luhn Algorithm.
 * Primarily used for Credit Card number validation.
 *
 * Narrative:
 * A number is valid if the total sum of its weighted digits is divisible by 10.
 *
 * @param {string} cardNumber 
 * @returns {boolean} True if the number passes the integrity check.
 */
export const isLuhnAlgorithmValid = (cardNumber) => {
    let totalSum = 0;
    let doubleNext = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);

        if (doubleNext) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        totalSum += digit;
        doubleNext = !doubleNext;
    }

    return totalSum % 10 === 0;
};

/**
 * Formats a raw numeric value into a localized BRL Currency string.
 * @param {number|string} amount 
 * @returns {string} Formatted string (e.g., "R$ 1.234,56")
 */
export const formatAsBRLCurrency = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `R$ ${numericAmount.toFixed(2).replace('.', ',')}`;
};

/**
 * Ensures a value is a string of fixed length by padding with leading zeros.
 * @param {number|string} value 
 * @param {number} targetLength 
 * @returns {string} Fixed-length padded string.
 */
export const padWithLeadingZeros = (value, targetLength) => {
    return value.toString().padStart(targetLength, '0');
};
