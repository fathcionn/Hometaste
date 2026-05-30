import { isRtlLocale, type Locale } from "@hometaste/i18n";
import { HeaderControls } from "../../components/HeaderControls";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "tr" }];
}

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
  return (
    <html lang={params.locale} dir={isRtlLocale(params.locale) ? "rtl" : "ltr"}>
      <body>
        <nav className="nav">
          <a href={`/${params.locale}`} className="brand">HomeTaste</a>
          <a href={`/${params.locale}/browse`}>Browse</a>
          <a href={`/${params.locale}/orders`}>Orders</a>
          <a href={`/${params.locale}/profile`}>Account</a>
          <HeaderControls locale={params.locale} />
        </nav>
        {children}
      </body>
    </html>
  );
}
