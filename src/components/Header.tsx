import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-lg">
            <a href='/'><h1 className="text-2xl font-bold">SMARTonFHIR</h1></a>
            <div>
                <p>Name: <strong>Rice, Alexia</strong></p>
                <p>Date of Birth: <strong>1983-10-09</strong></p>
                <p>Gender: <strong>female</strong></p>
            </div>
        </header>
    );
};

export default Header;
