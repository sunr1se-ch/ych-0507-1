import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { importSamples, downloadTemplate } from '../utils/api';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await importSamples(file);
      if (res.success) {
        setResult({ success: true, message: `成功导入 ${res.count} 条数据` });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setResult({ success: false, message: res.error || '导入失败' });
      }
    } catch (e) {
      setResult({ success: false, message: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
        style={{
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">导入采样数据</h3>
          <button
            onClick={handleClose}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              file
                ? 'border-sky-500/50 bg-sky-500/5'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
            }`}
          >
            {file ? (
              <>
                <FileText size={32} className="mb-2 text-sky-400" />
                <p className="text-sm font-medium text-sky-300">{file.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload size={32} className="mb-2 text-zinc-500" />
                <p className="text-sm font-medium text-zinc-400">点击选择CSV文件</p>
                <p className="mt-1 text-xs text-zinc-600">支持CSV格式，最多10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">导入格式说明：</p>
            <ul className="space-y-1 text-[11px] text-zinc-500">
              <li>• 必须包含列：段号、采样时间、水导率、流量</li>
              <li>• 采样时间格式：YYYY-MM-DD（如 2025-01-15）</li>
              <li>• 水导率和流量为数值类型</li>
              <li>• 重复数据（同段同日期）将自动跳过</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-xs text-sky-400 hover:text-sky-300"
            >
              ↓ 下载导入模板
            </button>
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                result.success
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-rose-500/10 text-rose-300'
              }`}
            >
              {result.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {result.message}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                导入中...
              </>
            ) : (
              <>
                <Upload size={14} />
                确认导入
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
