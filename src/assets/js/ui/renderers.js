import { EMV_DESCRIPTIONS, SUB_FIELDS_EMV } from '../core/constants.js';

/**
 * UI Renderers for PayCheckBR.
 * Focus: Reporting information from Result payloads into the DOM.
 */

/**
 * Renders a detailed analysis report for a Pix QR Code.
 * Narrative:
 * 1. Identify the container and clean existing content.
 * 2. Traverse the EMV Tags and create hierarchical rows for nested metadata.
 *
 * @param {Object} pixData 
 * @param {string} containerId 
 * @param {string} bodyId 
 */
export const displayPixAnalysisReport = (pixData, containerId, bodyId) => {
    const reportContainer = document.getElementById(containerId);
    const tableBody = document.getElementById(bodyId);
    
    reportContainer.classList.remove('d-none');
    tableBody.innerHTML = '';

    const orderedTagIdentifiers = Object.keys(pixData.fields).sort();
    
    orderedTagIdentifiers.forEach(tagId => {
        const tag = pixData.fields[tagId];
        const emvDefinition = EMV_DESCRIPTIONS[tagId] || "Tag EMV Desconhecida";

        if (SUB_FIELDS_EMV[tagId]) {
            // Case: Tag contains nested sub-tags (Templates)
            const mainRow = buildEMVMainRow(tagId, emvDefinition, tag);
            tableBody.appendChild(mainRow);

            const expandedRow = buildEMVSubtagRow(tagId, tag.subtags);
            tableBody.appendChild(expandedRow);
        } else {
            // Case: Simple primitive Tag
            const row = document.createElement('tr');
            row.innerHTML = `<td></td><td>${tagId}</td><td>${emvDefinition}</td><td>${tag.length.toString().padStart(2, '0')}</td><td>${tag.value}</td>`;
            tableBody.appendChild(row);
        }
    });

    registerEMVToggleBehaviors();
};

/**
 * Renders a detailed report for Credit Card analysis.
 */
export const displayCardAnalysisReport = (cardData, containerId, bodyId) => {
    const reportContainer = document.getElementById(containerId);
    const tableBody = document.getElementById(bodyId);
    
    reportContainer.classList.remove('d-none');
    tableBody.innerHTML = '';

    const cardReportEntries = [
        { label: "Número do Cartão (mascarado)", value: cardData.masked, meta: `${cardData.length} dígitos` },
        { label: "Bandeira do Cartão", value: cardData.brand, meta: "N/A" },
        { label: "Tipo de Cartão", value: cardData.type, meta: "N/A" },
        { label: "Emissor do Cartão", value: cardData.issuer, meta: "N/A" },
        { label: "País de Emissão", value: cardData.country, meta: "N/A" },
        { label: "IIN/BIN (Prefix)", value: cardData.bin, meta: "6 dígitos" },
        { label: "Sequência Númerica", value: cardData.sequence, meta: "9 dígitos" },
        { label: "Dígito Verificador", value: `<span class="highlight-verifier">${cardData.verifier}</span>`, meta: "1 dígito" }
    ];

    cardReportEntries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${entry.label}</td><td>${entry.meta}</td><td>${entry.value}</td>`;
        tableBody.appendChild(row);
    });
};

/**
 * Renders a detailed report for Bank Slip (Boleto) analysis.
 */
export const displayBoletoAnalysisReport = (boletoData, containerId, bodyId) => {
    const reportContainer = document.getElementById(containerId);
    const tableBody = document.getElementById(bodyId);
    
    reportContainer.classList.remove('d-none');
    tableBody.innerHTML = '';

    const boletoReportEntries = [
        { label: "Formato Identificado", value: boletoData.type, meta: `${boletoData.length} dígitos` },
        { label: "Instituição de Pagamento", value: `${boletoData.bank.code} (${boletoData.bank.name})`, meta: "Febraban Standard" },
        { label: "Vencimento Calculado", value: boletoData.dueDate, meta: "Fator de Vencimento" },
        { label: "Valor Nominal", value: boletoData.amount, meta: "Cálculo de Centavos" },
        { label: "Conversão cruzada", value: boletoData.converted, meta: "Barcode ↔ Readable" }
    ];

    boletoReportEntries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${entry.label}</td><td>${entry.meta}</td><td>${entry.value}</td>`;
        tableBody.appendChild(row);
    });
};

/**
 * Notifies the user with a localized Bootstrap tooltip and validation state styling.
 * @param {string} message 
 * @param {string} type ('success' | 'warning' | 'error')
 * @param {string} inputId 
 */
export const notifyUserWithTooltip = (message, type, inputId) => {
    const targetInputElement = document.getElementById(inputId);
    if (!targetInputElement) return;

    // Part 1: Lifecycle Management of previous tooltips
    let existingTooltip = bootstrap.Tooltip.getInstance(targetInputElement);
    if (existingTooltip) existingTooltip.dispose();

    // Part 2: Styling the Input State
    targetInputElement.classList.toggle("is-valid", type === "success" || type === "warning");
    targetInputElement.classList.toggle("is-invalid", type === "error");

    // Part 3: Deploying new Tooltip
    targetInputElement.setAttribute('title', message);
    const newTooltip = new bootstrap.Tooltip(targetInputElement, { trigger: 'manual' });
    newTooltip.show();

    // Part 4: Auto-cleanup
    setTimeout(() => {
        const t = bootstrap.Tooltip.getInstance(targetInputElement);
        if (t) t.dispose();
    }, 3000);
};

// Internal EMV UI Helpers
const buildEMVMainRow = (tagId, definition, data) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><button class="icon-button toggle-btn">${getDownArrowSvg()}</button></td>
        <td>${tagId}</td><td>${definition}</td>
        <td>${data.length.toString().padStart(2, '0')}</td>
        <td>${data.value}</td>`;
    return row;
};

const buildEMVSubtagRow = (parentTagId, nestedTags) => {
    const row = document.createElement('tr');
    row.classList.add('collapse-content');
    row.style.display = 'none';
    
    const wrapperCell = document.createElement('td');
    wrapperCell.colSpan = 5;
    
    const subTable = document.createElement('table');
    subTable.className = 'table mb-0';
    subTable.innerHTML = `<thead><tr><th></th><th>ID</th><th>Nome</th><th>Tamanho</th><th>Valor</th></tr></thead><tbody></tbody>`;
    
    const tableBody = subTable.querySelector('tbody');
    
    Object.keys(nestedTags).sort().forEach(subTagId => {
        const subData = nestedTags[subTagId];
        const subTagDefinition = SUB_FIELDS_EMV[parentTagId][subTagId] || "Sub-tag Desconhecida";
        
        const tr = document.createElement('tr');
        tr.innerHTML = `<td></td><td>${subTagId}</td><td>${subTagDefinition}</td><td>${subData.subLength.toString().padStart(2, '0')}</td><td>${subData.subValue}</td>`;
        tableBody.appendChild(tr);
    });

    wrapperCell.appendChild(subTable);
    row.appendChild(wrapperCell);
    return row;
};

const registerEMVToggleBehaviors = () => {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.onclick = function() {
            const collapsibleRow = this.closest('tr').nextElementSibling;
            const isCurrentlyVisible = collapsibleRow.style.display === 'table-row';
            
            collapsibleRow.style.display = isCurrentlyVisible ? 'none' : 'table-row';
            collapsibleRow.classList.toggle('show', !isCurrentlyVisible);
        };
    });
};

const getDownArrowSvg = () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m2 5 6 6 6-6"/>
    </svg>`;
