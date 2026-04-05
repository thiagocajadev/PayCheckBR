import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzePaymentSlipLine } from '../src/logic/validators/bank-slip.js';

describe('Bank Slip (Boleto) Validator', () => {
    
    // Determinism: Fix the system time to ensure sliding window logic is consistent
    beforeEach(() => {
        vi.useFakeTimers();
        // Today is 2026-04-05
        const mockToday = new Date('2026-04-05T12:00:00Z');
        vi.setSystemTime(mockToday);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Barcode Validation (44 digits)', () => {
        const bradescoSample = '23796988500000200251234010001234200240012430';

        it('should successfully validate a valid 44-digit barcode', () => {
            const analysis = analyzePaymentSlipLine(bradescoSample);

            expect(analysis.isSuccess).toBe(true);
            expect(analysis.value.type).toBe('Código de Barras');
            expect(analysis.value.bank.code).toBe('237');
        });

        it('should fail if the overall check digit is incorrect', () => {
            const corruptedBarcode = bradescoSample.slice(0, 4) + '1' + bradescoSample.slice(5);
            const failureResult = analyzePaymentSlipLine(corruptedBarcode);

            expect(failureResult.isFailure).toBe(true);
            expect(failureResult.error.code).toBe('INVALID_VERIFIER');
        });
    });

    describe('Digitable Line Validation (47 digits)', () => {
        const validLine = '23791234051000123420102400124307698850000020025';

        it('should successfully validate a valid 47-digit line', () => {
            const analysis = analyzePaymentSlipLine(validLine);

            expect(analysis.isSuccess).toBe(true);
            expect(analysis.value.type).toBe('Linha Digitável');
        });

        it('should fail if a segment check digit is incorrect', () => {
            const corruptedLine = '23791234001000123420102400124307698850000020025';
            const failureResult = analyzePaymentSlipLine(corruptedLine);

            expect(failureResult.isFailure).toBe(true);
            expect(failureResult.error.code).toBe('INVALID_FIELD_VERIFIER');
        });
    });

    describe('Conversions & Calculations (FEBRABAN Cycle Rules)', () => {
        const bradescoSample = '23796988500000200251234010001234200240012430';

        it('should correctly resolve dates in Cycle 1 (before 2025 reset)', () => {
            const cycle1Analysis = analyzePaymentSlipLine(bradescoSample);
            expect(cycle1Analysis.value.dueDate).toBe('30/10/2024');
        });

        it('should correctly resolve the last day of Cycle 1 (Factor 9999)', () => {
            // Factor 9999 should be 21/02/2025.
            const lastFactorCycle1 = '23796999900000200251234010001234200240012430';
            const analysis = analyzePaymentSlipLine(lastFactorCycle1);

            expect(analysis.value.dueDate).toBe('21/02/2025');
        });

        it('should correctly resolve Cycle 2 dates (Factor 1000+ after 22/02/2025)', () => {
            // Factor 1000 in Cycle 2 should be 22/02/2025.
            const firstFactorCycle2 = '23791100000000200251234010001234200240012430';
            const analysis = analyzePaymentSlipLine(firstFactorCycle2);

            expect(analysis.value.dueDate).toBe('22/02/2025');
        });

        it('should correctly extract the BRL amount', () => {
            const amountAnalysis = analyzePaymentSlipLine(bradescoSample);
            expect(amountAnalysis.value.amount).toBe('R$ 200,25');
        });
    });

});
