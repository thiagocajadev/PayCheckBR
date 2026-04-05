import { describe, it, expect } from 'vitest';
import { analyzePixQrCode } from '../src/logic/validators/pix.js';

describe('Pix Validator', () => {
    const validPixPayload = '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5914THIAGO CAJAIBA6011SANTO ANDRE62200516PAGAMENTOOUT202463043BAB';

    it('should successfully analyze a valid Pix QR Code', () => {
        const analysis = analyzePixQrCode(validPixPayload);

        expect(analysis.isSuccess).toBe(true);
        expect(analysis.value.isCrcValid).toBe(true);
        expect(analysis.value.fields['00'].value).toBe('01');
        expect(analysis.value.fields['54'].value).toBe('100.55');
    });

    it('should correctly decode nested EMV tags for Merchant Account Information (Tag 26)', () => {
        const analysis = analyzePixQrCode(validPixPayload);
        const merchantAccountInfo = analysis.value.fields['26'];

        expect(merchantAccountInfo.subtags['00'].subValue).toBe('BR.GOV.BCB.PIX');
        expect(merchantAccountInfo.subtags['01'].subValue).toBe('+5511912345678');
    });

    it('should fail if the CRC16 checksum is incorrect', () => {
        // Change one bit in the CRC (F59C -> F59D)
        const corruptedPix = validPixPayload.slice(0, -1) + 'D';
        const failureResult = analyzePixQrCode(corruptedPix);

        expect(failureResult.isFailure).toBe(true);
        expect(failureResult.error.code).toBe('INVALID_PIX');
    });

    it('should fail for empty input', () => {
        const failureResult = analyzePixQrCode('');

        expect(failureResult.isFailure).toBe(true);
        expect(failureResult.error.code).toBe('EMPTY_INPUT');
    });

});
