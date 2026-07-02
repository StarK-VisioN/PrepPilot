const PageBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[#f2f2f0]" />
    <div className="absolute -top-32 left-[10%] w-[520px] h-[520px] bg-orange-300/30 rounded-full blur-[100px]" />
    <div className="absolute top-[20%] -right-20 w-[480px] h-[480px] bg-violet-300/25 rounded-full blur-[90px]" />
    <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[80px]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
  </div>
);

export default PageBackground;
