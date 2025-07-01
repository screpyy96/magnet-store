import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'We offer fast UK shipping with delivery typically taking 2-3 business days after production. Production usually takes 1-2 business days. International shipping is also available with delivery times varying by destination.'
    },
    {
      question: 'What file formats do you accept?',
      answer: 'We accept JPG, PNG, and PDF files. For best results, we recommend using high-resolution images (at least 300 DPI). Our design team will ensure your magnets look their best before printing.'
    },
    {
      question: 'Can I order custom shapes and sizes?',
      answer: 'Absolutely! We offer a variety of standard sizes and custom shapes. If you have a specific shape in mind, simply upload your design or describe your requirements, and our team will work with you to bring your vision to life.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day satisfaction guarantee. If you\'re not completely happy with your order, contact us within 30 days of receiving your magnets for a full refund or replacement. Custom orders are non-refundable unless there is a quality issue.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer significant discounts for bulk orders. The more you order, the more you save! Contact our sales team at sales@magnetstore.com for a personalized quote on large orders.'
    },
    {
      question: 'How do I care for my magnets?',
      answer: 'Our magnets are durable and long-lasting. To keep them looking their best, simply wipe them with a clean, damp cloth when needed. Avoid exposing them to extreme heat or direct sunlight for extended periods.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our custom magnets
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-5 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-${index}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-indigo-600 transition-transform duration-200 ${openIndex === index ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              <div
                id={`faq-${index}`}
                className={`px-6 pb-5 pt-0 text-gray-600 transition-all duration-300 ease-in-out ${openIndex === index ? 'block' : 'hidden'}`}
                aria-hidden={openIndex !== index}
              >
                <p className="mt-2">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Contact Us
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
