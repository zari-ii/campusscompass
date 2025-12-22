import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Database, Share2, Lock, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back || "Back"}
          </Link>

          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Shield className="h-16 w-16 mx-auto text-primary" />
              <h1 className="text-4xl font-bold">{t.privacyPolicy || "Privacy Policy"}</h1>
              <p className="text-muted-foreground">
                {t.lastUpdated || "Last updated"}: December 22, 2024
              </p>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{t.dataWeCollect || "Data We Collect"}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t.dataCollectionDesc || "We collect the following information to improve our services and provide you with a better experience:"}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>{t.accountInfo || "Account Information"}:</strong> {t.accountInfoDesc || "University email address and anonymous username for authentication"}</li>
                  <li><strong>{t.surveyData || "Survey Data"}:</strong> {t.surveyDataDesc || "Academic year, how you found us, and previous platforms used"}</li>
                  <li><strong>{t.usageData || "Usage Data"}:</strong> {t.usageDataDesc || "Reviews submitted, interactions with the platform, and browsing behavior"}</li>
                  <li><strong>{t.technicalData || "Technical Data"}:</strong> {t.technicalDataDesc || "Device information, IP address, browser type, and cookies"}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{t.howWeUseData || "How We Use Your Data"}</h2>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>{t.serviceProvision || "Service Provision"}:</strong> {t.serviceProvisionDesc || "To provide and maintain our platform"}</li>
                  <li><strong>{t.analytics || "Analytics"}:</strong> {t.analyticsDesc || "To understand user behavior and improve our services"}</li>
                  <li><strong>{t.advertising || "Advertising & Revenue"}:</strong> {t.advertisingDesc || "Aggregated and anonymized data may be shared with advertising partners for targeted advertising and revenue generation"}</li>
                  <li><strong>{t.research || "Research"}:</strong> {t.researchDesc || "To conduct academic research on educational trends (anonymized)"}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{t.dataSharing || "Data Sharing"}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t.dataSharingDesc || "We may share your data with:"}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>{t.advertisingPartners || "Advertising Partners"}:</strong> {t.advertisingPartnersDesc || "Aggregated user demographics and interests for targeted advertising"}</li>
                  <li><strong>{t.analyticsProviders || "Analytics Providers"}:</strong> {t.analyticsProvidersDesc || "To help us understand platform usage patterns"}</li>
                  <li><strong>{t.researchInstitutions || "Research Institutions"}:</strong> {t.researchInstitutionsDesc || "Anonymized data for educational research purposes"}</li>
                  <li><strong>{t.legalRequirements || "Legal Requirements"}:</strong> {t.legalRequirementsDesc || "When required by law or to protect our rights"}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{t.cookiesTitle || "Cookies & Tracking"}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t.cookiesDesc || "We use cookies and similar tracking technologies to:"}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{t.cookieAuth || "Maintain your authentication session"}</li>
                  <li>{t.cookiePrefs || "Remember your preferences (language, theme)"}</li>
                  <li>{t.cookieAnalytics || "Collect analytics data about platform usage"}</li>
                  <li>{t.cookieAds || "Enable targeted advertising from our partners"}</li>
                </ul>
                <p className="text-muted-foreground">
                  {t.cookieControl || "You can control cookies through our cookie consent banner or your browser settings. Rejecting cookies may limit some platform functionality."}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{t.yourRights || "Your Rights"}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t.yourRightsDesc || "You have the right to:"}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{t.rightAccess || "Access your personal data"}</li>
                  <li>{t.rightCorrect || "Correct inaccurate data"}</li>
                  <li>{t.rightDelete || "Request deletion of your data"}</li>
                  <li>{t.rightObject || "Object to data processing for marketing"}</li>
                  <li>{t.rightPortability || "Request data portability"}</li>
                </ul>
              </section>

              <section className="space-y-4 bg-muted/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold">{t.contactUs || "Contact Us"}</h2>
                <p className="text-muted-foreground">
                  {t.contactUsDesc || "If you have questions about this Privacy Policy or your data, please contact us at:"}
                </p>
                <p className="font-medium">privacy@campuscompass.edu</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;