import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to avoid flash
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4">
      <Card className="container max-w-4xl mx-auto p-6 bg-background/95 backdrop-blur border-2 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t.cookieTitle || "We use cookies"}</h3>
              <p className="text-sm text-muted-foreground">
                {t.cookieDescription || "We use cookies and collect data to improve your experience and for analytics purposes. Your data may be shared with partners for advertising. By accepting, you consent to our data practices."}
              </p>
              <Link 
                to="/privacy-policy" 
                className="text-sm text-primary hover:underline inline-block"
              >
                {t.privacyPolicy || "Privacy Policy"}
              </Link>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleReject}
              className="flex-1 md:flex-none"
            >
              {t.rejectCookies || "Reject"}
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1 md:flex-none"
            >
              {t.acceptCookies || "Accept All"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};