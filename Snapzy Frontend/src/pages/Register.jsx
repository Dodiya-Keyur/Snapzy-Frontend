
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setMessage("");

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // Username validation
        if (cleanUsername.length < 3 || cleanUsername.length > 30) {
            setMessage("Username must be between 3 and 30 characters.");
            return;
        }

        // Password validation
        if (password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            await api.post("/auth/register", {
                username: cleanUsername,
                email: cleanEmail,
                password: password,
                confirmpassword: confirmPassword,
            });

            // Redirect after successful registration
            navigate("/login", {
                replace: true,
                state: {
                    message: "Registration successful! Please log in.",
                },
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center bg-slate-200 justify-center ">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm my-5 mx-5">

                <h2 className="text-2xl font-bold text-gray-900">
                    Register
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Create your account and join Snapzy
                </p>

                {/* Register Form */}
                <form onSubmit={handleRegister} className="mt-7 space-y-5">

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            maxLength={30}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Error Message */}
                    {message && (
                        <p
                            role="alert"
                            className="text-sm text-red-600"
                        >
                            {message}
                        </p>
                    )}

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full rounded-lg py-3 text-sm font-semibold bg-black text-white transition hover:bg-gray-800bg-blue-700 active:scale-[0.99]"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {/* Login */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="font-semibold text-black hover:underline "
                    >
                        Login
                    </a>
                </div>

            </div>
        </div>
    );
}

export default Register;