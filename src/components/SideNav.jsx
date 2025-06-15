import React from 'react';

// --- Ícones ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ContestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;

const SideNav = ({ setPage, page }) => {
    const navItems = [
        { id: 'home-page', label: 'Início', icon: <HomeIcon /> },
        { id: 'federal-contests', label: 'Concursos', icon: <ContestIcon /> },
    ];

    return (
        <nav className="w-20 lg:w-64 bg-[--cor-primaria] p-4 flex flex-col items-center lg:items-start shadow-2xl z-30 shrink-0">
            <img 
                src='/img/LOGO_AZ_VERT.svg' 
                alt='Gabarito Final Logo' 
                className='w-24 h-24 lg:w-40 lg:h-40 object-contain self-center my-4 cursor-pointer'
                onClick={() => setPage('home-page')}
            />
            <ul className="w-full mt-10 space-y-3">
                {navItems.map(item => (
                    <li key={item.id}>
                        <button 
                            onClick={() => setPage(item.id)}
                            className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-colors duration-200 ${page.startsWith(item.id.split('-')[0]) ? 'bg-[--cor-terciaria] text-[--cor-titulos]' : 'text-white/70 hover:bg-[--cor-terciaria]/50 hover:text-white'}`}
                        >
                            {item.icon}
                            <span className="ml-4 hidden lg:inline font-semibold">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideNav;