import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Logo from "/trackAS.png";
import Input from "../component/Input";
import Spinner from "../component/Spinner";
import toast from "react-hot-toast";

const LoginLecturer = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login successful");
      navigate("/classDetails");
    } catch (error) {
      setError(error.error_description || error.message);
      toast.error(`${error.error_description || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid md:grid-cols-2 min-h-screen">
      {/* ---------- Left Side: Premium Glass Form ---------- */}
      <div className="flex items-center justify-center px-6 lg:px-24 bg-gray-100 relative">
        <div
          className="
            backdrop-blur-md bg-white/30 
            border border-white/40 
            rounded-2xl shadow-2xl 
            p-10 w-full max-w-md
          "
        >
          <div className="flex flex-col items-center mb-6">
            <img src={Logo} alt="login logo" className="w-24 h-auto" />
            <h2 className="text-[#000D46] font-bold text-3xl mt-3">
              Welcome Back!
            </h2>
            <p className="text-sm text-neutral-700 mt-1">
              Sign in to continue to TrackAS
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              className="
                btn bg-[#000D46] text-white btn-block mt-4 
                font-semibold text-base rounded-lg shadow-lg
                hover:bg-[#00125e] transition-colors duration-300
                disabled:bg-[#000D46] disabled:cursor-not-allowed
              "
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-700">
            Don&apos;t have an account?{" "}
            <Link
              className="text-[#000D46] font-semibold hover:underline"
              to={"/registerLecturer"}
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* ---------- Right Side: Dimmed Image ---------- */}
      <div className="relative hidden md:block">
        <img
          src="https://www.shriconnect.com/wp-content/uploads/2024/02/peruvian-south-american-schoolchildren-posing-alone-with-their-teachers-performing-tasks-scaled.jpg"
          alt="login screen image"
          className="h-full w-full object-cover"
        />
        {/* Dark Overlay for Dimming */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
    </section>
  );
};

export default LoginLecturer;
