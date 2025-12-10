'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
