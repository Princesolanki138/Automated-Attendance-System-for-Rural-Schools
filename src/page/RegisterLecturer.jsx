import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import Logo from "/trackAS.png";
import registerImg from "/registerImg.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RegisterLecturer = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!fullName || !email || !phoneNumber) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const { error: insertError } = await supabase
        .from("lecturers")
        .insert({
          fullName,
          email,
          phone_number: phoneNumber,
        });

      if (insertError) throw insertError;

      toast.success("Registration successful!");
      navigate("/loginLecturer");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-screen w-full grid md:grid-cols-2">
      {/* LEFT: Registration Form */}
      <div className="flex justify-center items-center bg-white">
        <div className="w-full max-w-md shadow-xl rounded-xl p-8 border border-gray-100">
          <div className="flex flex-col items-center">
            <img src={Logo} alt="logo" className="w-24 mb-3" />
            <h2 className="text-[#000D46] font-extrabold text-3xl mb-6">
              Create Account
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

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

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Input
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn bg-[#000D46] font-semibold text-base text-white btn-block py-3 rounded-lg hover:bg-[#001060] transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-700">
            Already have an account?{" "}
            <Link
              to="/loginLecturer"
              className="text-[#000D46] font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT: Image with Overlay */}
      <div className="relative hidden md:block">
        <img
          src={registerImg}
          alt="register background"
          className="h-screen w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </section>
  );
};

export default RegisterLecturer;
