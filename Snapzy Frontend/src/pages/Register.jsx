function Register() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

                <h2 className="text-2xl font-bold text-gray-900">
                    Register
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Create your account and join Snapzy
                </p>

                {/* Register Form */}
                <form className="mt-7 space-y-5">

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
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full rounded-lg py-3 text-sm font-semibold bg-black text-white transition hover:bg-gray-800bg-blue-700 active:scale-[0.99]"
                    >
                        Create Account
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