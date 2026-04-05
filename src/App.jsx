import React from 'react';
import { CreditCard, Receipt, QrCode, Info, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PixResultTable from './components/features/analysis/PixResultTable';
import CardResultTable from './components/features/analysis/CardResultTable';
import BoletoResultTable from './components/features/analysis/BoletoResultTable';
import { usePaymentAnalysis } from './hooks/usePaymentAnalysis';

const App = () => {
    const {
        paymentType,
        inputValue,
        setInputValue,
        result,
        isLoading,
        changePaymentType,
        loadSample
    } = usePaymentAnalysis();

    const paymentTypes = [
        { id: 'pix', label: 'Pix', icon: <QrCode className="w-5 h-5" /> },
        { id: 'card', label: 'Cartão', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'boleto', label: 'Boleto', icon: <Receipt className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-surface p-4 md:p-8 font-sans text-foreground flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full space-y-8 py-12">
                
                <Header />

                {/* Main Card */}
                <main className="neo-card p-6 md:p-10 space-y-8 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary border-l-neo border-b-neo transform translate-x-12 -translate-y-12 rotate-45 hidden md:block" />

                    {/* Type Selector */}
                    <div className="flex flex-wrap gap-3">
                        {paymentTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => changePaymentType(type.id)}
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
                                onClick={loadSample}
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

                <Footer />
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
