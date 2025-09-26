import { Link } from "react-router-dom";
import LogoutButton from "../component/LogoutButton";
import useUserDetails from "../hooks/useUserDetails";
import logo from "../../public/trackAS.png";
// import bgImage from "../../public/bgImage.jpg";

const ClassDetails = () => {
  const { userDetails } = useUserDetails();
  return (
    <div
      className="relative flex flex-col w-full min-h-screen"
      style={{
        backgroundImage: `url(https://leadschool.in/wp-content/uploads/2024/02/how-is-LEAD-Groups-Attendance.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for light opacity */}
      <div className="absolute inset-0 bg-white opacity-30 pointer-events-none"></div>

      {/* Logout button */}
      <div className="absolute top-6 right-8 z-10">
        <LogoutButton />
      </div>

      {/* Actual Content */}
      <div className="relative flex flex-col w-full h-full">
        {/* ✅ Transparent premium box */}
        <div className="flex justify-center items-center h-[80vh]">
          <div
            className="
              backdrop-blur-md bg-white/20 
              border border-white/30 
              rounded-2xl shadow-2xl 
              p-10 flex flex-col gap-y-10 items-center
              max-w-lg w-full
            "
          >
            <div>
              <div className="items-center flex justify-center">
                <img src={logo} alt="logo" className="w-32 h-auto" />
              </div>
              <h2 className="lg:text-4xl text-neutral-800 md:text-2xl text-xl font-bold mt-2 text-center">
                Welcome, {userDetails?.fullName}
              </h2>
            </div>

            <div className="flex gap-x-4">
              <Link
                className="btn capitalize text-black hover:text-white text-lg bg-transparent border border-white/50 hover:bg-[#000D46] transition-colors duration-300"
                to={"/PreviousClass"}
              >
                previous class
              </Link>
              <Link
                className="btn capitalize text-white text-lg bg-[#000D46] hover:bg-[#00125e] transition-colors duration-300"
                to={"/classSchedule"}
              >
                create class
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
