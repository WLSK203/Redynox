document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Menu
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", !isExpanded);
      navLinks.classList.toggle("open");

      // Optional: You could add CSS for .hamburger.active to animate the icon
      hamburger.classList.toggle("active");
    });
  }

  // 2. Skill Bars Animation (about.html)
  const barFills = document.querySelectorAll(".bar-fill");
  if (barFills.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("anim");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    barFills.forEach((bar) => {
      observer.observe(bar);
    });
  }

  // 3. Contact Form Validation & Interaction (contact.html)
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const charCurrent = document.getElementById("char-current");
    const messageInput = document.getElementById("message");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    // Character count update
    if (messageInput && charCurrent) {
      messageInput.addEventListener("input", () => {
        charCurrent.textContent = messageInput.value.length;
      });
    }

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isValid = true;

      // Reset all error messages and states
      document.querySelectorAll(".err-msg").forEach((msg) => {
        msg.textContent = "";
      });
      document.querySelectorAll(".f-input, .f-textarea").forEach((input) => {
        input.classList.remove("err", "ok");
      });

      // Name Validation
      if (nameInput) {
        if (!nameInput.value.trim()) {
          document.getElementById("name-error").textContent =
            "Full Name is required.";
          nameInput.classList.add("err");
          isValid = false;
        } else {
          nameInput.classList.add("ok");
        }
      }

      // Email Validation
      if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
          document.getElementById("email-error").textContent =
            "Email Address is required.";
          emailInput.classList.add("err");
          isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
          document.getElementById("email-error").textContent =
            "Please enter a valid email address.";
          emailInput.classList.add("err");
          isValid = false;
        } else {
          emailInput.classList.add("ok");
        }
      }

      // Message Validation
      if (messageInput) {
        if (!messageInput.value.trim()) {
          document.getElementById("message-error").textContent =
            "Message is required.";
          messageInput.classList.add("err");
          isValid = false;
        } else if (messageInput.value.length > 500) {
          document.getElementById("message-error").textContent =
            "Message exceeds 500 characters.";
          messageInput.classList.add("err");
          isValid = false;
        } else {
          messageInput.classList.add("ok");
        }
      }

      // If the form is valid, show a success UI
      if (isValid) {
        // In a real application, you'd send data to the server via fetch() here

        const formCard = document.querySelector(".form-card");
        if (formCard) {
          formCard.innerHTML = `
                        <div class="form-success">
                            <div class="s-icon">🎉</div>
                            <h4>Message Sent!</h4>
                            <p>Thanks for reaching out, ${nameInput.value.split(" ")[0]}. We'll get back to you within 24 hours.</p>
                            <div class="preview-block">
                                status: "success"<br>
                                id: "msg_${Math.floor(Math.random() * 10000)}"<br>
                                check: "valid"
                            </div>
                        </div>
                    `;
        }
      }
    });
  }
});
