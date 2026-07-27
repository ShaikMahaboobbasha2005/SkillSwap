import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/logo.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#16160F] antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Wordmark Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logoImg}
            alt="SkillSwap Logo"
            className="w-16 h-16 object-contain rounded-2xl mb-4 border border-[#E6E3DA] bg-white p-2 shadow-sm"
          />
          <h1 className="text-3xl font-bold tracking-tight text-[#16160F]">
            Skill<span className="text-[#1B4332]">Swap</span>
          </h1>
          <p className="font-brand-serif italic text-xs tracking-widest uppercase text-[#6B6858] mt-1.5 font-medium">
            Swap Skills. Grow Together.
          </p>
        </div>

        <h2 className="mt-8 text-center text-xl font-semibold tracking-tight text-[#16160F]">
          Create your account
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Notion / Linear inspired card panel */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[16px] border border-[#E6E3DA] transition-all duration-200">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-[10px] bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-sm flex items-start space-x-3 animate-fadeIn"
            >
              <svg
                className="w-5 h-5 text-[#E53E3E] shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#6B6858] mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                aria-required="true"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F7F6F2] border border-[#E6E3DA] text-[#16160F] placeholder-[#9C9A8C] text-sm focus:outline-none focus:bg-white focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#6B6858] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F7F6F2] border border-[#E6E3DA] text-[#16160F] placeholder-[#9C9A8C] text-sm focus:outline-none focus:bg-white focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-colors"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#6B6858]">
                  Password
                </label>
                <span className="text-[11px] text-[#6B6858]">Min 6 characters</span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-[10px] bg-[#F7F6F2] border border-[#E6E3DA] text-[#16160F] placeholder-[#9C9A8C] text-sm focus:outline-none focus:bg-white focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6858] hover:text-[#16160F] focus:outline-none p-1 rounded-md transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-[10px] text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4332] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-[#E6E3DA] text-center text-xs text-[#6B6858]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#1B4332] hover:underline transition-all">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
