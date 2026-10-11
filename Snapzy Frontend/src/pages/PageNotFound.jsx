import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center">

        {/* 404 */}
        <h1 className="text-8xl font-bold tracking-tight text-gray-900 sm:text-9xl">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-semibold text-gray-800 sm:text-3xl">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
          Sorry, the page you are looking for doesn't exist or
          may have been moved.
        </p>

        {/* Back Home */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Go Back Home
        </Link>

      </div>
    </div>
  );
}

export default PageNotFound;