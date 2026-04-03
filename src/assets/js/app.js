import { PAYMENT_TYPES, PAYMENT_OPTIONS, EXAMPLE_DATA } from './core/constants.js';
import { analyzePixQrCode } from './validators/pix.js';
import { validateCreditCardData } from './validators/credit-card.js';
import { analyzePaymentSlipLine } from './validators/bank-slip.js';
import { displayPixAnalysisReport, displayCardAnalysisReport, displayBoletoAnalysisReport, notifyUserWithTooltip } from './ui/renderers.js';

/**
 * Main Application Orchestrator for PayCheckBR.
 * Narrative:
 * 1. Initialize UI components (Dropdowns, Listeners).
 * 2. Manage the state transition between different payment methods.
 * 3. Execute the validation pipeline for each input source.
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeInterfaceSettings();
    registerGlobalEventListeners();
});

/**
 * Populates the payment selection dropdown based on organized constant options.
 */
const initializeInterfaceSettings = () => {
    const paymentSelector = document.getElementById('paymentType');
    paymentSelector.innerHTML = '<option value="" disabled selected>Selecione uma opção de consulta</option>';
    
    PAYMENT_OPTIONS.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        paymentSelector.appendChild(optionElement);
    });
};

/**
 * Binds DOM events to their respective orchestration handlers.
 */
const registerGlobalEventListeners = () => {
    const paymentSelector = document.getElementById('paymentType');
    paymentSelector.onchange = onPaymentMethodSelected;

    // Inputs
    const pixField = document.getElementById('txtCopyPastePIX');
    const creditCardField = document.getElementById('txtCreditCard');
    const bankSlipField = document.getElementById('txtBankSlipBarcodeLine');

    // Execution Pipeline Triggers (onBlur)
    pixField.onblur = () => executeValidationPipeline(PAYMENT_TYPES.PIX);
    creditCardField.onblur = () => executeValidationPipeline(PAYMENT_TYPES.CARD);
    bankSlipField.onblur = () => executeValidationPipeline(PAYMENT_TYPES.BOLETO);

    // Dynamic Feedback Listeners
    [pixField, creditCardField, bankSlipField].forEach(inputField => {
        inputField.oninput = () => refreshInputCharacterCount(inputField);
    });

    // Sample Data Injectors (Lightbulbs)
    document.getElementById('btnFillPixCopyPasteExampleData').onclick = () => populateFieldWithSampleData(pixField, EXAMPLE_DATA.PIX);
    document.getElementById('btnFillCreditCardExampleData').onclick = () => populateFieldWithSampleData(creditCardField, EXAMPLE_DATA.CARD);
    document.getElementById('btnFillBankSlipExampleData').onclick = () => populateFieldWithSampleData(bankSlipField, EXAMPLE_DATA.BOLETO);
};

/**
 * Handles the UI transition when a new payment method is chosen.
 */
const onPaymentMethodSelected = (event) => {
    const selectedType = event.target.value;
    
    const uiContainersMap = {
        [PAYMENT_TYPES.PIX]: 'pixInputDiv',
        [PAYMENT_TYPES.CARD]: 'cardInputDiv',
        [PAYMENT_TYPES.BOLETO]: 'boletoInputDiv'
    };

    // Part 1: Reset and Hide all input/log containers
    Object.values(uiContainersMap).forEach(containerId => {
        document.getElementById(containerId).classList.add('d-none');
    });
    
    ['pixLogTable', 'creditCardLogTable', 'bankSlipLogTable'].forEach(tableId => {
        document.getElementById(tableId).classList.add('d-none');
    });

    // Part 2: Reveal the active payment source container
    if (uiContainersMap[selectedType]) {
        document.getElementById(uiContainersMap[selectedType]).classList.remove('d-none');
    }
    
    resetValidationVisualIndicators();
};

/**
 * Coordinates the validation workflow for a specific payment method.
 */
const executeValidationPipeline = async (paymentMethodType) => {
    switch (paymentMethodType) {
        case PAYMENT_TYPES.PIX: {
            const inputField = document.getElementById('txtCopyPastePIX');
            const analysisResult = analyzePixQrCode(inputField.value);
            
            if (analysisResult.isSuccess) {
                notifyUserWithTooltip("Código PIX válido!", "success", "txtCopyPastePIX");
                displayPixAnalysisReport(analysisResult.value, 'pixLogTable', 'pixLogBody');
            } else {
                notifyUserWithTooltip(analysisResult.error.message, "error", "txtCopyPastePIX");
                document.getElementById('pixLogTable').classList.add('d-none');
            }
            break;
        }

        case PAYMENT_TYPES.CARD: {
            const inputField = document.getElementById('txtCreditCard');
            const analysisResult = await validateCreditCardData(inputField.value);
            
            if (analysisResult.isSuccess) {
                const message = analysisResult.value.isPartial ? "Cartão válido (dados parciais/offline)" : "Cartão e BIN validados com sucesso!";
                const type = analysisResult.value.isPartial ? "warning" : "success";
                
                notifyUserWithTooltip(message, type, "txtCreditCard");
                displayCardAnalysisReport(analysisResult.value, 'creditCardLogTable', 'creditCardLogBody');
            } else {
                notifyUserWithTooltip(analysisResult.error.message, "error", "txtCreditCard");
                document.getElementById('creditCardLogTable').classList.add('d-none');
            }
            break;
        }

        case PAYMENT_TYPES.BOLETO: {
            const inputField = document.getElementById('txtBankSlipBarcodeLine');
            const analysisResult = analyzePaymentSlipLine(inputField.value);
            
            if (analysisResult.isSuccess) {
                notifyUserWithTooltip("Boleto identificado e validado!", "success", "txtBankSlipBarcodeLine");
                displayBoletoAnalysisReport(analysisResult.value, 'bankSlipLogTable', 'bankSlipLogBody');
            } else {
                notifyUserWithTooltip(analysisResult.error.message, "error", "txtBankSlipBarcodeLine");
                document.getElementById('bankSlipLogTable').classList.add('d-none');
            }
            break;
        }
    }
};

/**
 * Synchronizes the visual character counter for a specific input field.
 */
const refreshInputCharacterCount = (inputField) => {
    const counterMap = {
        'txtCopyPastePIX': 'charCountPix',
        'txtCreditCard': 'charCountCreditCard',
        'txtBankSlipBarcodeLine': 'charCountBankSlip'
    };
    
    const counterElementId = counterMap[inputField.id];
    const counterDisplay = document.getElementById(counterElementId);
    
    if (counterDisplay) {
        counterDisplay.textContent = `${inputField.value.length} caracteres`;
    }
};

/**
 * Populates a field with prepared sample data and triggers the validation lifecycle.
 */
const populateFieldWithSampleData = (inputField, sampleValue) => {
    inputField.value = sampleValue;
    inputField.dispatchEvent(new Event('input')); // Synchronize character count
    inputField.focus();
    inputField.blur(); // Trigger validation pipeline
};

/**
 * Clears all validation-related CSS classes from the inputs.
 */
const resetValidationVisualIndicators = () => {
    ['txtCopyPastePIX', 'txtCreditCard', 'txtBankSlipBarcodeLine'].forEach(fieldId => {
        const inputElement = document.getElementById(fieldId);
        inputElement.classList.remove('is-valid', 'is-invalid');
    });
};
