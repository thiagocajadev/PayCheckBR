import { describe, it, expect } from 'vitest';
import { analyzePixQrCode } from '../src/assets/js/validators/pix.js';

describe('Pix Validator', () => {
    // Valid sample from constants.js
    const validPixData = '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5914THIAGO CAJAIBA6011SANTO ANDRE62200516PAGAMENTOOUT202463043BAB';

    it('should successfully analyze a valid Pix QR Code', () => {
        const result = analyzePixQrCode(validPixData);
        expect(result.isSuccess).toBe(true);
        expect(result.value.isCrcValid).toBe(true);
        expect(result.value.fields['00'].value).toBe('01');
        expect(result.value.fields['54'].value).toBe('100.55');
    });

    it('should correctly decode nested EMV tags for Merchant Account Information (Tag 26)', () => {
        const result = analyzePixQrCode(validPixData);
        const tag26 = result.value.fields['26'];
        expect(tag26.subtags['00'].subValue).toBe('BR.GOV.BCB.PIX');
        expect(tag26.subtags['01'].subValue).toBe('+5511912345678');
    });

    it('should fail if the CRC16 checksum is incorrect', () => {
        // Change one bit in the CRC (F59C -> F59D)
        const corruptedPix = validPixData.slice(0, -1) + 'D';
        const result = analyzePixQrCode(corruptedPix);
        expect(result.isFailure).toBe(true);
        expect(result.error.code).toBe('INVALID_PIX');
    });

    it('should fail for empty input', () => {
        const result = analyzePixQrCode('');
        expect(result.isFailure).toBe(true);
        expect(result.error.code).toBe('EMPTY_INPUT');
    });

});
