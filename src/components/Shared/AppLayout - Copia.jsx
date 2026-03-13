import React from 'react';
import HeaderSection from '../HomePage/HeaderSection';
import NewFooter from '../HomePage/NewFooter';

// O layout agora recebe e repassa 'session' e 'supabase'
const AppLayout = ({ children, setPage, session, supabase, headerRefreshKey, setCurrentPageIsLoading, setCurrentPageLoadProgress }) => { // Recebe props de loading
    return (
        <div className="flex flex-col min-h-screen w-full">
            <HeaderSection setPage={setPage} session={session} supabase={supabase} headerRefreshKey={headerRefreshKey} />
            <main className="flex-grow">
                {children}
            </main>
            <NewFooter />
        </div>
    );
};

export default AppLayout;