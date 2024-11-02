const cardBins = [
    {brand: "Visa", binRegex: /^4[0-9]{12}(?:[0-9]{3})?$/, minLength: 13, maxLength: 16},
    {brand: "MasterCard", binRegex: /^5[1-5][0-9]{14}$/, minLength: 16, maxLength: 16},
    {brand: "American Express", binRegex: /^3[47][0-9]{13}$/, minLength: 15, maxLength: 15},
    {brand: "Discover", binRegex: /^6(?:011|5[0-9]{2})[0-9]{12}$/, minLength: 16, maxLength: 16},
    {brand: "Diners Club", binRegex: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, minLength: 14, maxLength: 14},
    {brand: "JCB", binRegex: /^(?:2131|1800|35[0-9]{3})[0-9]{11}$/, minLength: 16, maxLength: 19},
    {brand: "UnionPay", binRegex: /^62[0-9]{14,17}$/, minLength: 16, maxLength: 19},
    {brand: "Maestro", binRegex: /^(5018|5020|5038|6304|6759|676[1-3])[0-9]{8,15}$/, minLength: 12, maxLength: 19},
    {
        brand: "Elo",
        binRegex: /^4011[0-9]{12}|(4312|4389|4514|4576|5041|5066|5090|6277|6363)[0-9]{12}$/,
        minLength: 16,
        maxLength: 16
    },
    {brand: "Hipercard", binRegex: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/, minLength: 13, maxLength: 19}
];

function validateCreditCard(cardValue) {
    cardValue = cardValue.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cardValue.length === 0) {
        document.getElementById('creditCardLogTable').classList.add('d-none');
        clearValidationClasses(document.getElementById('txtCreditCard'));
        return;
    }

    const cardInfo = getCardBrand(cardValue);
    let logData = [];

    // Verifica se o número está dentro dos limites de comprimento
    if (cardValue.length < cardInfo.minLength || cardValue.length > cardInfo.maxLength) {
        showTooltip(`Número de caracteres inválido. Deve ter entre ${cardInfo.minLength} e ${cardInfo.maxLength} dígitos.`, "warning", "txtCreditCard");
        document.getElementById('creditCardLogTable').classList.add('d-none');
        return;
    }
    
    const luhnCheck = calculateLuhn(cardValue);
    if(!luhnCheck){
        showTooltip(`Cartão inválido.`, "warning", "txtCreditCard");
        document.getElementById('creditCardLogTable').classList.add('d-none');
        return;
    }

    // Chama a API ChargeBlast para obter mais detalhes sobre o BIN
    const bin = cardValue.substring(0, 6); // Pega os primeiros 6 dígitos (BIN)
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    fetch(`https://api.chargeblast.com/bin/${bin}`, options)
        .then(response => response.json())
        .then(response => {
            // Verifica se a API retornou erro
            if (response.error) {
                showTooltip("Cartão inválido. BIN não encontrado.", "warning", "txtCreditCard");
                
                logData.push({
                    id: "1",
                    type: "Erro",
                    length: "N/A",
                    value: response.reason || "BIN inválido ou não encontrado"
                });
                displayCreditCardLog(logData);
                return;
            }

            // Preenche os dados do log com as informações da API
            logData.push({
                id: "1",
                type: "Número do Cartão (mascarado)",
                length: `${cardValue.length} dígitos`,
                value: `${cardValue.slice(0, 4)} **** **** ${cardValue.slice(-4)}`
            });

            logData.push({
                id: "2",
                type: "Bandeira do Cartão",
                length: `N/A`,
                value: response.brand || cardInfo.brand
            });

            logData.push({
                id: "3",
                type: "Tipo de Cartão",
                length: "N/A",
                value: response.type || "Desconhecido"
            });

            logData.push({
                id: "4",
                type: "Emissor do Cartão",
                length: "N/A",
                value: response.issuer || "Desconhecido"
            });

            logData.push({
                id: "5",
                type: "País de Emissão",
                length: "N/A",
                value: response.country || "Desconhecido"
            });

            showTooltip("Cartão válido!", "success", "txtCreditCard");
            displayCreditCardLog(logData);
        })
        .catch(err => {
            console.error("Erro ao consultar API: ", err);
            
            logData.push({
                id: "1",
                type: "Número do Cartão (mascarado)",
                length: `${cardValue.length} dígitos`,
                value: `${cardValue.slice(0, 4)} **** **** ${cardValue.slice(-4)}`
            });

            logData.push({
                id: "2",
                type: "Bandeira do Cartão",
                length: `N/A`,
                value: cardInfo.brand
            });

            logData.push({
                id: "3",
                type: "Status",
                length: "N/A",
                value: "Informações não disponíveis"
            });

            showTooltip("Cartão válido com informações limitadas!", "warning", "txtCreditCard");
            displayCreditCardLog(logData);
        });
}

function getCardBrand(cardNumber) {
    for (const card of cardBins) {
        if (card.binRegex.test(cardNumber)) {
            return {
                brand: card.brand,
                minLength: card.minLength,
                maxLength: card.maxLength
            };
        }
    }
    
    return {brand: "Desconhecida", minLength: 13, maxLength: 19}; // Valores padrão
}

// O algoritmo de Luhn verifica se a soma ajustada dos dígitos é divisível por 10
function calculateLuhn(cardValue) {
    let sum = 0;
    let shouldDouble = false;
    
    // Percorre os dígitos, da direita pra esquerda
    for (let i = cardValue.length - 1; i >= 0; i--) {
        let digit = parseInt(cardValue.charAt(i));

        if (shouldDouble) {
            digit = digit * 2;
            if (digit > 9) {
                digit = digit - 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function displayCreditCardLog(logData) {
    const tbody = document.getElementById('creditCardLogBody');
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

    document.getElementById('creditCardLogTable').classList.remove('d-none');
}