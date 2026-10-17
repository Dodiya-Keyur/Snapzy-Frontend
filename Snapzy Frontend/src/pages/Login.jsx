import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            await api.post("/auth/login", {
                identifier: identifier.trim().toLowerCase(),
                password,
            });

            const currentUser = await checkAuth();

            if (!currentUser) {
                setMessage(
                    "Login succeeded, but your session could not be verified. Please try again."
                );
                return;
            }

            navigate("/", { replace: true });

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="mt-2 text-sm text-gray-500">
                        Welcome back! Login to your account.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Login
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter your details to continue.
                    </p>

                    <form onSubmit={handleLogin} className="mt-7 space-y-5">
                        <div>
                            <label
                                htmlFor="identifier"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Username / Email
                            </label>

                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                placeholder="Enter your username or email"
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-gray-500 hover:text-black"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        {message && (
                            <p
                                role="alert"
                                className="text-sm text-red-600"
                            >
                                {message}
                            </p>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                            />

                            <label
                                htmlFor="remember"
                                className="text-sm text-gray-600"
                            >
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-black hover:underline"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
