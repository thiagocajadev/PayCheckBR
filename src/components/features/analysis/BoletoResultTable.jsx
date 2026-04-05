import React from 'react';

const BoletoResultTable = ({ data }) => {
    const raw = data.raw.replace(/\D/g, '');
    const isDigitable = raw.length === 47;

    const renderSummaryHighlights = (val) => {
        if (typeof val !== 'string') return val;
        const segments = val.split(' ');
        
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

export default BoletoResultTable;
