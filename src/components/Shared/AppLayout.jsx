import React from 'react';
import HeaderSection from '../HomePage/HeaderSection';
import NewFooter from '../HomePage/NewFooter';

const AppLayout = ({ children, setPage }) => {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <HeaderSection setPage={setPage} />
            <main className="flex-grow">
                {children}
            </main>
            <NewFooter />
        </div>
    );
};

export default AppLayout;