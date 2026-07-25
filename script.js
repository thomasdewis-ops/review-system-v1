const WEBHOOK_URL = "https://hook.eu1.make.com/qqu1s3exnhnfe8ntxsk8dg67j41tljiv";

document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".star");
  const dynamicArea = document.getElementById("dynamicArea");
  const submitBtn = document.getElementById("submitBtn");
  let selectedRating = null;

  // Extract client_id from path: /r/[client-id]
  // Example: /r/jeremy → "jeremy"
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const clientId = pathParts.length >= 2 && pathParts[0] === "r"
    ? pathParts[1]
    : null;

  // Guard: missing client_id → disable submit
  if (!clientId) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Errore: link non valido";
  }

  // Hover effect
  stars.forEach(star => {
    star.addEventListener("mouseover", () => {
      const rating = parseInt(star.dataset.value, 10);
      stars.forEach(s => {
        s.classList.toggle("active", parseInt(s.dataset.value, 10) <= rating);
      });
    });
  });

  // Reset hover
  document.querySelector(".stars").addEventListener("mouseleave", () => {
    stars.forEach(s => s.classList.remove("active"));
    if (selectedRating) {
      stars.forEach(s => {
        s.classList.toggle(
          "active",
          parseInt(s.dataset.value, 10) <= selectedRating
        );
      });
    }
  });

  // Click star
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value, 10);

      stars.forEach(s => {
        s.classList.toggle(
          "active",
          parseInt(s.dataset.value, 10) <= selectedRating
        );
      });

      dynamicArea.classList.remove("visible");

      if (selectedRating <= 3) {
        dynamicArea.innerHTML = `
          <textarea id="feedback" placeholder="Scrivi il tuo feedback..."></textarea>
        `;
        requestAnimationFrame(() => dynamicArea.classList.add("visible"));
      } else {
        dynamicArea.innerHTML = "";
      }
    });
  });

  // Submit
  submitBtn.addEventListener("click", () => {
    if (!selectedRating) {
      alert("Seleziona una valutazione.");
      return;
    }
    if (!clientId) {
      alert("Link non valido. Contatta il negozio.");
      return;
    }

    const feedbackBox = document.getElementById("feedback");
    const feedback = feedbackBox ? feedbackBox.value : "";

    // Rating Page Data Contract: POST only, no routing
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        rating: selectedRating,
        timestamp: new Date().toISOString(),
        feedback_text: feedback
      })
    }).catch(() => {});

    // No redirect logic here.
    // RS_MainRouter_v1 handles:
    // - Positive: redirect to google_review_url
    // - Negative: internal feedback + optional WhatsApp
    // - Logging to RS_Events

    submitBtn.disabled = true;
    submitBtn.textContent = "Grazie! Puoi chiudere la pagina.";
  });
});
