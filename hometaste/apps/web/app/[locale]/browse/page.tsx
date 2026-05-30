import { bundledTranslations, getMessage, type Locale } from "@hometaste/i18n";
import { CUISINES } from "@hometaste/types";

export default function BrowsePage({ params }: { params: { locale: Locale } }) {
  const messages = bundledTranslations[params.locale] ?? bundledTranslations.en!;
  const t = (key: string) => getMessage(messages, key);
  return <main className="layout"><aside className="filters"><h2>{t("browse.filters")}</h2>{CUISINES.map((cuisine) => <label key={cuisine.id}><input type="checkbox" /> {cuisine.emoji} {cuisine.name}</label>)}</aside><section className="results"><h1>{t("browse.dishes")} / {t("browse.cooks")}</h1><input className="wide-input" placeholder={t("home.searchPlaceholder")} /><div className="grid">{[1,2,3,4,5,6].map((item) => <article className="card" key={item}><div className="photo" /><h3>Koshari Bowl</h3><p>Verified · $12</p></article>)}</div></section></main>;
}
