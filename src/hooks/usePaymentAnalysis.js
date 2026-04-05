import { useState, useEffect } from 'react';
import { analyzePixQrCode } from '../logic/validators/pix';
import { analyzePaymentSlipLine } from '../logic/validators/bank-slip';
import { validateCreditCardData } from '../logic/validators/credit-card';

export const usePaymentAnalysis = () => {
    const [paymentType, setPaymentType] = useState('pix');
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const samples = {
        pix: '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5914THIAGO CAJAIBA6011SANTO ANDRE62200516PAGAMENTOOUT202463043BAB',
        card: '5464984762204819',
        boleto: '23791234051000123420102400124307698850000020025'
    };

    const handleValidation = async (val) => {
        if (!val) {
            setResult(null);
            return;
        }

        setIsLoading(true);
        try {
            let res;
            if (paymentType === 'pix') res = analyzePixQrCode(val);
            else if (paymentType === 'card') res = await validateCreditCardData(val);
            else if (paymentType === 'boleto') res = analyzePaymentSlipLine(val);

            setResult(res);
        } catch (e) {
            setResult({ isSuccess: false, error: { message: 'Erro inesperado: ' + e.message } });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleValidation(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue, paymentType]);

    const changePaymentType = (type) => {
        setPaymentType(type);
        setInputValue('');
        setResult(null);
    };

    const loadSample = () => {
        setInputValue(samples[paymentType]);
    };

    return {
        paymentType,
        inputValue,
        setInputValue,
        result,
        isLoading,
        changePaymentType,
        loadSample
    };
};
