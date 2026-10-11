import React, { useState } from 'react';
import { api } from '../services/api';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  districtCode: string;
  tradeId: string;
  tradeName: string;
  currentSeats: number;
  onSuccess?: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  districtCode,
  tradeId,
  tradeName,
  currentSeats,
  onSuccess
}) => {
  const [newSeats, setNewSeats] = useState(currentSeats);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('A detailed policy justification (min 10 characters) is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createOverride({
        districtCode,
        tradeId,
        month: '2026-10',
        originalVal: currentSeats,
        overrideVal: Number(newSeats),
        reason
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-black">
          <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
            Apply Planner Override
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="font-mono font-bold text-sm hover:text-red-600"
          >
            [X]
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Overrides adjust sanctioned training capacity for <span className="font-bold text-black">{tradeName}</span> in district <span className="font-bold text-black">{districtCode}</span>. An immutable audit record will be logged.
        </p>

        {error && (
          <div className="p-2 mb-3 bg-red-100 border border-red-500 text-red-900 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block font-bold text-black mb-1 uppercase">
              Current Model Capacity (Seats)
            </label>
            <input
              type="text"
              readOnly
              value={currentSeats}
              className="w-full p-2 bg-slate-100 border border-slate-400 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1 uppercase">
              New Sanctioned Seats Target
            </label>
            <input
              type="number"
              value={newSeats}
              onChange={(e) => setNewSeats(Number(e.target.value))}
              required
              className="w-full p-2 bg-white border border-black focus:outline-none focus:ring-1 focus:ring-black font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1 uppercase">
              Mandatory Policy Justification *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sanctioned additional batch under PM-Surya Ghar Scheme..."
              required
              className="w-full p-2 bg-white border border-black focus:outline-none focus:ring-1 focus:ring-black font-sans text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-400 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white font-bold border border-black hover:bg-slate-800"
            >
              {loading ? 'Submitting...' : 'Commit Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
