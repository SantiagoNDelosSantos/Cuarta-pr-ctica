const pagarBTN = document.getElementById("pagar")

pagarBTN.addEventListener("click", () => {
    pagar();
});

async function pagar() {

    const response = await fetch('/api/payments/paymentsIntents', {
        method: 'POST',
    })

    console.log(response)

    window.location.replace(response.url);


}