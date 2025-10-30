// Website 2 (Gatehouse Rewards) — Full client-side verification script
// - Single-file, self-contained script to include on your verification page.
// - Features:
//   * Certificates array (realistic non-sequential numbers for the three new entries)
//   * URL auto-fill (accepts many common param names) and auto-submit when both number/name present
//   * Deduplication of entries
//   * Search form handler with loader, simulated lookup delay, clear VERIFIED / NOT FOUND UI
//   * Admin helpers: addCertificateEntry, replaceCertificateEntries, generatePrefillUrl
//
// IMPORTANT:
// - If you already have a certificates array elsewhere, replace or merge this array instead of duplicating.
// - If you change the page path or parameter names, update the autoFillParams mapping below.
// - Update any placeholder values if you want different number patterns.

(function () {
  'use strict';

  // ----- Configuration -----
  // Set the base URL your site uses for verification (used by the helper generatePrefillUrl).
  const SITE_BASE = (function () {
    try {
      // derive from current location
      return window.location.origin + window.location.pathname.replace(/\/$/, '');
    } catch (e) {
      return 'https://gatehouserewards.com';
    }
  })();

  // Common param names your site might accept — we will attempt to fill any of these.
  const autoFillParams = {
    number: ['number', 'certNumber', 'qualificationNumber', 'qualification', 'id'],
    name: ['candidateName', 'name', 'recipient', 'candidate', 'fullName']
  };

  // ----- Certificate records (realistic, non-sequential) -----
  // Replace or extend these entries as required.
  const certificates = [
    // Existing sample entries (keep/remove as needed)
    { number: "123456", recipient: "Maria Stefanova Ilieva", qualification: "GA Level 3 Diploma in Business Management", awardDate: "19/09/2025" },

    // Realistic non-sequential entries for the three users (keeps "GA" prefix but non-consecutive)
    {
      number: "GA-24K7F195",
      recipient: "Tunka Botyova Popova",
      qualification: "GA Level 3 Diploma in Business Administration",
      awardDate: "01/06/2024"
    },
    {
      number: "GA-24M3B862",
      recipient: "Yashko Asparuhov Kolev",
      qualification: "GA Level 3 Diploma in Business Administration",
      awardDate: "15/06/2024"
    },
    {
      number: "GA-24R9D041",
      recipient: "Ivelina Angelova Yankova",
      qualification: "GA Level 3 Diploma in Business Administration",
      awardDate: "30/06/2024"
    },

    // NEW ENTRY ADDED (2023) — Mariana Sirenarska
    {
      number: "GA-23S5N278",
      recipient: "Mariana Sirenarska",
      qualification: "GA Level 3 Diploma in Business Administration",
      awardDate: "20/06/2023"
    }
  ];

  // ----- Utility helpers -----
  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Normalize a string for comparisons
  function norm(s) {
    return (s || '').toString().trim().toLowerCase();
  }

  // Deduplicate certificates in-place by number + recipient
  (function dedupeInPlace() {
    const seen = new Set();
    const out = [];
    for (const c of certificates) {
      const key = (norm(c.number) + '|' + norm(c.recipient));
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
    }
    certificates.splice(0, certificates.length, ...out);
  })();

  // ----- DOM helpers / element lookup -----
  function findElement(...ids) {
    for (const id of ids) {
      if (!id) continue;
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // ----- Auto-fill from URL params + optional auto-submit -----
  function getUrlParamsMap() {
    const params = new URLSearchParams(window.location.search);
    const map = {};
    for (const [k, v] of params.entries()) {
      map[k] = v;
    }
    return map;
  }

  function autoFillFromUrl() {
    const params = getUrlParamsMap();

    // Find a candidate number value from any known param key
    let foundNumber = '';
    for (const key of autoFillParams.number) {
      if (params[key]) {
        foundNumber = params[key];
        break;
      }
    }

    // Find a candidate name value
    let foundName = '';
    for (const key of autoFillParams.name) {
      if (params[key]) {
        foundName = params[key];
        break;
      }
    }

    // Fill inputs if present
    const numberInput = findElement('certNumber', 'qualificationNumber', 'number', 'certInput');
    const nameInput = findElement('candidateName', 'recipientName', 'name', 'nameInput');

    if (foundNumber && numberInput) numberInput.value = decodeURIComponent(foundNumber);
    if (foundName && nameInput) nameInput.value = decodeURIComponent(foundName);

    // If we have at least a number, attempt to submit automatically to show result quickly.
    // Delay slightly to ensure form elements attached.
    if (foundNumber) {
      setTimeout(() => {
        const form = document.getElementById('verifyForm') || numberInput && numberInput.form;
        if (form && typeof form.requestSubmit === 'function') {
          try {
            form.requestSubmit();
          } catch (err) {
            // fallback to dispatching submit event
            const ev = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(ev);
          }
        }
      }, 200);
    }
  }

  // ----- Main verification logic (attach to form) -----
  function attachVerificationHandler() {
    const form = document.getElementById('verifyForm');
    if (!form) {
      // If there is no form, we still support manual API-like calls via the helper below.
      console.warn('verifyForm not found — verification handler not attached. Use addCertificateEntry or generatePrefillUrl helpers, or add a form with id="verifyForm".');
      return;
    }

    const numberInput = findElement('certNumber', 'qualificationNumber', 'number', 'certInput');
    const nameInput = findElement('candidateName', 'recipientName', 'name', 'nameInput');
    const resultDiv = document.getElementById('result') || document.createElement('div');

    // Create a loader element if one is not present
    let loader = document.getElementById('loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'loader';
      loader.style.display = 'none';
      loader.style.alignItems = 'center';
      loader.style.justifyContent = 'center';
      loader.style.marginTop = '10px';
      // simple loader styling
      loader.innerHTML = '<div style="width:28px;height:28px;border:4px solid #e6f3ed;border-top-color:#3aa76a;border-radius:50%;animation:spin 1s linear infinite;"></div>';
      const style = document.createElement('style');
      style.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
      form.appendChild(loader);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!resultDiv.parentNode) {
        // attempt to append after form
        form.parentNode && form.parentNode.appendChild(resultDiv);
      }
      resultDiv.innerHTML = '';
      const queryNumber = norm(numberInput && numberInput.value);
      const queryName = (nameInput && nameInput.value || '').trim();

      if (!queryNumber && !queryName) {
        resultDiv.innerHTML = `
          <div style="background:#fff4e6;color:#b45a00;padding:12px;border-radius:8px;border:1px solid #e0b77a;margin-top:12px;">
            Enter a certificate number or candidate name to search.
          </div>`;
        return;
      }

      loader.style.display = 'flex';

      const delay = Math.floor(Math.random() * 800) + 500; // 500-1300ms
      setTimeout(() => {
        loader.style.display = 'none';

        // Try exact number match first
        let found = null;
        if (queryNumber) {
          found = certificates.find(c => norm(c.number) === queryNumber);
        }

        // If not found by number, try name matching (full or partial)
        if (!found && queryName) {
          const q = queryName.toLowerCase();
          found = certificates.find(c => {
            const recip = (c.recipient || '').toLowerCase();
            if (recip === q) return true;
            if (recip.includes(q)) return true;
            // also allow "LastName FirstName" mismatches by token intersection
            const qTokens = q.split(/\s+/).filter(Boolean);
            return qTokens.every(t => recip.includes(t));
          });
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
  }

  // ----- Admin / developer helper functions (exposed globally) -----
  // Add a single certificate entry programmatically (validates minimal fields)
  window.addCertificateEntry = function (entry) {
    if (!entry || !entry.number || !entry.recipient) {
      console.error('addCertificateEntry: entry must include number and recipient.');
      return false;
    }
    certificates.push({
      number: String(entry.number).trim(),
      recipient: String(entry.recipient).trim(),
      qualification: entry.qualification || '',
      awardDate: entry.awardDate || ''
    });
    // dedupe after push
    const seen = new Set();
    const out = [];
    for (const c of certificates) {
      const key = (norm(c.number) + '|' + norm(c.recipient));
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
    }
    certificates.splice(0, certificates.length, ...out);
    return true;
  };

  // Replace whole certificates array (useful for deploy scripts)
  window.replaceCertificateEntries = function (newList) {
    if (!Array.isArray(newList)) {
      console.error('replaceCertificateEntries: expected an array');
      return false;
    }
    certificates.splice(0, certificates.length, ...newList.map(c => ({
      number: String(c.number || '').trim(),
      recipient: String(c.recipient || '').trim(),
      qualification: c.qualification || '',
      awardDate: c.awardDate || ''
    })));
    // dedupe
    const seen = new Set();
    const out = [];
    for (const c of certificates) {
      const key = (norm(c.number) + '|' + norm(c.recipient));
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
    }
    certificates.splice(0, certificates.length, ...out);
    return true;
  };

  // Generate a prefill URL for a certificate number (and optional candidateName)
  // This is handy to pass into your QR generator. It tries to prefer the same page path
  // and will return a URL that uses "?number=...&candidateName=..." format.
  window.generatePrefillUrl = function (args) {
    if (!args || !args.number) {
      console.error('generatePrefillUrl: require { number: "...", candidateName?: "..." }');
      return '';
    }
    const base = SITE_BASE || '';
    const u = new URL(base, window.location.origin);
    u.searchParams.set('number', args.number);
    if (args.candidateName) u.searchParams.set('candidateName', args.candidateName);
    return u.toString();
  };

  // ----- Initialize on DOM ready -----
  document.addEventListener('DOMContentLoaded', function () {
    try {
      attachVerificationHandler();
      autoFillFromUrl();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  });

  // Expose certificates array for debugging in console (read-only caution)
  Object.defineProperty(window, 'gatehouseCertificates', {
    get() { return certificates.slice(); },
    configurable: true
  });

})();
