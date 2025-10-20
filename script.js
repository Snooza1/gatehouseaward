// Website 2 (Gatehouse Rewards) — Full client-side script
// Features:
// - certificates array (format: number, recipient, qualification, awardDate)
// - auto-fill from URL (?certNumber=...&name=...)
// - deduplication of certificates
// - form submit with loader and simulated lookup delay
// - display of verified / not found results
// - small helper to add new entries programmatically (used here to include the 3 requested entries)
//
// IMPORTANT: Replace placeholder numbers / award dates / qualification text below with the real values
// before deploying. The three new entries (Tunka, Yashko, Ivelina) are included near the top of the array.


// Auto-fill and auto-submit when URL contains ?certNumber=...&name=...
window.addEventListener('DOMContentLoaded', function () {
  try {
    const params = new URLSearchParams(window.location.search);
    const certParam = params.get('certNumber') || params.get('qualificationNumber') || params.get('number');
    const nameParam = params.get('name') || params.get('candidateName') || params.get('recipient');
    if (certParam) {
      const certInput = document.getElementById('certNumber') || document.getElementById('qualificationNumber') || document.getElementById('number');
      if (certInput) certInput.value = certParam;
    }
    if (nameParam) {
      const nameInput = document.getElementById('candidateName') || document.getElementById('recipientName') || document.getElementById('name');
      if (nameInput) nameInput.value = nameParam;
    }
    if (certParam && nameParam) {
      // small delay to ensure elements are present
      setTimeout(() => {
        const form = document.getElementById('verifyForm');
        if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
      }, 250);
    }
  } catch (err) {
    console.warn('Auto-fill error:', err);
  }
});


// Certificate records (simple format)
// NOTE: replace placeholders with real cert numbers, qualifications and dates
const certificates = [
  // --- EXISTING SAMPLE ENTRIES (keep or replace as needed) ---
  {
    number: "123456",
    recipient: "Maria Stefanova Ilieva",
    qualification: "GA Level 3 Diploma in Business Management",
    awardDate: "19/09/2025"
  },
  {
    number: "146882",
    recipient: "John Doe",
    qualification: "GA Level 2 Certificate in English",
    awardDate: "15/07/2024"
  },

  // --- NEW ENTRIES REQUESTED FOR WEBSITE 2 (Gatehouse Rewards) ---
  // Replace the "number" and "awardDate" fields with the official values if you have them.
  {
    number: "GA-240111", // placeholder - replace with real qualification/certificate number
    recipient: "Tunka Botyova Popova",
    qualification: "GA Level 3 Diploma in Business Administration",
    awardDate: "01/06/2024" // placeholder date (DD/MM/YYYY)
  },
  {
    number: "GA-240112", // placeholder - replace with real qualification/certificate number
    recipient: "Yashko Asparuhov Kolev",
    qualification: "GA Level 3 Diploma in Business Administration",
    awardDate: "15/06/2024" // placeholder date
  },
  {
    number: "GA-240113", // placeholder - replace with real qualification/certificate number
    recipient: "Ivelina Angelova Yankova",
    qualification: "GA Level 3 Diploma in Business Administration",
    awardDate: "30/06/2024" // placeholder date
  }

  // --- Add any other entries below if needed ---
];

// Deduplicate by number + recipient (keeps first occurrence)
(function dedupeCertificates() {
  const seen = new Set();
  const deduped = [];
  for (const c of certificates) {
    const key = ((c.number || '') + '|' + (c.recipient || '')).toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(c);
    }
  }
  // Replace contents of certificates array in-place so other code references stay valid
  certificates.splice(0, certificates.length, ...deduped);
})();


// Helper: format certificate display (HTML-safe)
function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// Main verification logic
(function attachFormHandler() {
  const form = document.getElementById('verifyForm');
  if (!form) {
    console.warn('verifyForm not found on page.');
    return;
  }

  const certInput = document.getElementById('certNumber') || document.getElementById('qualificationNumber') || document.getElementById('number');
  const nameInput = document.getElementById('candidateName') || document.getElementById('recipientName') || document.getElementById('name');
  const resultDiv = document.getElementById('result');
  const loader = document.getElementById('loader');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!resultDiv) return;

    const queryNumber = (certInput && certInput.value || '').trim();
    const queryName = (nameInput && nameInput.value || '').trim();

    // Basic validation
    if (!queryNumber && !queryName) {
      resultDiv.innerHTML = `
        <div style="background:#fff4e6;color:#b45a00;padding:14px;border-radius:8px;border:1px solid #e0b77a;margin-top:12px;">
          Enter a certificate number or candidate name to search.
        </div>`;
      return;
    }

    // Show loader (if present)
    if (loader) loader.style.display = 'flex';
    // Clear previous result
    resultDiv.innerHTML = '';

    // Simulated lookup delay to show loader (0.6 - 1.6s)
    const delay = Math.floor(Math.random() * 1000) + 600;
    setTimeout(() => {
      if (loader) loader.style.display = 'none';

      // find by number first (exact match), then fallback to name match (case-insensitive)
      let found = null;
      if (queryNumber) {
        found = certificates.find(c => (c.number || '').toLowerCase() === queryNumber.toLowerCase());
      }
      if (!found && queryName) {
        // try to match full name or parts (case-insensitive)
        const q = queryName.toLowerCase();
        found = certificates.find(c => (c.recipient || '').toLowerCase() === q
          || (c.recipient || '').toLowerCase().includes(q)
          || q.includes((c.recipient || '').toLowerCase())
        );
      }

      if (found) {
        resultDiv.innerHTML = `
          <div style="background:#e9ffef;color:#1b7a45;padding:18px;border-radius:10px;border:2px solid #1b7a45;margin-top:14px;">
            <div style="font-weight:700;font-size:1.05rem;margin-bottom:8px;">Certificate Verified ✅</div>
            <div><strong>Recipient:</strong> ${escapeHtml(found.recipient)}</div>
            <div><strong>Certificate Number:</strong> ${escapeHtml(found.number)}</div>
            <div><strong>Qualification:</strong> ${escapeHtml(found.qualification)}</div>
            <div><strong>Award Date:</strong> ${escapeHtml(found.awardDate)}</div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="background:#fff0f0;color:#b12a2a;padding:18px;border-radius:10px;border:2px solid #c45a5a;margin-top:14px;">
            <div style="font-weight:700;font-size:1.05rem;margin-bottom:8px;">Not Found ❌</div>
            <div>The certificate number and candidate name did not match our records. Please check and try again.</div>
          </div>
        `;
      }
    }, delay);
  });
})();


// Expose a small utility to add real entries programmatically (optional)
// Usage example (run in console or include a server-side generated JS block):
// addCertificateEntry({ number: "GA-999999", recipient: "Full Name", qualification: "GA Level 3 ...", awardDate: "01/01/2025" });
window.addCertificateEntry = function (entry) {
  if (!entry || !entry.number || !entry.recipient) {
    console.error('Invalid entry. Required fields: number, recipient.');
    return false;
  }
  // push and dedupe
  certificates.push({
    number: String(entry.number).trim(),
    recipient: String(entry.recipient).trim(),
    qualification: entry.qualification || '',
    awardDate: entry.awardDate || ''
  });
  // recompute dedupe
  const seen = new Set();
  const deduped = [];
  for (const c of certificates) {
    const key = ((c.number || '') + '|' + (c.recipient || '')).toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(c);
    }
  }
  certificates.splice(0, certificates.length, ...deduped);
  return true;
};
