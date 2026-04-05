import React from 'react';

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
                        <th className="p-3 w-16 text-center border-r-2 border-white/10 text-white/90">ID</th>
                        <th className="p-3 border-r-2 border-white/10 text-white/90">Tipo</th>
                        <th className="p-3 w-32 border-r-2 border-white/10 text-white/90">Tamanho</th>
                        <th className="p-3">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground/5">
                    {fields.map((f) => (
                        <tr key={f.id} className="hover:bg-primary/5 transition-colors">
                            <td className="p-3 font-black text-xs border-r-2 border-foreground/5 w-16 text-center tabular-nums bg-surface/30">
                                {f.id}
                            </td>
                            <td className="p-3 font-bold text-sm border-r-2 border-foreground/5">
                                {f.type}
                            </td>
                            <td className="p-3 font-mono text-xs text-foreground/60 w-32 border-r-2 border-foreground/5">
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

export default CardResultTable;
