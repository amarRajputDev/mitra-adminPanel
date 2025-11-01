import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/authSlice";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  


  
  
 //TODO: Implement actual authentication logic (Currently Not working)
  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    const user = {email ,  password , name: "Admin"}; 
    // console.log(user)
    // const res = await axios.post(`http://localhost:3001/api/admin/login-admin`, user, { withCredentials: true });
    // console.log("running...")
    // console.log(res.data.message);

    // TODO: Implement actual authentication logic
    // dispatch(login());

    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-background p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-lg">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            MitraTender Admin
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form  className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mitratender.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm h-auto">
                Forgot password?
              </Button>
            </div>
            <Button type="submit" onClick={handleLogin} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
