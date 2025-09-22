// Certificate database (in-memory for demo)
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

// Verification logic
document.getElementById('verifyForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const certNumber = document.getElementById('certNumber').value.trim();
  const resultDiv = document.getElementById('result');
  const cert = certificateDB[certNumber];

  if(cert) {
    resultDiv.innerHTML = `
      <div class="success">
        <h3>Certificate Verified ✅</h3>
        <p><strong>Certificate Number:</strong> ${cert.number}</p>
        <p><strong>Name:</strong> ${cert.name}</p>
        <p><strong>Award:</strong> ${cert.award}</p>
        <p><strong>Date:</strong> ${cert.date}</p>
        <p><strong>Status:</strong> <span class="badge success-badge">${cert.status}</span></p>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `
      <div class="error">
        <h3>Certificate Not Found ❌</h3>
        <p>Please check the certificate number and try again. If you believe this is an error, contact <a href="mailto:support@gatehouserewards.com">support@gatehouserewards.com</a>.</p>
      </div>
    `;
  }
});

// Add certificate logic
document.getElementById('addForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const addResultDiv = document.getElementById('addResult');
  const number = document.getElementById('addCertNumber').value.trim();
  const name = document.getElementById('addCertName').value.trim();
  const award = document.getElementById('addCertAward').value.trim();
  const date = document.getElementById('addCertDate').value.trim();

  if (!number || !name || !award || !date) {
    addResultDiv.innerHTML = `<div class="error"><h3>All fields are required.</h3></div>`;
    return;
  }

  if (certificateDB[number]) {
    addResultDiv.innerHTML = `<div class="error"><h3>This certificate number already exists!</h3></div>`;
    return;
  }

  certificateDB[number] = {
    number,
    name,
    award,
    date,
    status: "Authentic & Valid"
  };

  addResultDiv.innerHTML = `<div class="success"><h3>Certificate for ${name} added successfully!</h3></div>`;

  // Optionally reset form
  document.getElementById('addForm').reset();
});
