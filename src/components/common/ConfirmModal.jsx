const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-fuchsia-100">
        <h3 className="text-lg font-semibold text-fuchsia-700 mb-2">Confirmar acción</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;