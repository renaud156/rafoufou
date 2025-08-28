
const stripe = Stripe("pk_test_51JrQavHZNKOUyQCogcOziulfVpCfngtqbWLKqEgRA90fQUw4JJZRXT8SkQcYcKs4kfa45TDCvKWUkdDHeVbiQLVB00FiNV1lky");

const payBtn = document.getElementById("pay-btn");
const form = document.getElementById("payment-form");
let modal;
let card;
let clientSecret = null;

// Fonction pour ouvrir le modal
function showModal() {
  modal = document.createElement("div");
  modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;";
  modal.innerHTML = `
    <div style="background:white;padding:40px;border-radius:10px;max-width:400px;width:100%;">
      <h3>Paiement sécurisé</h3>
      <form id="payment-form">
        <div id="card-element" style="margin-bottom:20px;"></div>
        <button type="submit" style="background:#ffc107;border:none;padding:10px 20px;">Payer</button>
      </form>
      <p id="payment-result" style="margin-top:10px;"></p>
    </div>
  `;
  document.body.appendChild(modal);

  const cardElement = document.getElementById("card-element");
  const elements = stripe.elements();
  card = elements.create("card");
  card.mount(cardElement);

  form = document.getElementById("payment-form");
  form.addEventListener("submit", handlePayment);
}

async function handlePayment(e) {
  e.preventDefault();
  const resultElement = document.getElementById("payment-result");

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: card
    }
  });

  if (error) {
    resultElement.textContent = error.message;
  } else if (paymentIntent.status === "succeeded") {
    resultElement.textContent = "Paiement réussi !";
    setTimeout(() => {
      modal.remove();
      alert("Paiement réussi !");
    }, 1000);
  }
}

payBtn.addEventListener("click", async () => {
  // Lire la valeur du choix de formule
  const formule = document.querySelector('select[name="formule"]').value;
  let amount = 0;

  switch (formule) {
    case "1h":
      amount = 4500; // 45,00€
      break;
    case "5h":
      amount = 20000; // 200€
      break;
    case "10h":
      amount = 38000; // 380€
      break;
    default:
      alert("Veuillez sélectionner une formule.");
      return;
  }

  // Appeler le backend pour créer un PaymentIntent
  const response = await fetch("payment.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amount })
  });

  const data = await response.json();
  clientSecret = data.clientSecret;

  showModal();
});
