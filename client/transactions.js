const token = localStorage.getItem("token");

async function loadTransactions() {
    const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const transactions = await response.json();

    console.log("Transactions loaded:", transactions);
    const transactionList =
    document.getElementById("transactionList");

transactions.forEach(function (transaction) {
    const item = document.createElement("div");

    item.innerHTML = `
        <h3>${transaction.title}</h3>
        <p>${transaction.category}</p>
        <p>₹${transaction.amount}</p>
    `;

    transactionList.appendChild(item);
});
}

loadTransactions();