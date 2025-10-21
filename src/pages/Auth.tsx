import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  loginFormSchema,
  signupFormSchema,
  resetPasswordSchema,
  calculatePasswordStrength,
  sanitizeForLogging,
  type LoginFormData,
  type SignupFormData,
  type ResetPasswordData,
} from "@/lib/authValidation";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({ 
    score: 0, 
    message: "", 
    color: "destructive" as "destructive" | "yellow" | "green" 
  });

  // Validate password strength
  const validatePassword = (password: string) => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  // Social auth handler
  const handleSocialAuth = async (provider: 'google' | 'azure' | 'apple') => {
    try {
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/profile-completion`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur d'authentification",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate with zod schema
      const validatedData = loginFormSchema.parse({
        email: loginEmail,
        password: loginPassword,
      });

      console.log("Login attempt:", sanitizeForLogging({ email: validatedData.email }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      // Check if profile is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profile || !profile.profile_completed) {
        navigate("/profile-completion");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/client-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", sanitizeForLogging({ error: error.message }));
      
      let errorMessage = "Une erreur est survenue lors de la connexion";
      
      // Handle zod validation errors
      if (error.errors) {
        errorMessage = error.errors[0]?.message || errorMessage;
      } else if (error.message) {
        // Provide user-friendly messages for common Supabase errors
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate with zod schema
      const validatedData = signupFormSchema.parse({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        phone: signupPhone || undefined,
      });

      console.log("Signup attempt:", sanitizeForLogging({ 
        email: validatedData.email, 
        name: validatedData.name 
      }));
      const redirectUrl = `${window.location.origin}/profile-completion`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validatedData.name,
            phone: validatedData.phone || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            full_name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone || null,
          });

        if (profileError) throw profileError;

        // Assign client role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "client",
          });

        if (roleError) throw roleError;

        toast({
          title: "Compte créé avec succès",
          description: "Vous pouvez maintenant compléter votre profil",
        });

        // Navigate after a short delay to ensure auth state is updated
        setTimeout(() => {
          navigate("/profile-completion");
        }, 500);
      }
    } catch (error: any) {
      console.error("Signup error:", sanitizeForLogging({ error: error.message }));
      
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      // Handle zod validation errors
      if (error.errors) {
        errorMessage = error.errors[0]?.message || errorMessage;
      } else if (error.message) {
        // Provide user-friendly messages for common Supabase errors
        if (error.message.includes("User already registered")) {
          errorMessage = "Un compte existe déjà avec cet email";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "Le mot de passe ne respecte pas les critères de sécurité";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate with zod schema
      const validatedData = resetPasswordSchema.parse({
        email: resetEmail,
      });

      console.log("Password reset request:", sanitizeForLogging({ email: validatedData.email }));

      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });

      setShowResetPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", sanitizeForLogging({ error: error.message }));
      
      let errorMessage = "Une erreur est survenue lors de la réinitialisation";
      
      // Handle zod validation errors
      if (error.errors) {
        errorMessage = error.errors[0]?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {showResetPassword ? "Réinitialiser le mot de passe" : "Bienvenue"}
          </CardTitle>
          <CardDescription>
            {showResetPassword 
              ? "Entrez votre email pour recevoir un lien de réinitialisation"
              : "Connectez-vous ou créez un compte pour accéder à vos services"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="votre@email.fr"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowResetPassword(false)}
              >
                Retour à la connexion
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Alert className="border-primary/20 bg-primary/5">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      Connexion sécurisée avec authentification multi-facteurs disponible
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.fr"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => setShowResetPassword(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                  
                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      Ou continuer avec
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('google')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('azure')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.4 24H0V12.6L11.4 24zM13.4 0v11.4L24 0H13.4zm0 13.4V24l10.6-10.6H13.4zM0 10.6V0l10.6 10.6H0z"/>
                      </svg>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('apple')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <Alert className="border-primary/20 bg-primary/5">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      Mot de passe sécurisé requis : 8+ caractères, majuscules, minuscules, chiffres
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.fr"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Téléphone (optionnel)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signupPassword && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength.score
                                  ? passwordStrength.color === "destructive"
                                    ? "bg-destructive"
                                    : passwordStrength.color === "yellow"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          passwordStrength.color === "destructive"
                            ? "text-destructive"
                            : passwordStrength.color === "yellow"
                            ? "text-yellow-600 dark:text-yellow-500"
                            : "text-green-600 dark:text-green-500"
                        }`}>
                          {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création du compte..." : "Créer un compte"}
                  </Button>
                  
                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      Ou continuer avec
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('google')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('azure')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.4 24H0V12.6L11.4 24zM13.4 0v11.4L24 0H13.4zm0 13.4V24l10.6-10.6H13.4zM0 10.6V0l10.6 10.6H0z"/>
                      </svg>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialAuth('apple')}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;