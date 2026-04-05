import React, { useState, useEffect } from 'react';
import pkg from '../package.json';
import { analyzePixQrCode } from './logic/validators/pix';
import { analyzePaymentSlipLine } from './logic/validators/bank-slip';
import { validateCreditCardData } from './logic/validators/credit-card';
import { EMV_DESCRIPTIONS, SUB_FIELDS_EMV, PIX_CONFIG } from './logic/core/constants';
import { Search, CreditCard, Receipt, QrCode, Info, CheckCircle2, AlertCircle, Sparkles, ChevronDown, ChevronRight, Github } from 'lucide-react';

const PixResultTable = ({ data }) => {
    const raw = data.raw || '';
    
    const flattenPix = (payload, offset = 0, level = 0, parentId = null) => {
        const results = [];
        let cursor = 0;

        while (cursor < payload.length) {
            const startPos = offset + cursor + 1;
            const tag = payload.substring(cursor, cursor + 2);
            const lengthStr = payload.substring(cursor + 2, cursor + 4);
            const length = parseInt(lengthStr, 10);
            const value = payload.substring(cursor + 4, cursor + 4 + length);
            const endPos = offset + cursor + 4 + length;
            
            const description = parentId 
                ? (SUB_FIELDS_EMV[parentId]?.[tag] || 'Subtag do Protocolo')
                : (EMV_DESCRIPTIONS[tag] || 'Campo Reservado Pix');

            results.push({
                pos: `${String(startPos).padStart(2, '0')} a ${String(endPos).padStart(2, '0')}`,
                tag,
                length: lengthStr,
                value: PIX_CONFIG.IDS_WITH_SUBTAGS.includes(tag) ? '-' : value,
                desc: description,
                level,
                id: tag
            });

            if (PIX_CONFIG.IDS_WITH_SUBTAGS.includes(tag)) {
                // Recursively add subtags
                results.push(...flattenPix(value, offset + cursor + 4, level + 1, tag));
            }

            cursor += 4 + length;
        }
        return results;
    };

    const anatomy = flattenPix(raw);

    return (
        <div className="overflow-x-auto border-neo border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-foreground text-white border-b-neo border-foreground font-black text-xs uppercase tracking-widest">
                        <th className="p-3 w-28 text-center">Posição</th>
                        <th className="p-3 w-16 text-center">Tag</th>
                        <th className="p-3 w-16 text-center">Tamanho</th>
                        <th className="p-3">Valor (Extraído)</th>
                        <th className="p-3">Descrição do Segmento</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground/5">
                    {anatomy.map((item, idx) => (
                        <tr key={idx} className={`hover:bg-primary/5 transition-colors ${item.level > 0 ? 'bg-surface/10' : ''}`}>
                            <td className="p-3 font-mono text-[10px] md:text-xs text-center border-r-2 border-foreground/5 tabular-nums bg-surface/30">
                                {item.pos}
                            </td>
                            <td className={`p-3 font-mono text-xs text-center border-r-2 border-foreground/5 ${item.level > 0 ? 'pl-6' : ''}`}>
                                <span className={item.level > 0 ? 'text-primary font-black' : 'font-black'}>
                                    {item.tag}
                                </span>
                            </td>
                            <td className="p-3 font-mono text-xs text-center border-r-2 border-foreground/5 text-foreground/60">
                                {item.length}
                            </td>
                            <td className="p-3 font-mono text-sm break-all font-bold">
                                {item.tag === '63' ? (
                                    <span className="bg-danger text-white px-2 py-0.5 rounded-none border-1 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {item.value}
                                    </span>
                                ) : item.value}
                            </td>
                            <td className={`p-3 text-xs md:text-sm font-bold ${item.level > 0 ? 'italic text-primary/80' : ''}`}>
                                <div className="flex items-center gap-2">
                                    {item.level > 0 && <span className="text-primary opacity-40">└─</span>}
                                    {item.desc}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CardResultTable = ({ data }) => {
    const fields = [
        { id: 1, type: 'Número do Cartão (mascarado)', size: `${data.length} dígitos`, value: data.masked },
        { id: 2, type: 'Bandeira do Cartão', size: 'N/A', value: data.brand },
        { id: 3, type: 'Tipo de Cartão', size: 'N/A', value: data.type },
        { id: 4, type: 'Emissor do Cartão', size: 'N/A', value: data.issuer },
        { id: 5, type: 'País de Emissão', size: 'N/A', value: data.country },
        { id: 6, type: 'IIN/BIN (Prefix)', size: '6 dígitos', value: data.bin },
        { id: 7, type: 'Sequência Númerica', size: '9 dígitos', value: data.sequence },
        { id: 8, type: 'Dígito Verificador', size: '1 dígito', value: data.verifier, highlight: true },
    ];

    return (
        <div className="overflow-x-auto border-neo border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-foreground text-white border-b-neo border-foreground font-black text-xs uppercase tracking-widest">
                        <th className="p-3 w-16 text-center">ID</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 w-32">Tamanho</th>
                        <th className="p-3">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground/5">
                    {fields.map((f) => (
                        <tr key={f.id} className="hover:bg-primary/5 transition-colors">
                            <td className="p-3 font-black text-xs border-r-2 border-foreground/5 w-16 text-center tabular-nums bg-surface/30">
                                {f.id}
                            </td>
                            <td className="p-3 font-bold text-sm">
                                {f.type}
                            </td>
                            <td className="p-3 font-mono text-xs text-foreground/60 w-32">
                                {f.size}
                            </td>
                            <td className="p-3 font-mono text-sm break-all font-bold">
                                {f.highlight ? (
                                    <span className="bg-danger text-white px-2 py-0.5 rounded-none border-1 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {f.value}
                                    </span>
                                ) : f.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const BoletoResultTable = ({ data }) => {
    const raw = data.raw.replace(/\D/g, '');
    const isDigitable = raw.length === 47;

    const renderSummaryHighlights = (val) => {
        if (typeof val !== 'string') return val;
        const segments = val.split(' ');
        
        // Linha Digitável (5 segments)
        if (segments.length === 5) {
            return (
                <div className="flex flex-nowrap gap-x-2 font-mono text-[10px] md:text-[11px]">
                    {segments.map((seg, i) => {
                        if (i < 3) {
                            const base = seg.slice(0, -1);
                            const dv = seg.slice(-1);
                            return <span key={i} className="whitespace-nowrap">{base} <span className="bg-danger text-white px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black">{dv}</span></span>;
                        }
                        if (i === 3) {
                            return <span key={i}><span className="bg-danger text-white px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black">{seg}</span></span>;
                        }
                        return <span key={i} className="whitespace-nowrap">{seg}</span>;
                    })}
                </div>
            );
        }
        
        // Código de Barras (44 digits) - Adding spacing for visual dissection
        if (val.length === 44 && /^\d+$/.test(val)) {
            return (
                <div className="flex flex-nowrap gap-x-1.5 md:gap-x-2 font-mono text-[10px] md:text-[11px]">
                    <span>{val.slice(0, 3)}</span>
                    <span>{val[3]}</span>
                    <span className="bg-danger text-white px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black">{val[4]}</span>
                    <span>{val.slice(5, 9)}</span>
                    <span>{val.slice(9, 19)}</span>
                    <span>{val.slice(19)}</span>
                </div>
            );
        }

        return val;
    };

    const barcodeFields = [
        { id: 1, pos: '01-03', label: 'Código do Banco', value: `${data.bank.code} (${data.bank.name})` },
        { id: 2, pos: '04-04', label: 'Código de Moeda (Real - 9)', value: raw[3] },
        { id: 3, pos: '05-05', label: 'Dígito Verificador Geral', value: raw[4], highlight: true },
        { id: 4, pos: '06-09', label: `Fator de Vencimento (${raw.slice(5, 9)})`, value: data.dueDate },
        { id: 5, pos: '10-19', label: 'Valor Nominal', value: data.amount },
        { id: 6, pos: '20-44', label: 'Campo Livre (Uso do Banco)', value: raw.slice(19) },
        { id: 7, pos: 'COMPLETO', label: 'Linha Digitável Convertida (Visualização)', value: renderSummaryHighlights(data.converted) },
    ];

    const digitableFields = [
        { id: 1, pos: '01-03', label: 'Código do Banco', value: `${data.bank.code} (${data.bank.name})` },
        { id: 2, pos: '04-04', label: 'Código de Moeda (Real - 9)', value: raw[3] },
        { id: 3, pos: '05-09', label: 'Campo Livre 1 (Primeiro Bloco)', value: raw.slice(4, 9) },
        { id: 4, pos: '10-10', label: 'DV do Campo 1', value: raw[9], highlight: true },
        { id: 5, pos: '11-20', label: 'Campo Livre 2 (Segundo Bloco)', value: raw.slice(10, 20) },
        { id: 6, pos: '21-21', label: 'DV do Campo 2', value: raw[20], highlight: true },
        { id: 7, pos: '22-31', label: 'Campo Livre 3 (Terceiro Bloco)', value: raw.slice(21, 31) },
        { id: 8, pos: '32-32', label: 'DV do Campo 3', value: raw[31], highlight: true },
        { id: 9, pos: '33-33', label: 'Dígito Verificador Geral', value: raw[32], highlight: true },
        { id: 10, pos: '34-37', label: `Fator de Vencimento (${raw.slice(33, 37)})`, value: data.dueDate },
        { id: 11, pos: '38-47', label: 'Valor Nominal', value: data.amount },
        { id: 12, pos: 'COMPLETO', label: 'Código de Barras Convertido (Visualização)', value: renderSummaryHighlights(data.converted) },
    ];

    const fields = isDigitable ? digitableFields : barcodeFields;

    return (
        <div className="overflow-x-auto border-neo border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-foreground text-white border-b-neo border-foreground font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">
                        <th className="p-3 w-12 text-center">ID</th>
                        <th className="p-3 w-20 md:w-24 text-center">Posição</th>
                        <th className="p-3">Descrição do Protocolo</th>
                        <th className="p-3">Valor Extraído</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground/5">
                    {fields.map((f) => (
                        <tr key={f.id} className="hover:bg-primary/5 transition-colors">
                            <td className="p-3 font-black text-xs border-r-2 border-foreground/5 w-12 text-center tabular-nums bg-surface/30">
                                {f.id}
                            </td>
                            <td className="p-3 font-mono text-[10px] md:text-xs text-foreground/60 w-20 md:w-24 text-center tabular-nums">
                                {f.pos}
                            </td>
                            <td className="p-3 font-bold text-xs md:text-sm">
                                {f.label}
                            </td>
                            <td className={`p-3 font-mono font-bold ${f.pos === 'COMPLETO' ? 'text-[10px] md:text-[11px] whitespace-nowrap overflow-x-auto max-w-[300px] md:max-w-none' : 'text-xs md:text-sm break-all'}`}>
                                {f.highlight ? (
                                    <span className="bg-danger text-white px-2 py-0.5 rounded-none border-1 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {f.value}
                                    </span>
                                ) : f.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const App = () => {
    const [paymentType, setPaymentType] = useState('pix');
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const paymentTypes = [
        { id: 'pix', label: 'Pix', icon: <QrCode className="w-5 h-5" /> },
        { id: 'card', label: 'Cartão', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'boleto', label: 'Boleto', icon: <Receipt className="w-5 h-5" /> },
    ];

    const samples = {
        pix: '00020126360014BR.GOV.BCB.PIX0114+55119123456785204000053039865406100.555802BR5914THIAGO CAJAIBA6011SANTO ANDRE62200516PAGAMENTOOUT202463043BAB',
        card: '5464984762204819',
        boleto: '23791234051000123420102400124307698850000020025'
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleValidation(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue, paymentType]);

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

    return (
        <div className="min-h-screen bg-surface p-4 md:p-8 font-sans text-foreground">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <header className="text-center space-y-4">
                    <div className="inline-block bg-primary border-neo border-foreground p-3 shadow-neo transform -rotate-1">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            PayCheck<span className="text-white outline-text">BR</span>
                        </h1>
                    </div>
                    <p className="text-lg font-medium max-w-lg mx-auto leading-tight">
                        Validador inteligente de pagamentos. Sabe aquele pix ou boleto suspeito? <span className="bg-primary px-1">Cheque aqui.</span>
                    </p>
                </header>

                {/* Main Card */}
                <main className="neo-card p-6 md:p-10 space-y-8 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary border-l-neo border-b-neo transform translate-x-12 -translate-y-12 rotate-45 hidden md:block" />

                    {/* Type Selector */}
                    <div className="flex flex-wrap gap-3">
                        {paymentTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => { 
                                    setPaymentType(type.id); 
                                    setInputValue(''); 
                                    setResult(null); 
                                }}
                                className={`flex items-center gap-2 px-6 py-3 font-bold border-neo transition-all ${
                                    paymentType === type.id 
                                    ? 'bg-primary shadow-neo translate-x-[-2px] translate-y-[-2px]' 
                                    : 'bg-white hover:bg-surface'
                                }`}
                            >
                                {type.icon}
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="block text-sm font-black uppercase tracking-widest">
                                {paymentType === 'pix' ? 'Pix Copia e Cola' : paymentType === 'card' ? 'Número do Cartão' : 'Código do Boleto'}
                            </label>
                            <button 
                                onClick={() => setInputValue(samples[paymentType])}
                                className="flex items-center gap-1 text-xs font-bold uppercase bg-surface border-neo border-foreground px-2 py-1 hover:bg-primary transition-all active:shadow-none"
                            >
                                <Sparkles className="w-3 h-3" /> Exemplo
                            </button>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Insira o código aqui..."
                                className={`w-full h-32 neo-input resize-none text-lg font-mono p-4 group-focus-within:shadow-neo transition-all ${isLoading ? 'opacity-50' : ''}`}
                            />
                            <div className="absolute bottom-4 right-4 bg-foreground text-white px-2 py-1 text-xs font-bold neo-badge border-white border-2 shadow-none">
                                {inputValue.length} CHARS
                            </div>
                        </div>
                    </div>

                    {/* Result Feedback */}
                    {result && (
                        <div className={`p-4 border-neo flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                            result.isSuccess ? 'bg-success/5 border-success' : 'bg-danger/5 border-danger'
                        }`}>
                            {result.isSuccess ? (
                                <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-danger shrink-0" />
                            )}
                            <div className="space-y-1">
                                <h3 className={`font-black uppercase text-sm ${result.isSuccess ? 'text-success' : 'text-danger'}`}>
                                    {result.isSuccess ? 'Estrutura Válida!' : 'Erro na Validação'}
                                </h3>
                                <p className="font-medium text-sm leading-tight text-foreground/80">
                                    {result.isSuccess ? 'O formato está correto de acordo com os padrões técnicos.' : result.error.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Result Tables */}
                    {result?.isSuccess && (
                        <div className="space-y-6 pt-4 border-t-2 border-foreground/10">
                            <h3 className="font-black uppercase flex items-center gap-2 italic">
                                <Info className="w-5 h-5 text-primary fill-primary/20" />
                                Detalhes da Análise
                            </h3>
                            <p className="text-xs font-bold text-foreground/50 -mt-4 italic pl-7">
                                {paymentType === 'pix' && 'Protocolo: Segue layout TLV conforme o padrão EMV® QRCPS (Banco Central).'}
                                {paymentType === 'card' && 'Protocolo: Segue o padrão internacional ISO/IEC 7812 (Identificação de Emissores).'}
                                {paymentType === 'boleto' && 'Protocolo: Segue o padrão FEBRABAN de Arrecadação e Boletos Bancários.'}
                            </p>
                            
                            {paymentType === 'pix' && <PixResultTable data={result.value} />}
                            {paymentType === 'card' && <CardResultTable data={result.value} />}
                            {paymentType === 'boleto' && <BoletoResultTable data={result.value} />}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="text-center py-12 opacity-60 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest">
                        PayCheckBR v{pkg.version} • {new Date().getFullYear()}
                    </p>
                    <a 
                        href="https://github.com/thiagocajadev/PayCheckBR" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter hover:text-primary transition-colors"
                    >
                        <Github className="w-3 h-3" /> Source Code
                    </a>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .outline-text {
                    -webkit-text-stroke: 1.5px #1C293C;
                }
            `}} />
        </div>
    );
};

export default App;
