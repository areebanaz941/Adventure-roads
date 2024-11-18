import React, { useState } from 'react';

const SplitRouteDialog = ({ isOpen, onClose, onConfirm }) => {
  const [chunkSize, setChunkSize] = useState(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Split Selected Line</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">
            Split line every (km):
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onConfirm(chunkSize)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            DO IT
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitRouteDialog;