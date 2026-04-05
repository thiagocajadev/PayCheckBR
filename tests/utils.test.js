import { describe, it, expect } from 'vitest';
import { 
    computeMod10CheckDigit, 
    isLuhnAlgorithmValid, 
    formatAsBRLCurrency, 
    padWithLeadingZeros 
} from '../src/logic/core/utils.js';

describe('Core Utilities', () => {
    
    describe('computeMod10CheckDigit', () => {
        it('should correctly calculate the Mod10 digit for a valid segment', () => {
            const bradescoSegment = '237969885'; // Segment from a Bradesco boleto
            const checkDigit = computeMod10CheckDigit(bradescoSegment);

            expect(checkDigit).toBe(1);
        });

        it('should return 0 when the remainder is 0', () => {
            // Sequence '19': (9*2=18->9) + (1*1=1) = 10. Mod10 = 0.
            const resultForSequence19 = computeMod10CheckDigit('19');
            expect(resultForSequence19).toBe(0);
        });
    });

    describe('isLuhnAlgorithmValid', () => {
        it('should return true for a valid MasterCard card number', () => {
            const validMasterCard = '5464984762204819';
            const isValid = isLuhnAlgorithmValid(validMasterCard);

            expect(isValid).toBe(true);
        });

        it('should return false for an invalid card number', () => {
            const invalidCardNumber = '5464984762204818';
            const isValid = isLuhnAlgorithmValid(invalidCardNumber);

            expect(isValid).toBe(false);
        });
    });

    describe('formatAsBRLCurrency', () => {
        it('should format a number into BRL string', () => {
            const formattedBRL = formatAsBRLCurrency(1234.56);
            expect(formattedBRL).toBe('R$ 1234,56');
        });

        it('should handle numeric strings', () => {
            const formattedFromStr = formatAsBRLCurrency('100.5');
            expect(formattedFromStr).toBe('R$ 100,50');
        });
    });

    describe('padWithLeadingZeros', () => {
        it('should pad a value to the target length', () => {
            const paddedValue = padWithLeadingZeros(123, 5);
            expect(paddedValue).toBe('00123');
        });

        it('should not pad if the length is already met', () => {
            const rawValue = padWithLeadingZeros(123, 2);
            expect(rawValue).toBe('123');
        });
    });

});
