
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <AuthForm type="login" />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Demo login: admin@example.com / admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
