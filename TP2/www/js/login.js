document.addEventListener("DOMContentLoaded", () => {
    const loginPopup = document.getElementById("login-popup");
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
  
    // Afficher le popup au chargement de la page
    loginPopup.style.display = "block";
  
     // Initialiser la connexion WebSocket
  const socket = new WebSocket("ws://localhost:9898");

  socket.onopen = () => {
    console.log("WebSocket connection established.");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "login_success") {
      alert(`Bienvenue, ${data.username}! La partie va commencer.`);
      loginPopup.style.display = "none"; // Ferme le popup
      // Lancer la partie ici
    } else if (data.type === "login_error") {
      errorMessage.style.display = "block";
      errorMessage.textContent = data.message;
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorMessage.style.display = "block";
      errorMessage.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    // Envoyer les données via WebSocket
    socket.send(
      JSON.stringify({
        type: "login",
        username,
        password,
      })
    );
  });
});