import React from 'react';

const Header = () => {
    return (
        <header className="text-center space-y-4">
            <div className="inline-block bg-primary border-neo border-foreground p-3 md:p-4 shadow-neo transform -rotate-1">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                    PayCheck <span className="text-white outline-text">BR</span>
                </h1>
            </div>
            <p className="text-lg md:text-xl font-semibold max-w-xl mx-auto leading-tight">
                Validador inteligente de pagamentos. Sabe aquele pix ou boleto suspeito? <span className="bg-primary px-1">Cheque aqui.</span>
            </p>
        </header>
    );
};

export default Header;
