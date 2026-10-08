import { Link } from "react-router-dom";

function Login() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">

                    <p className="mt-2 text-sm text-gray-500">
                        Welcome back! Login to your account.
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">

                    <h2 className="text-2xl font-bold text-gray-900">
                        Login
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter your details to continue.
                    </p>

                    <form className="mt-7 space-y-5">

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        {/* Password */}
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        {/* Remember Me */}
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

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Login
                        </button>
                    </form>

                    {/* Register */}
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
