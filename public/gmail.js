function compose(type) {
    // code to open modal
  
    if (type === 'inbox') {
      // code to display inbox form
      document.getElementById("email-form").innerHTML = `
      <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Subject of the email</h5>
        <p class="card-text">Preview of the email contents goes here.</p>
        <p class="card-text"><small class="text-muted">From: sender@example.com</small></p>
      </div>
    </div>
      `;
    } else {
      // code to display to form
      document.getElementById("email-form").innerHTML = `
      <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Subject of the email</h5>
        <p class="card-text">Preview of the email contents goes here.</p>
        <p class="card-text"><small class="text-muted">From: sender@example.com</small></p>
      </div>
    </div>
    <div class="card mb-3">
                  <div class="card-body">
                    <h5 class="card-title">Subject of the email</h5>
                    <p class="card-text">Preview of the email contents goes here.</p>
                    <p class="card-text"><small class="text-muted">From: sender@example.com</small></p>
                  </div>
                </div>
      `;
    }
  }
  