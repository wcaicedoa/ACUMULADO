document.addEventListener("DOMContentLoaded", () => {
  let totalCredits = 0;
  let isSystemBlocked = false; // Nueva variable para bloquear el sistema durante el mensaje de ganador
  const totalCreditsDisplay = document.getElementById("total-credits");
  const winnerMessage = document.getElementById("winner-message");
  const winnerText = document.getElementById("winner-text");
  const prizeText = document.getElementById("prize-text");
  const winSound = document.getElementById("win-sound");

  // Definir valor de premio aleatorio entre 1000 y 4000
  let prizeValue = Math.floor(Math.random() * (4000 - 1000 + 1)) + 1000;

  const updateTotalCredits = () => {
    if (!isSystemBlocked) { // Solo actualiza si el sistema no está bloqueado
      totalCreditsDisplay.textContent = totalCredits;
      checkForWinner();
    }
  };

  const checkForWinner = () => {
    if (totalCredits >= prizeValue && !isSystemBlocked) {
      const winner = Math.random() < 0.5 ? "ESP32_1" : "ESP32_2";
      showWinner(winner, totalCredits);
    }
  };

  const showWinner = (winner, prize) => {
    isSystemBlocked = true; // Bloquea el sistema
    winnerText.textContent = `${winner} ERES EL FELIZ GANADOR DEL ACUMULADO`;
    prizeText.textContent = `Premio: ${prize} créditos`;
    winnerMessage.classList.remove("hidden");

    winSound.play();

    // Ocultar el mensaje después de 30 segundos y reiniciar el acumulado a 100
    setTimeout(() => {
      winnerMessage.classList.add("hidden");
      totalCredits = 100;
      prizeValue = Math.floor(Math.random() * (4000 - 1000 + 1)) + 1000; // Genera un nuevo premio aleatorio
      isSystemBlocked = false; // Desbloquea el sistema después de mostrar el premio
      updateTotalCredits(); // Actualiza el total en pantalla
    }, 30000); // Tiempo de 30 segundos
  };

  const createWebSocketConnection = (espID, ip, port, creditElementId, statusElementId, animationElementId) => {
    const creditsDisplay = document.getElementById(creditElementId);
    const connectionStatus = document.getElementById(statusElementId);
    const animation = document.getElementById(animationElementId);
    let credits = 0;

    function connectWebSocket() {
      let ws = new WebSocket(`ws://${ip}:${port}`);

      ws.onopen = () => {
        connectionStatus.classList.remove("disconnected");
        connectionStatus.classList.add("connected");
        connectionStatus.textContent = "Connected";
      };

      ws.onmessage = (event) => {
        if (!isSystemBlocked) { // Solo procesa el mensaje si el sistema no está bloqueado
          const previousCredits = credits;
          credits = parseInt(event.data.split(": ")[1], 10);
          creditsDisplay.textContent = credits;

          totalCredits += credits - previousCredits;
          updateTotalCredits();

          animation.classList.remove("hidden");
          animation.style.opacity = 1;
          animation.style.transform = "translate(-50%, -50%) scale(1)";
          setTimeout(() => {
            animation.style.opacity = 0;
            animation.style.transform = "translate(-50%, -50%) scale(1.5)";
          }, 500);
        }
      };

      ws.onclose = () => {
        connectionStatus.classList.remove("connected");
        connectionStatus.classList.add("disconnected");
        connectionStatus.textContent = "Disconnected";
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        ws.close();
      };
    }

    connectWebSocket();
  };

  createWebSocketConnection("ESP32_1", "192.168.252.254", 81, "credits-1", "connection-status-1", "animation-1");
  createWebSocketConnection("ESP32_2", "192.168.252.158", 82, "credits-2", "connection-status-2", "animation-2");
});
