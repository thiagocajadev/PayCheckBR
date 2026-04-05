import React from 'react';

const Header = () => {
    return (
        <header className="text-center space-y-6">
            <div className="inline-block bg-primary border-neo border-foreground p-4 md:p-6 shadow-neo transform -rotate-1">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                    PayCheck<span className="text-white outline-text">BR</span>
                </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold max-w-2xl mx-auto leading-tight">
                Validador inteligente de pagamentos. Sabe aquele pix ou boleto suspeito? <span className="bg-primary px-1">Cheque aqui.</span>
            </p>
        </header>
    );
};

export default Header;
