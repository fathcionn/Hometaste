export async function generateMetadata() {
  return {
    title: "Privacy Policy - HomeTaste",
    description: "How HomeTaste collects and uses your data"
  };
}

export default async function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-US")}</p>

      <h2>Data We Collect</h2>
      <p>
        HomeTaste collects information needed to run a homemade food marketplace, including your name, email address,
        phone number, account role, delivery address, approximate location, order history, messages, reviews, and saved
        preferences. If you become a cook or upload dish photos, we also collect profile photos, dish photos, camera
        verification metadata, kitchen availability, menu details, and payout or payment-related identifiers.
      </p>

      <h2>Why We Collect It</h2>
      <p>
        We use this data to create and secure accounts, connect customers with home cooks, process orders and payments,
        coordinate delivery, provide customer support, send order updates, prevent fraud, and verify photos taken through
        the camera flow for live dish or profile verification.
      </p>

      <h2>Who We Share It With</h2>
      <p>
        We share only what is necessary with service providers that help operate HomeTaste. Delivery couriers may receive
        delivery details and contact information for active orders. Payment providers such as Stripe or local payment
        partners process payment information. Cloudinary stores uploaded images. Email, push notification, hosting,
        analytics, and infrastructure providers may process limited data on our behalf under their own security controls.
      </p>

      <h2>Photos, Camera, And Location</h2>
      <p>
        Camera and photo library access are used to upload profile, dish, and review photos. Location access is used to
        fill delivery addresses, estimate nearby cooks, and support delivery tracking when enabled. You can deny these
        permissions, but some features may not work without them.
      </p>

      <h2>Cookies</h2>
      <p>
        The HomeTaste website uses cookies and similar technologies to keep you signed in, remember preferences such as
        language and country, measure site performance, and protect the service from abuse. You can control cookies in
        your browser settings, though disabling essential cookies may affect core features.
      </p>

      <h2>Deleting Your Data</h2>
      <p>
        You can request account deletion and removal of personal data by emailing privacy@hometaste.app. We may retain
        limited records where required for legal, tax, security, payment dispute, or fraud-prevention obligations.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, deletion requests, or data access requests, contact HomeTaste at privacy@hometaste.app.
      </p>
    </main>
  );
}
