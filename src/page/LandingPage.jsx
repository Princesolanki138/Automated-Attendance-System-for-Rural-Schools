import { Link } from "react-router-dom";
import logo from "../../public/trackAS.png";

const LandingPage = () => {
  return (
    <div
      className="relative h-screen w-full"
      style={{
        backgroundImage: `url(https://leadschool.in/wp-content/uploads/2023/05/banner-3.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for light opacity */}
      <div className="absolute inset-0 bg-white opacity-30 pointer-events-none"></div>

      {/* Main Content */}
      <section className="relative h-full w-full grid place-items-center px-6">
        {/* ✅ Transparent Premium Box */}
        <div
          className="
            backdrop-blur-md bg-white/20 
            border border-white/30 
            rounded-2xl shadow-2xl 
            p-10 max-w-md w-full
            flex flex-col items-center gap-y-4
          "
        >
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="w-32 h-auto" />
          </div>

          <h1 className="text-center text-3xl font-bold text-neutral-800">
            Welcome to ShikshaTrack
          </h1>
          <h2 className="text-center text-lg text-neutral-700">
            Register or Login
          </h2>

          <div className="flex gap-x-4 mt-4">
            <Link to="/registerLecturer">
              <button className="btn capitalize text-black hover:text-white bg-transparent border border-white/50 hover:bg-[#000D46] transition-colors duration-300">
                Register
              </button>
            </Link>

            <Link to="/loginLecturer">
              <button className="btn capitalize text-white bg-[#000D46] hover:bg-[#00125e] transition-colors duration-300">
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
