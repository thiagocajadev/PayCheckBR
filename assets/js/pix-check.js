function validatePix(pixValue) {
    if (pixValue.length === 0) {
        document.getElementById('pixLogTable').classList.add('d-none');
        clearValidationClasses(document.getElementById('txtCopyPastePIX')); // Remove classes e esconde tooltip
        return;
    }

    const pixFields = processPixTLV(pixValue);
    const checkCRC = validateCRC(pixValue);

    if (Object.keys(pixFields).length > 0 && checkCRC) {
        showTooltip("Código PIX válido!", "success", "txtCopyPastePIX");
    } else {
        showTooltip("Código PIX inválido!", "warning", "txtCopyPastePIX");
    }

    if (pixValue.length > 0) {
        displayPixLog(pixFields);
    }
}

function processPixTLV(pixCode) {
    let index = 0;
    const fields = {};

    // IDs que podem conter subtags
    const idsWithSubtags = ["26", "27", "62", "80", "81"];

    while (index < pixCode.length) {
        const id = pixCode.substring(index, index + 2); // Extrai a Tag (ID)
        index += 2;

        const length = parseInt(pixCode.substring(index, index + 2), 10); // Extrai o tamanho do campo
        index += 2;

        const value = pixCode.substring(index, index + length); // Extrai o valor correspondente
        index += length;

        // Verifica se o campo contém subtags e as processa
        if (idsWithSubtags.includes(id)) {
            fields[id] = {length, value, subtags: processSubtags(value)}; // Chama processSubtags com o valor e processa as subtags
        } else {
            fields[id] = {length, value}; // Se não há subtags, armazena normalmente
        }
    }

    return fields;
}

function processSubtags(value) {
    let index = 0;
    const subtags = {};

    while (index < value.length) {
        const subId = value.substring(index, index + 2); // Extrai a Subtag (ID)
        index += 2;

        const subLength = parseInt(value.substring(index, index + 2), 10); // Extrai o tamanho da subtag
        index += 2;

        const subValue = value.substring(index, index + subLength); // Extrai o valor da subtag
        index += subLength;

        // Armazena a subtag com o seu próprio comprimento e valor
        subtags[subId] = {subLength, subValue};
    }

    return subtags;
}

function validateCRC(pixCode) {
    const providedCRC = pixCode.slice(-4); // Últimos 4 caracteres fornecem o CRC
    const codeWithoutCRC = pixCode.slice(0, -4);

    const calculatedCRC = calculateCRC16(codeWithoutCRC);

    return calculatedCRC.toUpperCase() === providedCRC.toUpperCase();
}

function calculateCRC16(payload) {
    let polynomial = 0x1021;
    let crc = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF; // Assegura o valor como um bit-16
        }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function displayPixLog(pixFields) {
    const logTable = document.getElementById('pixLogTable');
    const tbody = document.getElementById('pixLogBody');

    logTable.classList.remove('d-none');
    tbody.innerHTML = '';

    const emvDescription = {
        "00": "Payload Format Indicator",
        "01": "Point of Initiation Method",
        "04": "Merchant Account Information – Cards",
        "26": "Merchant Account Information – PIX",
        "27": "Merchant Account Information – Other",
        "52": "Merchant Category Code",
        "53": "Transaction Currency",
        "54": "Transaction Amount",
        "58": "Country Code",
        "59": "Merchant Name",
        "60": "Merchant City",
        "61": "Postal Code",
        "62": "Additional Data Field",
        "80": "Unreserved Templates",
        "81": "Unreserved Templates",
        "63": "CRC16"
    };

    const subFieldsEMV = {
        "26": {
            "00": "GUI",
            "01": "PIX Key"
        },
        "27": {
            "00": "GUI",
            "01": "AccountId"
        },
        "62": {
            "05": "Reference Label",
            "50": "Payment system specific template"
        },
        "80": {
            "00": "GUI",
            "01": "URL"
        },
        "81": {
            "00": "GUI",
            "01": "Arrangement arbitrary info"
        }
    };

    const orderedIds = Object.keys(pixFields).sort();

    orderedIds.forEach(id => {
        const field = pixFields[id];
        const emvName = emvDescription[id] || "Unknown ID";

        if (subFieldsEMV[id]) {
            const mainRow = document.createElement('tr');
            mainRow.innerHTML = `
                <td>
                    <button class="icon-button toggle-btn">
                        <span class="icon-svg down-arrow">${getDownArrowSvg()}</span>
                        <span class="icon-svg up-arrow" style="display:none;">${getDownArrowSvg()}</span>
                    </button>
                </td>
                <td>${id}</td>
                <td>${emvName}</td>
                <td>${field.length.toString().padStart(2, '0')}</td>
                <td>${field.value}</td>
            `;
            tbody.appendChild(mainRow);

            const expandedRow = document.createElement('tr');
            expandedRow.classList.add('collapse-content');

            const subTable = document.createElement('table');
            subTable.classList.add('table');
            subTable.innerHTML = `
                <colgroup>
                    <col style="width: 5%;">
                    <col style="width: 5%;">
                    <col style="width: 40%;">
                    <col style="width: 5%;">
                    <col style="width: 45%;">
                </colgroup>
                <thead>
                    <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Nome EMV</th>
                        <th>Tamanho</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const subTbody = subTable.querySelector('tbody');
            const subIds = Object.keys(field.subtags).sort();

            subIds.forEach(subId => {
                const subField = field.subtags[subId];
                const subEMVName = subFieldsEMV[id][subId] || "Unknown Subtag";

                const subRow = document.createElement('tr');
                subRow.innerHTML = `
                    <td></td>
                    <td>${subId}</td>
                    <td>${subEMVName}</td>
                    <td>${subField.subLength.toString().padStart(2, '0')}</td>
                    <td>${subField.subValue}</td>
                `;
                subTbody.appendChild(subRow);
            });

            const expandedCell = document.createElement('td');
            expandedCell.colSpan = 5;
            expandedCell.appendChild(subTable);
            expandedRow.appendChild(expandedCell);
            tbody.appendChild(expandedRow);

        } else {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td></td>
                <td>${id}</td>
                <td>${emvName}</td>
                <td>${field.length.toString().padStart(2, '0')}</td>
                <td>${field.value}</td>
            `;
            tbody.appendChild(row);
        }
    });

    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function () {
            const collapseRow = this.closest('tr').nextElementSibling;
            const downArrow = this.querySelector('.down-arrow');
            const upArrow = this.querySelector('.up-arrow');

            if (collapseRow.classList.contains('show')) {
                collapseRow.classList.remove('show');
                setTimeout(() => {
                    collapseRow.style.display = 'none';
                }, 250);

                downArrow.style.display = 'inline-block';
                upArrow.style.display = 'none';
            } else {
                collapseRow.style.display = 'table-row';
                setTimeout(() => {
                    collapseRow.classList.add('show');
                }, 10);

                downArrow.style.display = 'none';
                upArrow.style.display = 'inline-block';
            }
        });
    });

}

function getDownArrowSvg() {
    return `<div class="icon-button">
                <div class="icon-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="m2 5 6 6 6-6"/>
                    </svg>
                </div>
            </div>`;
}