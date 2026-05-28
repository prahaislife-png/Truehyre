export default function VerifyCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-sm w-full text-center shadow-sm">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '1px solid #86efac' }}
        >
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Verification submitted</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Thank you. Your verification has been submitted and is being reviewed.
          You can close this tab.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Results are typically available within a few minutes.
        </p>
      </div>
    </div>
  )
}
