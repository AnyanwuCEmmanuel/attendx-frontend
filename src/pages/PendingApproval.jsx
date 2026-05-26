import { Link } from 'react-router-dom'

function PendingApproval() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900
    via-indigo-950 to-slate-900 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl
      shadow-2xl p-8 text-center">

        <div className="w-20 h-20 bg-yellow-100 rounded-full
        flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Awaiting Approval
        </h1>

        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Your lecturer account has been created and is awaiting
          admin approval. You will have full access to lecturer
          features once your account is approved.
        </p>

        <div className="bg-indigo-50 border border-indigo-200
        rounded-xl p-4 mb-6 text-left">
          <p className="text-indigo-700 text-sm font-semibold mb-2">
            What happens next?
          </p>
          <ul className="space-y-1">
            <li className="text-indigo-600 text-xs flex items-center gap-2">
              <span>✓</span> Admin reviews your registration
            </li>
            <li className="text-indigo-600 text-xs flex items-center gap-2">
              <span>✓</span> Account gets approved
            </li>
            <li className="text-indigo-600 text-xs flex items-center gap-2">
              <span>✓</span> You gain full lecturer access
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 text-white font-semibold
          py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default PendingApproval