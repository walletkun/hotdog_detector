export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          You have successfully Signed up! 🎉
        </h1>
        <p className="text-center text-gray-600">
          You can now navigate to your personal profile and start detecting!
        </p>
        <p className="text-center text-gray-500 text-sm mt-4">
          Welcome to the Hotdog Hall of Fame! 🌭
        </p>
      </div>
    </div>
  );
}
