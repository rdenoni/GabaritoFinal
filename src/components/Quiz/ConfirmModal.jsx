import React from 'react';

const ConfirmModal = ({ onCancel, onConfirm }) => (
  <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'>
    <div className='bg-gray-800 p-6 rounded-3xl shadow-lg max-w-md w-full animate-fade-up border border-gray-700'>
      <h3 className='text-xl font-semibold text-[--color-accent] mb-4'>Confirmar Correção</h3>
      <p className='text-gray-200 mb-6'>Deseja corrigir o quiz agora? Esta ação é irreversível.</p>
      <div className='flex justify-end space-x-4'>
        <button className='px-4 py-2 bg-gray-600 text-gray-200 rounded-xl' onClick={onCancel}>Cancelar</button>
        <button className='px-4 py-2 bg-green-600 text-white rounded-xl' onClick={onConfirm}>Confirmar</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;