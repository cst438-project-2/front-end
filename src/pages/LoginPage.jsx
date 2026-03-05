import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-md w-full text-center p-10 bg-white rounded-3xl shadow-xl">

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          MemoryBank
        </h1>

        <p className="text-gray-500 mb-8">
          Store memories. Share moments. Revisit life.
        </p>

        {/* Sign Up Button */}
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition mb-4"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 bg-white rounded-full p-[2px]"
          />
          Sign up with Google
        </button>

        {/* Login Button */}
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Login with Google
        </button>

        <p className="text-xs text-gray-400 mt-8">
          By continuing you agree to MemoryBank’s terms and privacy policy.
        </p>

      </div>
    </div>
  );
}