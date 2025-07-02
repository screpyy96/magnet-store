import Script from 'next/script';

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "#organization",
    "name": "My Sweet Magnets",
    "url": "https://mysweetmagnets.co.uk",
    "logo": "https://mysweetmagnets.co.uk/images/logo.png",
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
      "streetAddress": "123 Magnet Street",
      "addressLocality": "Manchester",
      "postalCode": "M1 1AA",
      "addressCountry": "GB"
    },
    "priceRange": "££",
    "founder": {
      "@type": "Person",
      "name": "Emma Johnson"
    },
    "foundingDate": "2020-01-01",
    "description": "UK's leading custom photo magnets, handcrafted with love in Manchester. Create beautiful fridge magnets from your photos with our easy online designer."
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
