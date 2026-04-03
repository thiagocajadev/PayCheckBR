import { describe, it, expect, vi } from 'vitest';
import { validateCreditCardData } from '../src/assets/js/validators/credit-card.js';

// Clean up mocks after each test
vi.mock('../src/assets/js/core/constants.js', async () => {
    const actual = await vi.importActual('../src/assets/js/core/constants.js');
    return {
        ...actual,
        API_URLS: { CHARGEBLAST: 'https://test-api.com' }
    };
});

describe('Credit Card Validator', () => {
    
    it('should successfully validate a valid MasterCard number (local check)', async () => {
        // Mocking a successful BIN lookup
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ brand: 'MasterCard', type: 'Credit', issuer: 'Test Bank', country: 'BR' })
        });

        const result = await validateCreditCardData('5464984762204819');
        expect(result.isSuccess).toBe(true);
        expect(result.value.brand).toBe('MasterCard');
        expect(result.value.issuer).toBe('Test Bank');
    });

    it('should fail for an invalid length', async () => {
        const result = await validateCreditCardData('12345');
        expect(result.isFailure).toBe(true);
        expect(result.error.code).toBe('INVALID_LENGTH');
    });

    it('should fail if it fails the Luhn algorithm', async () => {
        const result = await validateCreditCardData('5464984762204818');
        expect(result.isFailure).toBe(true);
        expect(result.error.code).toBe('LUHN_FAILED');
    });

    it('should return a partial success if the API call fails (Resilience)', async () => {
        // Mocking a network error
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const result = await validateCreditCardData('5464984762204819');
        expect(result.isSuccess).toBe(true);
        expect(result.value.isPartial).toBe(true);
        expect(result.value.type).toBe('Desconhecido (Offline)');
    });

});
