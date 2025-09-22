// Demo certificate DB
const certificateDB = {
  "146882": {
    number: "146882",
    name: "Mary Kevin",
    award: "Level 3 TESOL",
    date: "23/08/2022",
    status: "Authentic & Valid"
  },
  "123456": {
    number: "123456",
    name: "Jane Doe",
    award: "Level 2 TEFL",
    date: "05/09/2025",
    status: "Authentic & Valid"
  }
};

const verifyForm = document.getElementById('verifyForm');
const certInput = document.getElementById('certNumber');
const resultDiv = document.getElementById('result');
const searchBtn = document.getElementById('searchBtn');

verifyForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Show loading
  searchBtn.disabled = true;
  resultDiv.innerHTML = `<span style="color:#777;">Checking certificate...</span>`;

  // Simulate loading
  setTimeout(() => {
    const certNumber = certInput.value.trim();
    const cert = certificateDB[certNumber];

    if(cert) {
      resultDiv.innerHTML = `
        <div class="success">
          <b>Certificate Verified ✅</b><br>
          <strong>Number:</strong> ${cert.number}<br>
          <strong>Name:</strong> ${cert.name}<br>
          <strong>Award:</strong> ${cert.award}<br>
          <strong>Date:</strong> ${cert.date}<br>
          <strong>Status:</strong> ${cert.status}
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="error">
          Certificate not found.<br>
          Please check the number and try again.
        </div>
      `;
    }
    searchBtn.disabled = false;
  }, 1100); // Match the original's slight delay
});
