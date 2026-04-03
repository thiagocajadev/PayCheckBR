/**
 * Shared constants and configuration for the PayCheckBR application.
 */

export const API_URLS = {
    CHARGEBLAST: 'https://api.chargeblast.com/bin'
};

export const EXAMPLE_DATA = {
    PIX: '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5914THIAGO CAJAIBA6011SANTO ANDRE62200516PAGAMENTOOUT202463043BAB',
    CARD: '5464984762204819',
    BOLETO: '23796988500000200251234010001234200240012430'
};

export const PIX_CONFIG = {
    IDS_WITH_SUBTAGS: ['26', '27', '62', '80', '81']
};

export const PAYMENT_TYPES = {
    PIX: '1',
    CARD: '2',
    BOLETO: '3'
};

export const PAYMENT_OPTIONS = [
    { value: PAYMENT_TYPES.PIX, text: 'PIX' },
    { value: PAYMENT_TYPES.CARD, text: 'Cartão' },
    { value: PAYMENT_TYPES.BOLETO, text: 'Boleto' }
];

export const EMV_DESCRIPTIONS = {
    '00': 'Payload Format Indicator',
    '01': 'Point of Initiation Method',
    '04': 'Merchant Account Information – Cards',
    '26': 'Merchant Account Information – PIX',
    '27': 'Merchant Account Information – Other',
    '52': 'Merchant Category Code',
    '53': 'Transaction Currency',
    '54': 'Transaction Amount',
    '58': 'Country Code',
    '59': 'Merchant Name',
    '60': 'Merchant City',
    '61': 'Postal Code',
    '62': 'Additional Data Field',
    '80': 'Unreserved Templates',
    '81': 'Unreserved Templates',
    '63': 'CRC16'
};

export const SUB_FIELDS_EMV = {
    '26': { '00': 'GUI', '01': 'PIX Key' },
    '27': { '00': 'GUI', '01': 'AccountId' },
    '62': { '05': 'Reference Label', '50': 'Payment system specific template' },
    '80': { '00': 'GUI', '01': 'URL' },
    '81': { '00': 'GUI', '01': 'Arrangement arbitrary info' }
};

export const CARD_BINS = [
    { brand: 'Visa', binRegex: /^4[0-9]{12}(?:[0-9]{3})?$/, minLength: 13, maxLength: 16 },
    { brand: 'MasterCard', binRegex: /^5[1-5][0-9]{14}$/, minLength: 16, maxLength: 16 },
    { brand: 'American Express', binRegex: /^3[47][0-9]{13}$/, minLength: 15, maxLength: 15 },
    { brand: 'Discover', binRegex: /^6(?:011|5[0-9]{2})[0-9]{12}$/, minLength: 16, maxLength: 16 },
    { brand: 'Diners Club', binRegex: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, minLength: 14, maxLength: 14 },
    { brand: 'JCB', binRegex: /^(?:2131|1800|35[0-9]{五})[0-9]{11}$/, minLength: 16, maxLength: 19 },
    { brand: 'UnionPay', binRegex: /^62[0-9]{14,17}$/, minLength: 16, maxLength: 19 },
    { brand: 'Maestro', binRegex: /^(5018|5020|5038|6304|6759|676[1-3])[0-9]{8,15}$/, minLength: 12, maxLength: 19 },
    { brand: 'Elo', binRegex: /^4011[0-9]{12}|(4312|4389|4514|4576|5041|5066|5090|6277|6363)[0-9]{12}$/, minLength: 16, maxLength: 16 },
    { brand: 'Hipercard', binRegex: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/, minLength: 13, maxLength: 19 }
];

export const BANK_CODES = {
    '001': 'Banco do Brasil',
    '003': 'Banco da Amazônia',
    '004': 'Banco do Nordeste do Brasil',
    '024': 'Banco de Pernambuco',
    '029': 'Banco do Estado do Rio de Janeiro',
    '033': 'Banco Santander',
    '037': 'Banco do Estado do Pará',
    '041': 'Banco do Estado do Rio Grande do Sul',
    '044': 'Banco BVA',
    '062': 'Hipercard Banco Múltiplo',
    '065': 'Banco Lemon',
    '066': 'Banco Morgan Stanley',
    '072': 'Banco Rural Mais',
    '074': 'Banco J. Safra',
    '077': 'Banco Inter',
    '079': 'Banco JBS',
    '082': 'Banco Topázio',
    '104': 'Caixa Econômica Federal',
    '184': 'Banco Itaú BBA S.A.',
    '197': 'Stone Pagamentos',
    '208': 'Banco BTG Pactual',
    '212': 'Banco Original',
    '218': 'Banco Bonsucesso',
    '229': 'Banco Cruzeiro do Sul',
    '237': 'Banco Bradesco',
    '241': 'Banco Clássico',
    '250': 'Banco de Crédito e Varejo (BCV)',
    '260': 'Nubank',
    '290': 'PagBank',
    '336': 'C6 Bank',
    '341': 'Itaú Unibanco',
    '376': 'Banco JPMorgan S.A.',
    '422': 'Banco Safra',
    '464': 'Banco Sumitomo Mitsui Brasileiro',
    '477': 'Citibank',
    '604': 'Banco Industrial do Brasil',
    '610': 'Banco VR',
    '654': 'Banco AJ Renner',
    '655': 'Banco Votorantim',
    '707': 'Banco Daycoval',
    '734': 'Banco Gerdau',
    '735': 'Banco Neon',
    '746': 'Banco Modal',
    '748': 'Banco Cooperativo Sicredi S.A.',
    '749': 'Banco Simples',
    '102': 'XP Investimentos CCTVM S.A.',
    '119': 'Western Union do Brasil',
    '380': 'PicPay'
};
