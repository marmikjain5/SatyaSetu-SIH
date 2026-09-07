/**
 * Verification Test Suite for SatyaDrishti Deterministic Multilingual Complaint Classifier
 */

import { classifyComplaintText, normalizeComplaintText } from './complaintClassifier';
import { transliterateText } from './indicTransliteration';

export function runMultilingualVerificationTests() {
  console.log('====================================================');
  console.log('SatyaDrishti Multilingual Classifier Test Suite');
  console.log('====================================================\n');

  const testCases = [
    {
      id: 1,
      title: 'English complaint about missing MRP',
      text: 'The packet does not show the MRP.',
      expectedCategory: 'missing_mrp',
      lang: 'en',
    },
    {
      id: 2,
      title: 'Hindi complaint about missing MRP',
      text: 'इस पैकेट पर MRP नहीं लिखा है।',
      expectedCategory: 'missing_mrp',
      lang: 'hi',
    },
    {
      id: 3,
      title: 'Kannada complaint about missing MRP',
      text: 'ಈ ಪ್ಯಾಕೆಟ್ನಲ್ಲಿ MRP ನಮೂದಿಸಿಲ್ಲ.',
      expectedCategory: 'missing_mrp',
      lang: 'kn',
    },
    {
      id: 4,
      title: 'Tamil complaint about missing MRP',
      text: 'இந்த பாக்கெட்டில் MRP குறிப்பிடப்படவில்லை.',
      expectedCategory: 'missing_mrp',
      lang: 'ta',
    },
    {
      id: 5,
      title: 'Mixed-language complaint (Hinglish/English)',
      text: 'MRP nahi likha hai on this packet',
      expectedCategory: 'missing_mrp',
      lang: 'hi',
    },
    {
      id: 6,
      title: 'Complaint containing English terms (MRP/packet) inside Tamil sentence',
      text: 'இந்த packet-ல் MRP இல்லை',
      expectedCategory: 'missing_mrp',
      lang: 'ta',
    },
    {
      id: 7,
      title: 'Native-script input (Kannada price above MRP)',
      text: 'MRP ಗಿಂತ ಹೆಚ್ಚು ಹಣ ಪಡೆದಿದ್ದಾರೆ, ಬಿಲ್ ₹250 ಬರೆದಿದ್ದಾರೆ',
      expectedCategory: 'price_above_mrp',
      lang: 'kn',
    },
    {
      id: 8,
      title: 'Phonetic/transliterated input (Kanglish to Kannada)',
      text: 'ee packet alli MRP illa',
      expectedCategory: 'missing_mrp',
      lang: 'kn',
      transliterated: transliterateText('ee packet alli MRP illa', 'kn'),
    },
    {
      id: 9,
      title: 'Price Gouging in Hindi (Hinglish / Devanagari)',
      text: 'MRP से ज्यादा पैसे लिए दुकानदार ने',
      expectedCategory: 'price_above_mrp',
      lang: 'hi',
    },
    {
      id: 10,
      title: 'Short weight discrepancy in Tamil',
      text: 'பாக்கெட்டில் எடை குறைவாக உள்ளது',
      expectedCategory: 'quantity_discrepancy',
      lang: 'ta',
    },
    {
      id: 11,
      title: 'Low confidence / unclear grievance (Routing for review)',
      text: 'Very bad service and product is questionable',
      expectedCategory: 'other_unclear',
      lang: 'en',
    },
    {
      id: 12,
      title: 'Missing Manufacturer Address in Hindi',
      text: 'पैकेट पर निर्माता का नाम और पता नहीं है',
      expectedCategory: 'missing_manufacturer',
      lang: 'hi',
    },
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    const textToTest = tc.transliterated || tc.text;
    const res = classifyComplaintText(textToTest);
    const passed = res.categoryCode === tc.expectedCategory;

    if (passed) passedCount++;

    console.log(`[Test #${tc.id}] ${tc.title}`);
    console.log(` Input: "${tc.text}"`);
    if (tc.transliterated) {
      console.log(` Transliterated: "${tc.transliterated}"`);
    }
    console.log(` Category Result: ${res.categoryCode} (${res.categoryLabel})`);
    console.log(` Confidence Score: ${res.confidenceScore}% | Needs Review: ${res.needsReview}`);
    console.log(` Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('----------------------------------------------------');
  }

  console.log(`\nFinal Test Results: ${passedCount}/${testCases.length} Passed.`);
  return passedCount === testCases.length;
}

// Auto-run if executed in dev
if (typeof window !== 'undefined') {
  (window as any).runMultilingualVerificationTests = runMultilingualVerificationTests;
}
