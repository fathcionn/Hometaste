export async function generateMetadata() {
  return {
    title: "Refund Policy - HomeTaste",
    description: "HomeTaste refund and cancellation policy"
  };
}

export default function RefundPolicyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1>Refund Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-US")}</p>

      <h2>Eligibility</h2>
      <p>You may request a refund within <strong>24 hours</strong> of delivery if:</p>
      <ul>
        <li>Your order was not delivered</li>
        <li>You received wrong items</li>
        <li>The food quality was unsatisfactory</li>
        <li>The cook cancelled your order</li>
      </ul>

      <h2>How to Request</h2>
      <p>
        Open your order in the app, tap &quot;Request Refund&quot;, select a reason, and submit. Our team reviews all
        requests within 24 hours.
      </p>

      <h2>Processing Time</h2>
      <p>
        Approved refunds are returned to your original payment method within 3-5 business days for card payments. Cash
        on delivery orders receive account credit.
      </p>

      <h2>Non-Refundable</h2>
      <p>
        Refunds are not available for orders where the food was accepted and no issue was reported within the 24-hour
        window, or for change-of-mind cancellations after cooking has started.
      </p>

      <h2>Contact</h2>
      <p>Questions? Use the live chat in the app or email support@hometaste.app</p>
    </main>
  );
}
