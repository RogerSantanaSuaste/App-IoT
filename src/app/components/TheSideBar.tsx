import React from 'react';
import Image from 'next/image';
import MichiruLogo from '../img/MichiruLogo.jpeg';
import UTLOGO from '../img/UTLOGO.png';
interface TheSideBarProps {
    children: React.ReactNode;
}

const TheSideBar: React.FC<TheSideBarProps> = ({ children }) => {
    return (
        <>
            <div className="w-40 h-screen bg-slate-900 text-white flex flex-col left-0 sticky top-0">
                <div className="p-4 text-lg font-bold">
                    <div className="flex-1">
                        <Image src={UTLOGO} alt="UT Logo" width={140} height={140} />
                    </div>
                </div>
                <nav className="flex-1 p-2 justify-between">
                    <a href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</a>
                    <a href="/charts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Gráficas</a>
                    <a href="/deletedParcelas" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Parcelas Eliminadas</a>
                    <a href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Salir</a>
                </nav>
            </div>
            <div className='flex-1'>{children}</div>
        </>
    );
};

export default TheSideBar;