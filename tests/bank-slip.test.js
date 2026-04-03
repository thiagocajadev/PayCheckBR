import { describe, it, expect } from 'vitest';
import { analyzePaymentSlipLine } from '../src/logic/validators/bank-slip.js';

describe('Bank Slip (Boleto) Validator', () => {
    
    describe('Barcode Validation (44 digits)', () => {
        // Valid sample from constants.js
        const validBarcode = '23796988500000200251234010001234200240012430';

        it('should successfully validate a valid 44-digit barcode', () => {
            const result = analyzePaymentSlipLine(validBarcode);
            expect(result.isSuccess).toBe(true);
            expect(result.value.type).toBe('Código de Barras');
            expect(result.value.bank.code).toBe('237');
        });

        it('should fail if the overall check digit is incorrect', () => {
            // Corrupt the overall check digit (position 4)
            const corruptedBarcode = validBarcode.slice(0, 4) + '1' + validBarcode.slice(5);
            const result = analyzePaymentSlipLine(corruptedBarcode);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe('INVALID_VERIFIER');
        });
    });

    describe('Digitable Line Validation (47 digits)', () => {
        // Correct conversion of barcode '23796988500000200251234010001234200240012430'
        const validDigitableLine = '23791234051000123420102400124307698850000020025';

        it('should successfully validate a valid 47-digit line', () => {
            const result = analyzePaymentSlipLine(validDigitableLine);
            expect(result.isSuccess).toBe(true);
            expect(result.value.type).toBe('Linha Digitável');
        });

        it('should fail if a segment check digit is incorrect', () => {
            // Corrupt the first segment's check digit
            const corruptedLine = '23791234001000123420102400124307698850000020025';
            const result = analyzePaymentSlipLine(corruptedLine);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe('INVALID_FIELD_VERIFIER');
        });
    });

    describe('Conversions & Calculations', () => {
        const validBarcode = '23796988500000200251234010001234200240012430';

        it('should correctly resolve the expiry date', () => {
            const result = analyzePaymentSlipLine(validBarcode);
            expect(result.value.dueDate).toBe('30/10/2024');
        });

        it('should correctly extract the BRL amount', () => {
            const result = analyzePaymentSlipLine(validBarcode);
            expect(result.value.amount).toBe('R$ 200,25');
        });
    });

});
