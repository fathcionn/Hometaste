import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return { title: `Cook ${params.id} · HomeTaste`, description: "Home cook profile and menu" };
}

export default function CookPage({ params }: { params: { id: string } }) {
  return <main><section className="cook-hero"><div className="avatar" /><h1>Cook {params.id}</h1><p>★ 4.9 · 120 orders · usually replies quickly</p></section><section className="band"><h2>Menu</h2><div className="grid"><article className="card"><div className="photo" /><h3>Signature dish</h3></article></div></section></main>;
}
