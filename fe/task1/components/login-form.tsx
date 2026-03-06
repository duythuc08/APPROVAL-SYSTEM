"use client"
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {jwtDecode} from "jwt-decode";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {authService} from "@/lib/service/auth-api";

interface DecodedToken{
    "iss": string,
    "sub": string,
    "exp": number,
    "iat": number,
    "jti": string,
    "scope": string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const [userName, setUsername] = useState("");
    const [passWord, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token){
                try {
                    const decoded: any = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        localStorage.removeItem("token");
                        router.push("/");
                        return;
                    }
                } catch (any){
                }
            }
        }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try{
            const data = await authService.login(userName, passWord);
            const token = data.result.token;
            localStorage.setItem("token",token);

            const decoded = jwtDecode<DecodedToken>(token);
            const userRole = decoded.scope;

            if(userRole === "ROLE_ADMIN"){
                router.push("/dashboard/admin");
            } else if (userRole === "ROLE_USER"){
                router.push("/dashboard/user");
            } else {
                router.push("/dashboard/approver")
            }

        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="usernname"
                  type="text"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
                    {error && <p className="text-red-500 text-sm italic">{error}</p>}
              <Field>
                <Button type="submit" disabled={loading} className="cursor-pointer w-full">
                    {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                    ) : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
