// Lista de opções de pagamento
const paymentOptions = [
    {value: '1', text: 'PIX'},
    {value: '2', text: 'Cartão'},
    {value: '3', text: 'Boleto'}
];

// Função para popular o select de tipos de pagamento
function populatePaymentType() {
    const dropdown = document.getElementById('paymentType');

    // Limpa as opções existentes
    dropdown.innerHTML = '<option value="" disabled selected>Selecione uma opção</option>';

    // Adiciona as opções ao select
    paymentOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        dropdown.appendChild(opt);
    });
}

// Função para alternar a visibilidade dos inputs com base no tipo de pagamento selecionado
function togglePaymentInputs() {
    const select = document.getElementById('paymentType');
    const pixInputDiv = document.getElementById('pixInputDiv');
    const cardInputDiv = document.getElementById('cardInputDiv');
    const boletoInputDiv = document.getElementById('boletoInputDiv');

    // Esconde todas as divs de input
    pixInputDiv.classList.add('d-none');
    cardInputDiv.classList.add('d-none');
    boletoInputDiv.classList.add('d-none');

    // Limpa os valores, tooltips e classes de validação dos campos
    resetInputField(document.getElementById('txtCopyPastePIX'), 'charCountPix');
    resetInputField(document.getElementById('txtCreditCard'), 'charCountCreditCard');
    resetInputField(document.getElementById('txtBankSlipBarcodeLine'), 'charCountBankSlip');

    // Mostra a div correta com base no valor selecionado
    switch (select.value) {
        case '1': // PIX
            pixInputDiv.classList.remove('d-none');
            break;
        case '2': // Cartão
            cardInputDiv.classList.remove('d-none');
            break;
        case '3': // Boleto
            boletoInputDiv.classList.remove('d-none');
            break;
        default:
            break;
    }
}

// Função para limpar o valor do input, remover classes de validação, esconder tooltips e redefinir o contador de caracteres
function resetInputField(inputField, countFieldId) {
    inputField.value = ''; // Limpa o valor do input
    clearValidationClasses(inputField); // Remove classes de validação e tooltips
    updateCharCount(inputField, countFieldId); // Redefine o contador de caracteres
}

// Função para limpar as classes de validação e esconder o tooltip
function clearValidationClasses(inputField) {
    inputField.classList.remove('is-valid', 'is-invalid'); // Remove as classes de validação
}

// Função para atualizar o contador de caracteres de um campo
function updateCharCount(inputField, countFieldId) {
    const charCount = inputField.value.length;
    const countField = document.getElementById(countFieldId);
    if (countField) {
        countField.textContent = `${charCount} caracteres`; // Atualiza o contador de caracteres
    }
}

// Evento que garante que o código seja executado após o carregamento completo da página
document.addEventListener('DOMContentLoaded', function () {
    // Popula o select de tipos de pagamento ao carregar a página
    populatePaymentType();

    // Adiciona o ouvinte para alternar os inputs com base no tipo de pagamento selecionado
    const paymentSelect = document.getElementById('paymentType');
    if (paymentSelect) {
        paymentSelect.addEventListener('change', function () {
            togglePaymentInputs(); // Alterna os inputs de pagamento
            hideLogTables(); // Esconde as tabelas de log ao mudar de pagamento
        });
    }

    // Referências aos campos de input
    const pixInput = document.getElementById('txtCopyPastePIX');
    const creditCardInput = document.getElementById('txtCreditCard');
    const bankSlipInput = document.getElementById('txtBankSlipBarcodeLine');
    
    // Referências a botões com dados de exemplo
    const btnFillPixCopyPasteExampleData = document.getElementById('btnFillPixCopyPasteExampleData');
    const btnFillCreditCardExampleData = document.getElementById('btnFillCreditCardExampleData');
    const btnFillBankSlipExampleData = document.getElementById('btnFillBankSlipExampleData');

    [bankSlipInput, creditCardInput, pixInput].forEach(inputField => {
        const updateCount = () => updateCharCountById(inputField);
        inputField.addEventListener('input', updateCount); // Atualiza ao perder o foco
    });

// Função para atualizar o contador com base no ID do campo
    function updateCharCountById(inputField) {
        switch (inputField.id) {
            case 'txtCopyPastePIX':
                updateCharCount(inputField, 'charCountPix'); // Contador para Pix
                break;
            case 'txtCreditCard':
                updateCharCount(inputField, 'charCountCreditCard'); // Contador para cartão de crédito
                break;
            case 'txtBankSlipBarcodeLine':
                updateCharCount(inputField, 'charCountBankSlip'); // Contador para boleto
                break;
        }
    }

    // Evento de validação para Pix
    pixInput.addEventListener('blur', function () {
        const pixValue = pixInput.value;
        updateCharCountById(pixInput);
        validatePix(pixValue); // Valida o código Pix
    }); 
    
    // Evento para atualizar contador de caracteres
    pixInput.addEventListener('input', function () {
        const pixValue = pixInput.value;
        updateCharCountById(pixInput);
    });
    
    // Evento de validação para o boleto
    bankSlipInput.addEventListener('blur', function () {
        const bankSlipValue = bankSlipInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        bankSlipInput.value = bankSlipValue;
        updateCharCountById(bankSlipInput);
        handleBankSlipInput(bankSlipValue); // Chama a função de validação do boleto
    });

    // Evento de validação para cartão de crédito
    creditCardInput.addEventListener('blur', function () {
        const cardValue = creditCardInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        creditCardInput.value = cardValue;
        updateCharCountById(creditCardInput);
        validateCreditCard(cardValue); // Valida o cartão de crédito
    });

    // Preenche Pix com dados de exemplo
    btnFillPixCopyPasteExampleData.addEventListener('click', function (){
        pixInput.value = '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5915THIAGO CARVALHO6011SANTO ANDRE62200516PAGAMENTOOUT20246304F59C';
        pixInput.focus();
        pixInput.blur();
    });

    // Preenche cartão de crédito com dados de exemplo
    btnFillCreditCardExampleData.addEventListener('click', function (){
        creditCardInput.value = '5464984762204819';
        creditCardInput.focus();
        creditCardInput.blur();
    });  
    
    // Preenche cartão de crédito com dados de exemplo
    btnFillBankSlipExampleData.addEventListener('click', function (){
        bankSlipInput.value = '23796988500000200251234010001234200240012430';
        bankSlipInput.focus();
        bankSlipInput.blur();
    });
});

// Função comum para esconder as tabelas de log de boleto e Pix
function hideLogTables() {
    const pixLogTable = document.getElementById('pixLogTable');
    const creditCardLogTable = document.getElementById('creditCardLogTable');
    const bankSlipLogTable = document.getElementById('bankSlipLogTable');

    if (pixLogTable) {
        pixLogTable.classList.add('d-none');
    }

    if (creditCardLogTable) {
        creditCardLogTable.classList.add('d-none');
    }
    
    if (bankSlipLogTable) {
        bankSlipLogTable.classList.add('d-none');
    }
}

function showTooltip(message, type, inputId) {
    // Obtenha o elemento de input pelo ID
    let inputElement = document.getElementById(inputId);

    // Verifique se o elemento existe
    if (inputElement) {
        // Remova o tooltip anterior, se houver
        let tooltip = bootstrap.Tooltip.getInstance(inputElement);
        if (tooltip) {
            tooltip.dispose();
        }

        // Adiciona classe de validação ao campo
        if (type === "success") {
            inputElement.classList.add("is-valid");
            inputElement.classList.remove("is-invalid");
        } else {
            inputElement.classList.add("is-invalid");
            inputElement.classList.remove("is-valid");
        }

        inputElement.setAttribute('data-bs-toggle', 'tooltip');
        inputElement.setAttribute('data-bs-placement', 'top');
        inputElement.setAttribute('title', message);

        // Inicialize o tooltip com Bootstrap
        new bootstrap.Tooltip(inputElement, {
            trigger: 'manual'
        }).show();

        setTimeout(function () {
            let tooltipInstance = bootstrap.Tooltip.getInstance(inputElement);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
        }, 2500);
    }
}
