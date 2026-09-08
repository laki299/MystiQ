import React, { useState } from 'react';
import { reportUserOrMessage } from '../../services/firebase/security.service';

interface ReportModalProps {
  reporterUid: string;
  reportedUid: string;
  reportedName: string;
  messageId?: string;
  isOpen: boolean;
  on

const REPORT_REASONS = [
  'Harassment or Bullying',
  'Inappropriate / Adult Content',
  'Spam or Scam',
  'Hate Speech',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  reporterUid,
  reportedUid,
  reportedName,
  messageId,
  isOpen,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customDetail, setCustomDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalReason =
      selectedReason === 'Other' && customDetail.trim()
        ? `Other: ${customDetail.trim()}`
        : selectedReason;

    try {
      await reportUserOrMessage(reporterUid, reportedUid, finalReason, messageId);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[Report Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xs p-5 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <span className="text-3xl">✅</span>
            <p className="text-xs text-slate-200 font-semibold">Report Submitted</p>
            <p className="text-[10px] text-slate-400">Moderators will review shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">
              Report <span className="text-purple-400">{reportedName}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 block">Select Reason</label>
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-purple-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <textarea
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                rows={2}
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
