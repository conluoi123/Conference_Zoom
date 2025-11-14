import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function ZoomSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-blue-400 shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6 text-zinc-900">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-zinc-900">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-900">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Sign In
          </button>

          <div className="text-center mt-3">
            <a href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full border p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-900 transition text-zinc-900"
            >
              <FcGoogle size={20} /> Sign in with Google
            </button>

            <button
              type="button"
              className="w-full border p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-900 transition text-zinc-900"
            >
              <FaFacebook size={20} /> Sign in with Facebook
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm">
          New to Zoom?{" "}
          <a className="text-blue-600 hover:underline" href="#">
            Sign up free
          </a>
        </div>
      </div>
    </div>
  );
}
