import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import SeoSchema from "@/components/SeoSchema";
import Header from "@/components/layout/Header";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom est trop long (max 100 caractères)"),
  email: z.string().trim().email("Email invalide").max(255, "L'email est trop long"),
  phone: z.string().regex(/^[+\d\s()-]{0,20}$/, "Format de téléphone invalide").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères").max(1000, "Le message est trop long (max 1000 caractères)")
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with Zod schema
    try {
      const validated = contactSchema.parse(formData);
      
      // Sanitize inputs to prevent injection attacks
      const safeName = validated.name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
      const safeMessage = validated.message.replace(/[<>]/g, '');
      
      // Construct WhatsApp URL with sanitized data
      const whatsappMessage = `Bonjour, je suis ${safeName}. ${safeMessage}`;
      const whatsappUrl = `https://wa.me/33643251289?text=${encodeURIComponent(whatsappMessage)}`;
      
      window.open(whatsappUrl, '_blank');
      toast.success("Redirection vers WhatsApp...");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(firstError.message);
      } else {
        toast.error("Une erreur s'est produite");
      }
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Téléphone",
      value: "+33 6 43 25 12 89",
      link: "tel:+33643251289"
    },
    {
      icon: Mail,
      label: "Email",
      value: "contact@torcatis.fr",
      link: "mailto:contact@torcatis.fr"
    },
    {
      icon: MapPin,
      label: "Zone d'intervention",
      value: "Pyrénées-Orientales (66)",
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact – IMOTION</title>
        <meta name="description" content="Contactez IMOTION, votre expert Apple et IA basé à Perpignan. Assistance technique, audits et projets sur mesure." />
        <link rel="canonical" href="https://imotion.fr/contact" />
      </Helmet>

      <SeoSchema
        type="Service"
        name="Support & Assistance IMOTION"
        description="Assistance technique, audit et accompagnement pour les entreprises souhaitant moderniser leur parc Apple ou intégrer l'IA."
        url="https://imotion.fr/contact"
        serviceType="Support Apple & IA"
      />

      <Header />
      <div className="bg-gradient-to-br from-background via-background to-muted/20 py-20 px-4 pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold">
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nous sommes là pour vous accompagner dans tous vos projets
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-8">Nos coordonnées</h2>
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-catalan flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                      {info.link ? (
                        <a href={info.link} className="text-lg font-semibold hover:text-primary transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-lg font-semibold">{info.value}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* WhatsApp Button */}
            <Button 
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
              onClick={() => window.open('https://wa.me/33643251289', '_blank')}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Discuter sur WhatsApp
            </Button>
          </div>

          {/* Contact Form */}
          <Card className="border-2">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.fr"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 XX XX XX XX"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Décrivez votre besoin..."
                    rows={5}
                    className="w-full"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer via WhatsApp
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Contact;
