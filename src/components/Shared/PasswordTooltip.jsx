// src/components/Shared/PasswordTooltip.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordTooltip = ({ isVisible, score, password }) => {
    // Requisitos de senha (texto mais detalhado)
    const requirements = [
        { text: "Pelo menos 8 caracteres", check: (p) => p.length >= 8 },
        { text: "Uma letra maiúscula (A-Z)", check: (p) => /[A-Z]/.test(p) },
        { text: "Uma letra minúscula (a-z)", check: (p) => /[a-z]/.test(p) },
        { text: "Um número (0-9)", check: (p) => /[0-9]/.test(p) },
        { text: "Um símbolo (!@#$%, etc.)", check: (p) => /[^a-zA-Z0-9\s]/.test(p) },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} // Ajustado y para aparecer acima do input
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    // Posicionamento ajustado para não se estender
                    className="absolute z-10 w-full bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl" 
                >
                    <p className="font-bold text-white mb-2">A senha deve conter:</p>
                    <ul className="space-y-1">
                        {requirements.map((req, index) => (
                            <li key={index} className={`text-sm ${req.check(password) ? 'text-green-500' : 'text-gray-400'}`}>
                                {req.text}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PasswordTooltip;