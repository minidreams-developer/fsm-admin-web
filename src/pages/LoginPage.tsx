import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bug, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Bug className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Easy Pest Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Panel Login</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-6 sm:p-8 card-shadow space-y-5">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@easypest.in"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            Sign In
          </button>
          {error && <p className="text-center text-xs text-destructive">{error}</p>}
          <p className="text-center text-xs text-muted-foreground">Forgot your password? Contact IT Support</p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
