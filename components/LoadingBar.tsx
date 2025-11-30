export default function LoadingBar() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-[#001122]">
      <div className="w-full max-w-md px-4">
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}

