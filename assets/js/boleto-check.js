let bankSlipValue = '';  // Variável global para armazenar o valor do boleto

// Função para obter o valor do input e atualizar a variável global
function updateBankSlipValue() {
    let inputField = document.getElementById('txtWritingLine');

    // Aplicar regex para manter apenas números
    bankSlipValue = inputField.value.replace(/\D/g, '');

    // Atualizar o campo de input com o valor filtrado
    inputField.value = bankSlipValue;

    // Atualizar a contagem de caracteres
    document.getElementById('charCount').textContent = `${bankSlipValue.length} caracteres`;
}

// Função que valida o boleto
function handleBankSlipInput() {
    let bankSlipValue = document.getElementById('txtWritingLine').value.replace(/\D/g, '');

    if (bankSlipValue.length === 0) {
        document.getElementById('bankSlipLogTable').classList.add('d-none');
        return showAlert(null, 'warning');
    }

    // Verifica se é um código de barras do boleto (44 dígitos)
    if (bankSlipValue.length === 44) {
        return validateBankSlip(bankSlipValue);
    }

    // Verifica se é linha digitável (47 dígitos boleto bancário)
    if (bankSlipValue.length === 47) {
        return validateWritingLine(bankSlipValue);
    }

    // Se não for 44 ou 47 dígitos, retorna falso
    showAlert("Tamanho do boleto inválido. Verifique o código digitado.", "warning");

    // Adicionar a classe d-none para ocultar a tabela
    document.getElementById('bankSlipLogTable').classList.add('d-none');
    return false;
}

function validateBankSlip(bankSlipValue) {
    // Pega o dígito verificador na posição 5 (índice 4)
    let bankSlipVerifier = parseInt(bankSlipValue.charAt(4), 10);

    // Remove o dígito verificador na posição 5
    let boletoValueWithoutVerifier = bankSlipValue.slice(0, 4) + bankSlipValue.slice(5);

    // Atualizar o valor original, destacando o dígito verificador
    let highlightedBoleto = bankSlipValue.slice(0, 4) +
        `<span class="highlight-verifier">${bankSlipVerifier}</span>` +
        bankSlipValue.slice(5);

    let checkBoletoDigitVerifier = calculateMod11(boletoValueWithoutVerifier);

    if (bankSlipVerifier !== checkBoletoDigitVerifier) {
        showAlert(`Digito verificador inválido. Original: ${bankSlipVerifier}. Verificado: ${checkBoletoDigitVerifier}.`, "warning");
        return false;
    }

    // Exibir a mensagem de sucesso
    showAlert("Código de barras do boleto válido.", "success");

    // Remover a classe d-none para exibir a tabela
    document.getElementById('bankSlipLogTable').classList.remove('d-none');

    // Atualizar a tabela com os logs
    document.getElementById('bankSlipOriginalValueLog').innerHTML = highlightedBoleto;
    document.getElementById('bankSlipVerifierLog').textContent = bankSlipVerifier.toString();
    document.getElementById('bankSlipWithoutVerifierLog').textContent = boletoValueWithoutVerifier;

    return true;
}

// Função que calcula o dígito verificador usando o Módulo 11
// Módulo é o resto da divisão de um número por outro, no caso N / 11
function calculateMod11(bankSlipValueWithoutVerifier) {
    const sequenceNumbersToMultiply = "4329876543298765432987654329876543298765432"; // Sequência fixa de multiplicação, 2 a 9, da direita para esquerda
    let sum = 0;

    // Percorre os 43 dígitos do boleto e a sequência de multiplicação
    for (let i = 0; i < bankSlipValueWithoutVerifier.length; i++) {
        let currentDigit = parseInt(bankSlipValueWithoutVerifier.charAt(i)); // Pega o dígito atual
        let multiplier = parseInt(sequenceNumbersToMultiply.charAt(i)); // Pega o multiplicador correspondente da sequência

        sum += currentDigit * multiplier;
    }

    // Calcula o resto da divisão por 11
    let mod11 = sum % 11;

    // Calcula o dígito verificador
    let checksum = 11 - mod11;

    // Se o resultado for 0, 1, 10 ou 11, o DV será 1
    if (checksum === 0 || checksum === 1 || checksum === 10 || checksum === 11) {
        checksum = 1;
    }

    return checksum;
}

function validateWritingLine(bankSlipValue){
    // Separar os campos da linha digitável
    let field1 = bankSlipValue.substring(0, 9); // Campo 1 (sem o dígito verificador)
    let checksumField1 = parseInt(bankSlipValue.charAt(9)); // DV do campo 1
    let field2 = bankSlipValue.substring(10, 20); // Campo 2 (sem o dígito verificador)
    let checksumField2 = parseInt(bankSlipValue.charAt(20)); // DV do campo 2
    let field3 = bankSlipValue.substring(21, 31); // Campo 3 (sem o dígito verificador)
    let checksumField3 = parseInt(bankSlipValue.charAt(31)); // DV do campo 3

    // Calcular os dígitos verificadores usando o módulo 10
    let calculatedChecksumField1 = calculateMod10(field1);
    let calculatedChecksumField2 = calculateMod10(field2);
    let calculatedChecksumField3 = calculateMod10(field3);

    // Comparar os dígitos calculados com os dígitos verificadores da linha digitável
    if (calculatedChecksumField1 === checksumField1 &&
        calculatedChecksumField2 === checksumField2 &&
        calculatedChecksumField3 === checksumField3) {
        showAlert("Linha digitável válida.", "success");
        return true;
    } else {
        showAlert(`Dígitos verificadores inválidos.
                      \nCampo 1: Calculado ${calculatedChecksumField1}, Esperado ${checksumField1}
                      \nCampo 2: Calculado ${calculatedChecksumField2}, Esperado ${checksumField2}
                      \nCampo 3: Calculado ${calculatedChecksumField3}, Esperado ${checksumField3}`, "warning");
        return false;
    }
}

// Função que calcula o dígito verificador usando o Módulo 10
// Módulo é o resto da divisão de um número por outro, no caso N / 10
function calculateMod10(bankSlipFieldWithoutVerifier) {
    let sum = 0;

    // Percorre os dígitos do campo de trás para frente
    for (let i = bankSlipFieldWithoutVerifier.length - 1, multiplier = 2; i >= 0; i--) {
        let currentDigit = parseInt(bankSlipFieldWithoutVerifier.charAt(i)); // Pega o dígito atual

        let product = currentDigit * multiplier;

        // Se o produto for maior que 9, somar os dígitos do produto
        if (product > 9) {
            product = Math.floor(product / 10) + (product % 10);
        }

        sum += product;

        // Alterna o multiplicador entre 2 e 1
        multiplier = (multiplier === 2) ? 1 : 2;
    }

    // Calcula o resto da divisão por 10
    let mod10 = sum % 10;
    
    // Calcula o dígito verificador
    let checksum = 10 - mod10;

    // Se o resultado for 10, o DV será 0
    if (checksum === 10) {
        checksum = 0;
    }

    return checksum;
}

// Função que exibe ou limpa o alerta na tela
function showAlert(message, type) {
    let alertContainer = document.getElementById('alertContainer');

    if (message === null) {
        // Limpa o alerta da tela se a mensagem for nula
        alertContainer.innerHTML = '';
    } else {
        // Exibe o alerta com a mensagem e o tipo correspondente
        alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
}

// Garante que o JavaScript seja executado somente após o carregamento completo da página
document.addEventListener('DOMContentLoaded', function () {
    let bankSlipInput = document.getElementById('txtWritingLine');

    // Adiciona o ouvinte de evento 'blur' para o campo
    bankSlipInput.addEventListener('blur', function () {
        updateBankSlipValue(); // Atualiza o valor do boleto uma vez
        handleBankSlipInput(); // Chama a função de validação com o valor atualizado
    });

    // Adiciona o ouvinte de evento 'input' para detectar alterações no campo
    bankSlipInput.addEventListener('input', function () {
        updateBankSlipValue(); // Atualiza o valor do boleto enquanto o usuário digita

        // Se o campo estiver vazio, limpa o alerta automaticamente
        if (bankSlipValue.length === 0) {
            showAlert(null);
        }
    });
});