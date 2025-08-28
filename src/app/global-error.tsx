"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Erro Global!
            </h2>
            <p className="mb-6 text-gray-600">
              Ocorreu um erro crítico na aplicação.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
