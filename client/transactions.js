const token = localStorage.getItem("token");

let allTransactions = [];
async function loadTransactions() {
    const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    allTransactions = await response.json();

    const transactions = allTransactions;
    
    console.log("Transactions loaded:", transactions);
    let totalIncome = 0;
let totalExpenses = 0;

transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
        totalIncome += Number(transaction.amount);
    } else if (transaction.type === "expense") {
        totalExpenses += Number(transaction.amount);
    }
});

const totalBalance = totalIncome - totalExpenses;

document.getElementById("totalIncome").textContent =
    `₹${totalIncome}`;

document.getElementById("totalExpenses").textContent =
    `₹${totalExpenses}`;

document.getElementById("totalBalance").textContent =
    `₹${totalBalance}`;

    const transactionList =
    document.getElementById("transactionList");

transactions.forEach(function (transaction) {

    const item = document.createElement("div");

    item.classList.add("transaction-row");

    const isIncome = transaction.type === "income";

    item.innerHTML = `
        <div class="transaction-icon ${isIncome ? "income-icon" : "expense-icon"}">
            ${isIncome ? "↗" : "↘"}
        </div>

        <div class="transaction-details">
            <h3>${transaction.title}</h3>
            <p>${transaction.category} • ${transaction.date}</p>
        </div>

        <div class="transaction-type">
            <span class="${isIncome ? "income-label" : "expense-label"}">
                ${isIncome ? "Income" : "Expense"}
            </span>
        </div>

        <div class="transaction-amount ${isIncome ? "income-amount" : "expense-amount"}">
            ${isIncome ? "+" : "-"}₹${transaction.amount}
        </div>
    `;

    transactionList.appendChild(item);
});
}

function displayTransactions(transactions) {

    const transactionList =
        document.getElementById("transactionList");

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <p class="empty-message">
                No transactions found.
            </p>
        `;
        return;
    }

    transactions.forEach(function (transaction) {

        const item = document.createElement("div");

        item.classList.add("transaction-row");

        const isIncome = transaction.type === "income";

        item.innerHTML = `
            <div class="transaction-icon ${isIncome ? "income-icon" : "expense-icon"}">
                ${isIncome ? "↗" : "↘"}
            </div>

            <div class="transaction-details">
                <h3>${transaction.title}</h3>
                <p>${transaction.category} • ${transaction.date}</p>
            </div>

            <div class="transaction-type">
                <span class="${isIncome ? "income-label" : "expense-label"}">
                    ${isIncome ? "Income" : "Expense"}
                </span>
            </div>

            <div class="transaction-amount ${isIncome ? "income-amount" : "expense-amount"}">
                ${isIncome ? "+" : "-"}₹${transaction.amount}
            </div>
        `;

        transactionList.appendChild(item);
    });
}

loadTransactions();

document.getElementById("searchInput").addEventListener("input", function () {

    const searchText = this.value.toLowerCase();

    const filteredTransactions = allTransactions.filter(function (transaction) {

        return (
            transaction.title.toLowerCase().includes(searchText) ||
            transaction.category.toLowerCase().includes(searchText)
        );

    });

    displayTransactions(filteredTransactions);
});