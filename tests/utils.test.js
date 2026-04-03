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
            // Segment '237969885' from a Bradesco boleto should have DV 1
            expect(computeMod10CheckDigit('237969885')).toBe(1);
        });

        it('should return 0 when the remainder is 0', () => {
            // Sequence '19'
            // 9 * 2 = 18 -> 1 + 8 = 9
            // 1 * 1 = 1
            // Sum = 10. 10 % 10 = 0.
            expect(computeMod10CheckDigit('19')).toBe(0);
        });
    });

    describe('isLuhnAlgorithmValid', () => {
        it('should return true for a valid MasterCard card number', () => {
            expect(isLuhnAlgorithmValid('5464984762204819')).toBe(true);
        });

        it('should return false for an invalid card number', () => {
            expect(isLuhnAlgorithmValid('5464984762204818')).toBe(false);
        });
    });

    describe('formatAsBRLCurrency', () => {
        it('should format a number into BRL string', () => {
            expect(formatAsBRLCurrency(1234.56)).toBe('R$ 1234,56');
        });

        it('should handle numeric strings', () => {
            expect(formatAsBRLCurrency('100.5')).toBe('R$ 100,50');
        });
    });

    describe('padWithLeadingZeros', () => {
        it('should pad a value to the target length', () => {
            expect(padWithLeadingZeros(123, 5)).toBe('00123');
        });

        it('should not pad if the length is already met', () => {
            expect(padWithLeadingZeros(123, 2)).toBe('123');
        });
    });

});
