const WEBHOOK_URL = "https://hook.eu1.make.com/qqu1s3exnhnfe8ntxsk8dg67j41tljiv";

document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".star");
  const dynamicArea = document.getElementById("dynamicArea");
  const submitBtn = document.getElementById("submitBtn");
  let selectedRating = null;

  // ------------------------------------------------------------
  // 1. Extract client_id from canonical URL: /r/[client-id]
  // ------------------------------------------------------------
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const clientId = pathParts.length >= 2 && pathParts[0] === "r"
    ? pathParts[1]
    : null;

  // Guard: missing client_id → disable submit
  if (!clientId) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Errore: link non valido";
  }

  // ------------------------------------------------------------
  // 2. Hover effect for stars (pure UI)
  // ------------------------------------------------------------
  stars.forEach(star => {
    star.addEventListener("mouseover", () => {
      const rating = parseInt(star.dataset.value, 10);
      stars.forEach(s => {
        s.classList.toggle("active", parseInt(s.dataset.value, 10) <= rating);
      });
    });
  });

  // Reset hover when leaving star area
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

  // ------------------------------------------------------------
  // 3. Click star → store rating + show feedback box if needed
  // ------------------------------------------------------------
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value, 10);

      // Update star visuals
      stars.forEach(s => {
        s.classList.toggle(
          "active",
          parseInt(s.dataset.value, 10) <= selectedRating
        );
      });

      dynamicArea.classList.remove("visible");

      // Negative path (1–3 stars) → show feedback box
      if (selectedRating <= 3) {
        dynamicArea.innerHTML = `
          <textarea id="feedback" placeholder="Scrivi il tuo feedback..."></textarea>
        `;
        requestAnimationFrame(() => dynamicArea.classList.add("visible"));
      } else {
        // Positive path → no feedback box
        dynamicArea.innerHTML = "";
      }
    });
  });

  // ------------------------------------------------------------
  // 4. Submit → POST to Make webhook (Rating Page Data Contract)
  // ------------------------------------------------------------
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

    // POST only — no routing logic here.
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

    // UI confirmation
    submitBtn.disabled = true;
    submitBtn.textContent = "Grazie! Puoi chiudere la pagina.";
  });
});
