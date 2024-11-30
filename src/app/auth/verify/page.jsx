export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          Check Your Email
        </h1>
        <p className="text-center text-gray-600">
          A confirmation link has been sent to your email address. Please click
          the link to verify your account.
        </p>
        <p className="text-center text-gray-500 text-sm mt-4">
          The confirmation link will expire in 24 hours.
        </p>
      </div>
    </div>
  );
}
