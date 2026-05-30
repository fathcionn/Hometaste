import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return { title: `Dish ${params.id} · HomeTaste`, description: "Homemade dish detail" };
}

export default function DishPage({ params }: { params: { id: string } }) {
  return <main className="detail"><div className="detail-photo" /><section><h1>Dish {params.id}</h1><p>Fresh homemade food with optional sauces and drinks.</p><button className="button">Add to cart</button></section></main>;
}
