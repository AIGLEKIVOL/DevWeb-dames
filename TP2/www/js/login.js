document.addEventListener("DOMContentLoaded", () => {
    const loginPopup = document.getElementById("login-popup");
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
  
    // Afficher le popup au chargement de la page
    loginPopup.style.display = "block";
  
    // Gestion de la soumission du formulaire
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      try {
        const response = await fetch("http://your-server-endpoint/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
  
        if (response.ok) {
          const data = await response.json();
          alert(`Bienvenue, ${data.username}!`);
          loginPopup.style.display = "none"; // Fermer le popup
        } else {
          errorMessage.style.display = "block";
          errorMessage.textContent = "Identifiants incorrects";
        }
      } catch (err) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Erreur de connexion au serveur";
      }
    });
  });