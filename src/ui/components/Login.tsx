import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import LoaderModal from "./Loader";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import desktopIcon from "../assets/desktopIcon.png";


interface LoginProps {
  setUser: (u: any) => void;
}

export default function Login({ setUser }: LoginProps) {
  // const [email, setEmail] = useState("exousia.navi@auroramy.com");
  // const [password, setPassword] = useState("3tYfGWEwHzDTZ7S");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Listen for token changes to automatically update role
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true); // force refresh
          const data = await window.electron!.sendToken(token);
          if (data.success) {
            setUser({
              uid: data.uid,
              name: data.name,
              email: data.email,
              photoURL: data.photoURL,
              role: data.role,
            });
          }
        } catch (err) {
          console.error("Failed to refresh token:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Force refresh token to get latest role
      const token = await auth.currentUser?.getIdToken(true);
      if (token) {
        const data = await window.electron!.sendToken(token);
        if (data.success) {
          setMessage(`Welcome ${data.name ?? ""} (${data.email ?? ""})`);
          setUser({
            uid: data.uid,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL,
            role: data.role,
          });
        } else {
          setError("Login failed: " + data.error);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl border border-green-100">
        {/* Company logo */}
        <div className="flex justify-center">
          <img
            src={desktopIcon}
            alt="Company Logo"
            className="w-16 h-16 rounded-full shadow-md"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-green-700">
          CRM Login
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* email input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <Mail className="absolute left-3 top-[38px] text-gray-400" size={18} />
          </div>

          {/* password input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <Lock className="absolute left-3 top-[38px] text-gray-400" size={18} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* error / success */}
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {message && (
            <p className="text-sm text-green-600 font-medium">{message}</p>
          )}

          {/* login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {loading && (
            <LoaderModal
              type={true}
              visible={loading}
              message="Authenticating..."
              icon={"icon"}
              color="green-500"
              size={6}
            />
          )}
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Need help? Contact{" "}
          <span className="text-green-600 font-medium">Bi Programmer</span>
        </p>
      </div>
    </div>
  );
}
