import { useState } from 'react';
import { X, Upload, Loader, Check, AlertCircle } from 'lucide-react';
import { supabase, type GroupMember } from '../lib/supabase';

type ExtractedItem = {
  name: string;
  total: number;
  member_id?: string;
};

type BillData = {
  data: ExtractedItem[];
  grandTotal: number;
  currency: string;
};

type UploadBillModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  onSuccess: () => void;
};

export function UploadBillModal({ isOpen, onClose, groupId, members, onSuccess }: UploadBillModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<BillData | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadBill = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://mayanksoni710.app.n8n.cloud/webhook/receive-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process bill');
      }

      const data: BillData = await response.json();
      setExtractedData(data);
      setItems(data.data.map(item => ({ ...item, member_id: '' })));
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to upload bill. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateItemMember = (index: number, memberId: string) => {
    const newItems = [...items];
    newItems[index].member_id = memberId;
    setItems(newItems);
  };

  const saveExpenses = async () => {
    setUploading(true);
    setError('');

    try {
      const expensesToInsert = items
        .filter(item => item.member_id)
        .map(item => ({
          group_id: groupId,
          member_id: item.member_id!,
          description: item.name,
          amount: item.total,
          category: 'Groceries',
          date: new Date().toISOString().split('T')[0],
        }));

      if (expensesToInsert.length === 0) {
        setError('Please assign at least one item to a member');
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('expenses')
        .insert(expensesToInsert);

      if (insertError) throw insertError;

      onSuccess();
      resetAndClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expenses');
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setExtractedData(null);
    setItems([]);
    setError('');
    setStep('upload');
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upload Bill</h2>
              <p className="text-gray-400 text-sm">
                {step === 'upload' ? 'Upload a bill image to extract items' : 'Review and assign expenses'}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            disabled={uploading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-orange-400/50 transition-colors">
                <input
                  type="file"
                  id="bill-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="bill-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {file ? file.name : 'Click to upload bill'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports JPG, PNG, PDF (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-white">{file.name}</span>
                    <span className="text-gray-400 text-sm">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'review' && extractedData && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Grand Total</span>
                  <span className="text-2xl font-bold text-orange-400">
                    {extractedData.currency} {extractedData.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Extracted Items</h3>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-orange-400 font-semibold">
                          {extractedData.currency} {item.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Assign to Member (Optional)
                      </label>
                      <select
                        value={item.member_id || ''}
                        onChange={(e) => updateItemMember(index, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="">Select member</option>
                        {members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900/80">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            {step === 'upload' ? (
              <button
                type="button"
                onClick={uploadBill}
                disabled={!file || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Extract Data</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={saveExpenses}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Save Expenses</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
