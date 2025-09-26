export default function Init() {
  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">
      <div className="loader min-w-[150px] min-h-[70px] flex flex-col items-center justify-center text-green-500">
        {/* <span className="">Starting</span> */}
        <div className="starting-loader"></div>
        <span className="">Starting Application...</span>
      </div>
    </div>
  );
}
