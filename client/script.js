const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionCountElement = document.getElementById("transactionCount");
let transactions = [];

transactionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const transaction = {
        title,
        amount,
        type,
        category,
        date
    };

    try {
        const response = await fetch("http://localhost:5000/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        const savedTransaction = await response.json();

        transactions.push(savedTransaction);

        displayTransactions();
        updateSummary();

        transactionForm.reset();

    } catch (error) {
        console.error("Error adding transaction:", error);
    }
});


function displayTransactions() {
    
    transactionList.innerHTML = "";

    transactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.classList.add("transaction-item");

       transactionItem.innerHTML = `
    <div>
        <strong>${transaction.title}</strong>
        <p>${transaction.category} • ${transaction.date}</p>
    </div>

    <div>
        <strong>
            ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount}
        </strong>

        <button class="edit-btn" onclick="editTransaction(${transactions.indexOf(transaction)})">
            Edit
        </button>

        <button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(transaction)})">
            Delete
        </button>
    </div>
`;

        transactionList.prepend(transactionItem);
    });
}

async function deleteTransaction(index) {

    const transaction = transactions[index];

    try {
        const response = await fetch(
            `http://localhost:5000/api/transactions/${transaction._id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete transaction");
        }

        transactions.splice(index, 1);

        displayTransactions();
        updateSummary();

    } catch (error) {
        console.error("Delete error:", error);
    }
}

async function editTransaction(index) {

    const transaction = transactions[index];

    const newTitle = prompt("Enter new title:", transaction.title);
    const newAmount = prompt("Enter new amount:", transaction.amount);

    if (newTitle === null || newAmount === null) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/transactions/${transaction._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newTitle,
                    amount: Number(newAmount),
                    type: transaction.type,
                    category: transaction.category,
                    date: transaction.date
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update transaction");
        }

        const updatedTransaction = await response.json();

        transactions[index] = updatedTransaction;

        displayTransactions();
        updateSummary();

    } catch (error) {
        console.error("Edit error:", error);
    }
}

function updateSummary() {

    let income = 0;
    let expenses = 0;

    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }

    });

    const balance = income - expenses;

    incomeElement.textContent = `₹${income}`;
    expensesElement.textContent = `₹${expenses}`;
    balanceElement.textContent = `₹${balance}`;
    transactionCountElement.textContent = transactions.length;
    const now = new Date();

const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

let monthlyExpenses = 0;

transactions.forEach(function (transaction) {

    const transactionDate = new Date(transaction.date);

    if (
        transaction.type === "expense" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
    ) {
        monthlyExpenses += transaction.amount;
    }

});

document.getElementById("monthlyExpenses").textContent = `₹${monthlyExpenses}`;

}

async function loadTransactions() {

    try {
        const response = await fetch("http://localhost:5000/api/transactions");

        const data = await response.json();

        transactions = data;

        displayTransactions();
        updateSummary();

    } catch (error) {
        console.error("Failed to load transactions:", error);
    }
}

loadTransactions();