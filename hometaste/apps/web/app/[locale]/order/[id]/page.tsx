export default function OrderPage({ params }: { params: { id: string } }) {
  return <main className="band"><h1>Order #{params.id}</h1><ol className="tracker"><li>Placed</li><li>Accepted</li><li>Preparing</li><li>Delivered</li></ol></main>;
}
