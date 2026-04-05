import React from 'react';
import { EMV_DESCRIPTIONS, SUB_FIELDS_EMV, PIX_CONFIG } from '../../../logic/core/constants';

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
                        <th className="p-3 w-28 text-center border-r-2 border-white/10 text-white/90">Posição</th>
                        <th className="p-3 w-16 text-center border-r-2 border-white/10 text-white/90">Tag</th>
                        <th className="p-3 w-16 text-center border-r-2 border-white/10 text-white/90">Tamanho</th>
                        <th className="p-3 border-r-2 border-white/10 text-white/90">Valor (Extraído)</th>
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
                            <td className="p-3 font-mono text-sm break-all font-bold border-r-2 border-foreground/5">
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

export default PixResultTable;
