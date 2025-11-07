import Script from 'next/script';

export const OrganizationSchema = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://mysweetmagnets.co.uk')
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "#organization",
    "name": "My Sweet Magnets",
    "url": "https://mysweetmagnets.co.uk",
    "logo": `${origin}/logo.svg`,
    "sameAs": [
      "https://www.facebook.com/MySweetMagnetsUK",
      "https://www.instagram.com/MySweetMagnetsUK",
      "https://www.pinterest.com/MySweetMagnetsUK"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+44 1234 567890",
      "contactType": "customer service",
      "email": "hello@mysweetmagnets.co.uk",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "London",
      "addressLocality": "London",
      "postalCode": "EC1A 1BB",
      "addressCountry": "GB"
    },
    "priceRange": "££",
    "founder": {
      "@type": "Person",
      "name": "Emma Johnson"
    },
    "foundingDate": "2020-01-01",
    "description": "UK's leading custom photo magnets, handcrafted with love in London. Create beautiful fridge magnets from your photos with our easy online designer."
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
};

export default OrganizationSchema;
