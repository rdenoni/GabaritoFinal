import React from 'react';
import HeaderSection from '../HomePage/HeaderSection'; // Assumindo que o path está correto
import NewFooter from '../HomePage/NewFooter'; // Assumindo que o path está correto

// O layout agora recebe e repassa 'session' e 'supabase'
const AppLayout = ({ children, setPage, session, supabase, headerRefreshKey }) => {
    console.log("AppLayout.jsx - Renderizando AppLayout...");
    console.log("AppLayout.jsx - Props recebidas: setPage, session, supabase, headerRefreshKey");
    console.log("AppLayout.jsx - Session no AppLayout:", session ? session.user.email : "null");

    return (
        <div className="flex flex-col min-h-screen w-full">
            <HeaderSection setPage={setPage} session={session} supabase={supabase} headerRefreshKey={headerRefreshKey} />
            <main className="flex-grow">
                {console.log("AppLayout.jsx - Renderizando children (conteúdo da página).")}
                {children}
                {console.log("AppLayout.jsx - Children renderizados.")}
            </main>
            <NewFooter />
        </div>
    );
};

export default AppLayout;