// Lista de bancos com códigos. Lista completa no link https://www.bcb.gov.br/Fis/CODCOMPE/Tabela.pdf
const bankCodes = {
    "001": "Banco do Brasil",
    "003": "Banco da Amazônia",
    "004": "Banco do Nordeste do Brasil",
    "024": "Banco de Pernambuco",
    "029": "Banco do Estado do Rio de Janeiro",
    "033": "Banco Santander",
    "037": "Banco do Estado do Pará",
    "041": "Banco do Estado do Rio Grande do Sul",
    "044": "Banco BVA",
    "062": "Hipercard Banco Múltiplo",
    "065": "Banco Lemon",
    "066": "Banco Morgan Stanley",
    "072": "Banco Rural Mais",
    "074": "Banco J. Safra",
    "077": "Banco Inter",
    "079": "Banco JBS",
    "082": "Banco Topázio",
    "104": "Caixa Econômica Federal",
    "184": "Banco Itaú BBA S.A.",
    "197": "Stone Pagamentos",
    "208": "Banco BTG Pactual",
    "212": "Banco Original",
    "218": "Banco Bonsucesso",
    "229": "Banco Cruzeiro do Sul",
    "237": "Banco Bradesco",
    "241": "Banco Clássico",
    "250": "Banco de Crédito e Varejo (BCV)",
    "260": "Nubank",
    "290": "PagBank",
    "336": "C6 Bank",
    "341": "Itaú Unibanco",
    "376": "Banco JPMorgan S.A.",
    "422": "Banco Safra",
    "464": "Banco Sumitomo Mitsui Brasileiro",
    "477": "Citibank",
    "604": "Banco Industrial do Brasil",
    "610": "Banco VR",
    "654": "Banco AJ Renner",
    "655": "Banco Votorantim",
    "707": "Banco Daycoval",
    "734": "Banco Gerdau",
    "735": "Banco Neon",
    "746": "Banco Modal",
    "748": "Banco Cooperativo Sicredi S.A.",
    "749": "Banco Simples",
    "102": "XP Investimentos CCTVM S.A.",
    "119": "Western Union do Brasil",
    "380": "PicPay"
};

// Função principal para manipular a entrada do boleto
function handleBankSlipInput(bankSlipValue) {
    if (bankSlipValue.length === 0) {
        document.getElementById('bankSlipLogTable').classList.add('d-none');
        clearValidationClasses(document.getElementById('txtBankSlipBarcodeLine')); // Remove classes e esconde tooltip
        return;
    }

    let bankSlipType = ''; // Variável para armazenar o tipo (Código de Barras ou Linha Digitável)
    let logData = [];

    // Verifica se é um código de barras (44 dígitos) ou linha digitável (47 dígitos)
    if (bankSlipValue.length === 44) {
        bankSlipType = "Código de Barras";
        logData = validateBankSlip(bankSlipValue);
    } else if (bankSlipValue.length === 47) {
        bankSlipType = "Linha Digitável";
        logData = validateBankSlipReadableLine(bankSlipValue);
    } else {
        showTooltip("Número de caracteres inválido", "warning", "txtBankSlipBarcodeLine");
        document.getElementById('bankSlipLogTable').classList.add('d-none');
        return;
    }

    // Adiciona a informação do tipo no início do log
    logData.unshift({
        id: "0",
        type: "Tipo de Entrada",
        length: bankSlipValue.length + ` digitos`,
        value: bankSlipType
    });

    displayBankSlipLog(logData);
}

// Função para validar o código de barras
function validateBankSlip(bankSlipValue) {
    const logEntries = [];

    // Banco (primeiros 3 dígitos)
    const bankCode = bankSlipValue.substring(0, 3);
    const bankName = bankCodes[bankCode] ? `(${bankCodes[bankCode]})` : "";  // Coloca o nome do banco se existir
    logEntries.push({
        id: "1",
        type: "Banco",
        length: "3 dígitos (posição 1 a 3)",
        value: `${bankCode} ${bankName}`
    });

    // Dígito Verificador (5º dígito)
    const bankSlipVerifier = parseInt(bankSlipValue.charAt(4), 10);
    logEntries.push({
        id: "2",
        type: "Dígito Verificador",
        length: "1 dígito (posição 5)",
        value: bankSlipVerifier.toString()
    });

    // Valor do boleto (posições 10 a 19) usando a função calculateAmount
    const amount = calculateAmount(bankSlipValue);
    logEntries.push({
        id: "3",
        type: "Valor",
        length: "10 dígitos (posição 10 a 19)",
        value: amount
    });

    // Fator de vencimento (posições 6 a 9) e cálculo da data de vencimento usando calculateDueDate
    const dueDateFormatted = calculateDueDate(bankSlipValue.substring(5, 9)); // Fator de vencimento nas posições 6 a 9
    logEntries.push({
        id: "4",
        type: "Data de Vencimento",
        length: "4 dígitos (posição 6 a 9)",
        value: dueDateFormatted
    });

    // Converter o código de barras em linha digitável e adicionar ao log
    const readableLine = convertBarCodeToReadableLine(bankSlipValue);
    if (readableLine) {
        logEntries.push({
            id: "5",
            type: "Linha Digitável",
            length: "47 dígitos",
            value: readableLine
        });
    }

    // Verifica o dígito verificador usando o Mod11
    const bankSlipValueWithoutVerifier = bankSlipValue.slice(0, 4) + bankSlipValue.slice(5);
    const checkBankSlipDigitVerifier = calculateMod11(bankSlipValueWithoutVerifier);

    if (bankSlipVerifier !== checkBankSlipDigitVerifier) {
        showTooltip(`Digito verificador inválido. Original: ${bankSlipVerifier}. Verificado: ${checkBankSlipDigitVerifier}.`, "warning", "txtBankSlipBarcodeLine");
        return logEntries;
    } else {
        showTooltip("Código de barras válido.", "success", "txtBankSlipBarcodeLine");
        return logEntries;
    }
}

// Função para validar a linha digitável
function validateBankSlipReadableLine(bankSlipValue) {
    const logEntries = [];

    // Banco (primeiros 3 dígitos)
    const bankCode = bankSlipValue.substring(0, 3);
    const bankName = bankCodes[bankCode] ? `(${bankCodes[bankCode]})` : "";  // Coloca o nome do banco se existir
    logEntries.push({
        id: "1",
        type: "Banco",
        length: "3 dígitos (posição 1 a 3)",
        value: `${bankCode} ${bankName}`
    });

    // Dígito Verificador dos três campos (posições 10, 21 e 32)
    logEntries.push({
        id: "2",
        type: "Dígito Verificador",
        length: "3 dígitos (posições 10, 21, 32)",
        value: `${bankSlipValue.charAt(9)}, ${bankSlipValue.charAt(20)}, ${bankSlipValue.charAt(31)}`
    });

    // Valor do boleto (posição 38 a 47) - as últimas 10 posições
    const amount = parseFloat(bankSlipValue.substring(37, 47)) / 100; // Valor em centavos (posições 38 a 47)
    const formattedAmount = `R$ ${amount.toFixed(2).replace('.', ',')}`; // Formata valor corretamente
    logEntries.push({
        id: "3",
        type: "Valor",
        length: "10 dígitos (posição 38 a 47)",
        value: `${bankSlipValue.substring(37, 47)} (${formattedAmount})`
    });

    // Fator de vencimento (posições 34 a 37)
    const dueDateRaw = bankSlipValue.substring(33, 37);
    const dueDateFormatted = calculateDueDate(dueDateRaw); // Cálculo da data de vencimento
    logEntries.push({
        id: "4",
        type: "Data de Vencimento",
        length: "4 dígitos (posição 34 a 37)",
        value: `${dueDateRaw} (${dueDateFormatted})`
    });

    // Converter a linha digitável em código de barras
    const barCode = convertLineToBarCode(bankSlipValue);
    if (barCode) {
        logEntries.push({
            id: "5",
            type: "Código de Barras",
            length: "44 dígitos",
            value: barCode
        });
    }

    // Calcular os dígitos verificadores usando o Mod10
    const field1 = bankSlipValue.substring(0, 9); // Campo 1 (sem o DV)
    const checksumField1 = parseInt(bankSlipValue.charAt(9)); // DV do Campo 1
    const field2 = bankSlipValue.substring(10, 20); // Campo 2 (sem o DV)
    const checksumField2 = parseInt(bankSlipValue.charAt(20)); // DV do Campo 2
    const field3 = bankSlipValue.substring(21, 31); // Campo 3 (sem o DV)
    const checksumField3 = parseInt(bankSlipValue.charAt(31)); // DV do Campo 3

    const calculatedChecksumField1 = calculateMod10(field1);
    const calculatedChecksumField2 = calculateMod10(field2);
    const calculatedChecksumField3 = calculateMod10(field3);

    if (calculatedChecksumField1 === checksumField1 &&
        calculatedChecksumField2 === checksumField2 &&
        calculatedChecksumField3 === checksumField3) {
        showTooltip("Linha digitável válida.", "success", "txtBankSlipBarcodeLine");
        return logEntries;
    } else {
        showTooltip(`Linha digitável inválida.`, "warning", "txtBankSlipBarcodeLine");
        return logEntries;
    }
}

// Função para converter linha digitável em código de barras
function convertLineToBarCode(bankSlipLine) {
    if (bankSlipLine.length !== 47) {
        return null;
    }

    const barCode = bankSlipLine.replace(
        /^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/,
        '$1$5$2$3$4'
    );

    // Destaque do dígito verificador (posição 5)
    return `${barCode.substring(0, 4)}<span class="highlight-verifier">${barCode.charAt(4)}</span>${barCode.substring(5)}`;
}

// Função para converter código de barras em linha digitável
function convertBarCodeToReadableLine(barCode) {
    if (barCode.length !== 44) {
        return null; // Verifica se o código de barras tem 44 dígitos
    }

    // Campo 1: Primeiros 4 dígitos (banco + moeda) + primeiros 5 dígitos do campo livre
    const field1 = `${barCode.substring(0, 4)}${barCode.substring(19, 24)}`;
    const field1Dv = calculateMod10(field1);

    // Campo 2: Próximos 10 dígitos do campo livre
    const field2 = barCode.substring(24, 34);
    const field2Dv = calculateMod10(field2);

    // Campo 3: Últimos 10 dígitos do campo livre
    const field3 = barCode.substring(34, 44);
    const field3Dv = calculateMod10(field3);

    // Campo 4: Dígito verificador geral (posição 5 do código de barras)
    const field4 = barCode.charAt(4);

    // Campo 5: Fator de vencimento + valor (posições 6 a 19 do código de barras)
    const field5 = barCode.substring(5, 19);

    // Retorna a linha digitável formatada com os dígitos verificadores
    return `${field1.substring(0, 5)}.${field1.substring(5)}<span class="highlight-verifier">${field1Dv}</span> ` +
        `${field2.substring(0, 5)}.${field2.substring(5)}<span class="highlight-verifier">${field2Dv}</span> ` +
        `${field3.substring(0, 5)}.${field3.substring(5)}<span class="highlight-verifier">${field3Dv}</span> ` +
        `<span class="highlight-verifier">${field4}</span> ${field5}`;
}

// Função para calcular a data de vencimento a partir do fator de vencimento (baseada no boleto.js)
function calculateDueDate(factor) {
    const refDate = new Date(Date.UTC(1997, 9, 7)); // Data base definida pelo BACEN: 07/10/1997 em UTC
    const dueDays = parseInt(factor, 10);

    // Se o fator de vencimento for 0000, o boleto não tem data de vencimento
    if (dueDays === 0) {
        return "Sem vencimento";
    }

    const dueDate = new Date(refDate.getTime() + (dueDays * 86400000)); // Soma os dias à data base em milissegundos

    // Converte a data para o formato DD/MM/AAAA e retorna
    return dueDate.toLocaleDateString('pt-BR', {timeZone: 'UTC'}); // Garante que a data está no formato correto e em UTC
}

// Função para calcular o valor do boleto
function calculateAmount(barCode) {
    const rawAmount = parseInt(barCode.substring(9, 19), 10); // Valor nas posições 10 a 19
    const amount = (rawAmount / 100).toFixed(2); // Divide por 100 para obter o valor
    return `R$ ${amount.replace('.', ',')}`; // Formata como valor em reais
}

// Função para calcular o dígito verificador pelo Mod11
function calculateMod11(value) {
    const sequenceNumbers = "4329876543298765432987654329876543298765432";
    let sum = 0;

    for (let i = 0; i < value.length; i++) {
        sum += parseInt(value.charAt(i)) * parseInt(sequenceNumbers.charAt(i));
    }

    const mod11 = sum % 11;
    let checksum = 11 - mod11;

    // Se o resultado for 0, 1, 10 ou 11, o DV será 1
    return checksum === 0 || checksum === 1 || checksum > 9 ? 1 : checksum;
}

// Função para calcular o dígito verificador pelo Mod10
function calculateMod10(value) {
    let sum = 0;

    // Percorre os dígitos de trás para frente
    for (let i = value.length - 1, multiplier = 2; i >= 0; i--) {
        let currentDigit = parseInt(value.charAt(i)) * multiplier;
        
        // Soma os dígitos do produto caso seja maior que 9. Ex: 12 -> 1 + 2 = 3
        if (currentDigit > 9) {
            currentDigit = Math.floor(currentDigit / 10) + (currentDigit % 10); 
        }
        
        sum += currentDigit;
        multiplier = (multiplier === 2) ? 1 : 2; // Alterna o multiplicador entre 2 e 1
    }

    const mod10 = sum % 10;
    return mod10 === 0 ? 0 : 10 - mod10;
}

// Função para exibir o log do boleto em formato TLV (Tipo, Tamanho e Valor)
function displayBankSlipLog(logData) {
    const tbody = document.getElementById('bankSlipLogBody');
    tbody.innerHTML = '';

    logData.forEach((logEntry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${logEntry.type}</td>
            <td>${logEntry.length}</td>
            <td>${logEntry.value}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('bankSlipLogTable').classList.remove('d-none');
}