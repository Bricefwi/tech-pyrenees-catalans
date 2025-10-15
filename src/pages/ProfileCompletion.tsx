import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Form state
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("France");
  const [siretSiren, setSiretSiren] = useState("");
  const [businessSector, setBusinessSector] = useState("");

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      // Check if profile already completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile?.profile_completed) {
        // Redirect to appropriate dashboard
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/client-dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_professional: isProfessional,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          mobile_phone: mobilePhone,
          email: email,
          company_name: isProfessional ? companyName : null,
          street_address: isProfessional ? streetAddress : null,
          postal_code: isProfessional ? postalCode : null,
          city: isProfessional ? city : null,
          country: isProfessional ? country : null,
          siret_siren: isProfessional ? siretSiren : null,
          business_sector: isProfessional ? businessSector : null,
          profile_completed: true,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Profil complété",
        description: "Votre profil a été enregistré avec succès",
      });

      // Check user role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/client-dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complétez votre profil</CardTitle>
          <CardDescription>
            Merci de renseigner ces informations pour finaliser votre inscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type d'utilisateur */}
            <div className="space-y-3">
              <Label>Type d'utilisateur *</Label>
              <RadioGroup
                value={isProfessional ? "professional" : "individual"}
                onValueChange={(value) => setIsProfessional(value === "professional")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer font-normal">
                    Particulier
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional" className="cursor-pointer font-normal">
                    Professionnel
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobilePhone">Téléphone mobile *</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Informations société (si professionnel) */}
            {isProfessional && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Informations société</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Raison sociale *</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Nom de votre société"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required={isProfessional}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Adresse *</Label>
                      <Input
                        id="streetAddress"
                        type="text"
                        placeholder="Numéro et nom de rue"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        required={isProfessional}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          type="text"
                          placeholder="75001"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required={isProfessional}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Paris"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required={isProfessional}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Pays *</Label>
                      <Input
                        id="country"
                        type="text"
                        placeholder="France"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required={isProfessional}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siretSiren">N° SIRET / SIREN *</Label>
                        <Input
                          id="siretSiren"
                          type="text"
                          placeholder="123 456 789 00012"
                          value={siretSiren}
                          onChange={(e) => setSiretSiren(e.target.value)}
                          required={isProfessional}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessSector">Secteur d'activité *</Label>
                        <Select
                          value={businessSector}
                          onValueChange={setBusinessSector}
                          required={isProfessional}
                        >
                          <SelectTrigger id="businessSector">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="commerce">Commerce</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="industrie">Industrie</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="restauration">Restauration</SelectItem>
                            <SelectItem value="sante">Santé</SelectItem>
                            <SelectItem value="education">Éducation</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="informatique">Informatique</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Valider mon profil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
