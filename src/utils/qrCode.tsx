import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode as QrIcon } from 'lucide-react';

interface SurveyQRCodeProps {
  url: string;
  size?: number;
}

export const SurveyQRCode: React.FC<SurveyQRCodeProps> = ({ url, size = 160 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!url) return;

    QRCode.toDataURL(url, {
      width: size * 2, // high DPI
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((res) => {
        if (isMounted) {
          setDataUrl(res);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Failed to generate real QR code:', err);
        if (isMounted) {
          setError('Failed to generate QR code');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `survey-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Survey QR Code"
            width={size}
            height={size}
            className="rounded-lg select-none"
          />
        ) : error ? (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center text-xs text-rose-500 font-medium"
          >
            {error}
          </div>
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg animate-pulse"
          >
            <QrIcon className="w-8 h-8 opacity-40" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[11px] text-slate-500 font-mono break-all text-center max-w-[220px]">
          {url}
        </p>

        {dataUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Download className="w-3 h-3 text-slate-500" />
            Download QR PNG
          </button>
        )}
      </div>
    </div>
  );
};
