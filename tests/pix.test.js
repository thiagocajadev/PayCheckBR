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

    it('should successfully analyze a Pix QR Code with whitespaces and newlines', () => {
        const multiLinePix = '00020104141234567890123426660014BR.GOV.BCB.PIX014466756C616E6F32303139406578616\n' +
            'D706C652E636F6D27300012BR.COM.OUTRO011001234567895204000053039865406123.45580\n' +
            '2BR5915NOMEDORECEBEDOR6008BRASILIA61087007490062530515RP12345678-\n' +
            '201950300017BR.GOV.BCB.BRCODE01051.0.080450014BR.GOV.BCB.PIX0123PADRAO.URL.PIX/0\n' +
            '123ABCD81390012BR.COM.OUTRO01190123.ABCD.3456.WXYZ6304EB76';
        
        const analysis = analyzePixQrCode(multiLinePix);

        expect(analysis.isSuccess).toBe(true);
        expect(analysis.value.isCrcValid).toBe(true);
        expect(analysis.value.raw).not.toContain('\n');
    });

});
