// src/components/Shared/PasswordStrengthMeter.jsx
import React from 'react';

const PasswordStrengthMeter = ({ score }) => {
    const strength = {
        0: { text: '', color: 'bg-gray-500' },
        1: { text: 'Fraca', color: 'bg-red-500' },
        2: { text: 'Razoável', color: 'bg-yellow-500' },
        3: { text: 'Boa', color: 'bg-green-500' },
        4: { text: 'Forte', color: 'bg-emerald-500' },
    };
    const currentStrength = strength[score] || strength[0];

    return (
        <div className="w-full mt-2 h-6">
            <div className="grid grid-cols-4 gap-2">
                {Array.from(Array(4).keys()).map((i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-colors ${score > i ? currentStrength.color : 'bg-gray-600'}`}></div>
                ))}
            </div>
            {currentStrength.text && (
                <p className={`text-xs mt-1 text-right text-${currentStrength.color.split('-')[1]}-500`}>{currentStrength.text}</p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;