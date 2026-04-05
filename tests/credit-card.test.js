import { describe, it, expect, vi } from 'vitest';
import { validateCreditCardData } from '../src/logic/validators/credit-card.js';

// Global mocks for API resilience tests
vi.mock('../src/logic/core/constants.js', async () => {
    const actual = await vi.importActual('../src/logic/core/constants.js');
    return {
        ...actual,
        API_URLS: { CHARGEBLAST: 'https://test-api.com' }
    };
});

describe('Credit Card Validator', () => {
    const validMasterCardNumber = '5464984762204819';
    
    it('should successfully validate a valid MasterCard number (local check)', async () => {
        // Mocking a successful BIN lookup
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ 
                brand: 'MasterCard', 
                type: 'Credit', 
                issuer: 'Test Bank', 
                country: 'BR' 
            })
        });

        const analysis = await validateCreditCardData(validMasterCardNumber);

        expect(analysis.isSuccess).toBe(true);
        expect(analysis.value.brand).toBe('MasterCard');
        expect(analysis.value.issuer).toBe('Test Bank');
    });

    it('should fail for an invalid length', async () => {
        const failureResult = await validateCreditCardData('12345');

        expect(failureResult.isFailure).toBe(true);
        expect(failureResult.error.code).toBe('INVALID_LENGTH');
    });

    it('should fail if it fails the Luhn algorithm', async () => {
        const invalidLuhnNumber = '5464984762204818';
        const failureResult = await validateCreditCardData(invalidLuhnNumber);

        expect(failureResult.isFailure).toBe(true);
        expect(failureResult.error.code).toBe('LUHN_FAILED');
    });

    it('should return a partial success if the API call fails (Resilience)', async () => {
        // Mocking a network error to test fallback logic
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const partialAnalysis = await validateCreditCardData(validMasterCardNumber);

        expect(partialAnalysis.isSuccess).toBe(true);
        expect(partialAnalysis.value.isPartial).toBe(true);
        expect(partialAnalysis.value.type).toBe('Desconhecido (Offline)');
    });

});
