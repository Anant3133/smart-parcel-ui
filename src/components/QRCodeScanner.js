import React, { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FiX, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";

export default function QRCodeScanner({ isOpen, onClose, onScanSuccess }) {
  const [scanning, setScanning] = useState(false);

  const startScanner = () => {
    const qrRegionId = "qr-reader";
    setScanning(true);
    const scanner = new Html5Qrcode(qrRegionId);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          scanner.stop().then(() => {
            setScanning(false);
            try {
              const parsed = JSON.parse(decodedText);
              const trackingId = parsed.trackingId ?? "";
              const deliveryLocation = parsed.deliveryLocation ?? "";
              if (trackingId && deliveryLocation) {
                onScanSuccess({ trackingId, location: deliveryLocation });
                toast.success("QR code scanned successfully!");
              } else {
                onScanSuccess({ trackingId: decodedText, location: "" });
                toast("Scanned data missing some fields.", { icon: "⚠" });
              }
            } catch (e) {
              onScanSuccess({ trackingId: decodedText, location: "" });
              toast.success("QR code scanned successfully!");
            }
            onClose();
          });
        },
        (err) => {
          // Optionally log scan errors silently or show a subtle toast
          // toast.dismiss(); // Clear any existing toasts
        }
      )
      .catch((err) => {
        console.error("Scan start error:", err);
        setScanning(false);
        toast.error("Failed to start scanner. Please check your camera permissions.");
      });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col relative animate-fadeIn">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white select-none">Scan QR Code</h2>
          <button
            onClick={() => {
              onClose();
              setScanning(false);
            }}
            aria-label="Close scanner modal"
            className="text-gray-400 hover:text-red-500 transition-colors text-3xl font-bold select-none"
          >
            <FiX />
          </button>
        </header>

        <div
          id="qr-reader"
          className="w-full rounded-lg overflow-hidden border border-gray-700 shadow-inner"
          style={{ minHeight: 280 }}
        />

        <div className="mt-6 flex justify-center items-center gap-6">
          <button
            onClick={startScanner}
            disabled={scanning}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              scanning
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <FiCamera size={20} />
            {scanning ? "Scanning..." : "Start Scanning"}
          </button>
        </div>
      </div>
    </div>
  );
}