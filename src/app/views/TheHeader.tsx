'use client'
import React from 'react';
import Image from 'next/image';
import MichiruLogo from '../img/MichiruLogo.jpeg';
import user from '../img/user.png';
import fetchData from '../apiHandler';

const TheHeader: React.FC = () => {
    return (
        <header className='top-0'>
            <div className="navbar bg-gray-900 shadow-sm flex justify-end">
                <div className='flex'>
                    <div className="avatar">
                        <div className="w-14 rounded">
                            <Image src={user} alt="User" width={300} height={300} />
                        </div>
                    </div>
                </div>
                <div>
                </div>
            </div>
        </header>
    );
};

export default TheHeader;