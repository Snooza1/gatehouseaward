// Example certificate data
const certificates = [
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
  }
];

const form = document.getElementById('verifyForm');
const certNumberInput = document.getElementById('certNumber');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  resultDiv.innerHTML = "";
  loader.style.display = 'flex';

  setTimeout(() => { // Simulate loading
    loader.style.display = 'none';
    const enteredNumber = certNumberInput.value.trim();

    const cert = certificates.find(c => c.number === enteredNumber);

    if (cert) {
      resultDiv.innerHTML = `
        <div class="cert-success">
          <h2>Certificate Found</h2>
          <div class="details">
            <b>Recipient:</b> ${cert.recipient}<br>
            <b>Qualification Achieved:</b><br>
            ${cert.qualification}<br>
            <b>Award Date:</b> ${cert.awardDate}
          </div>
          <div class="conf-note">
            If the details show here don't match with the certificate in front of you please contact us immediately on<br>
            <strong>+44 (0)1924 609250</strong> or <strong>info@gatehouseawards.org</strong>
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="cert-error">
          <h2>Certificate Not Found</h2>
          The certificate number you entered could not be found. Please check the number and try again.<br>
          If you believe this is an error, contact us at <strong>info@gatehouseawards.org</strong>
        </div>
      `;
    }
  }, 1200); // 1.2 second "loading"
});
