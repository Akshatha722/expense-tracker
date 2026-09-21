const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionCountElement = document.getElementById("transactionCount");

const darkModeBtn = document.getElementById("darkModeBtn");
const viewAllBtn = document.getElementById("viewAllBtn");

darkModeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
}

let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetStatus = document.getElementById("budgetStatus");

let transactions = [];

let incomeExpenseChart;
let monthlyExpenseChart;

saveBudgetBtn.addEventListener("click", function () {

    const budget = Number(budgetInput.value);

    if (budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    monthlyBudget = budget;
    localStorage.setItem("monthlyBudget", monthlyBudget);
    updateBudgetStatus();

    budgetInput.value = "";
});

function updateBudgetStatus() {

    const budgetStatus = document.getElementById("budgetStatus");

    if (monthlyBudget === 0) {
        budgetStatus.innerHTML = "<p>No budget set yet.</p>";
        return;
    }

    const currentMonthExpenses = transactions.reduce(function (total, transaction) {

        const transactionDate = new Date(transaction.date);
        const now = new Date();

        if (
            transaction.type === "expense" &&
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
        ) {
            return total + transaction.amount;
        }

        return total;

    }, 0);

    const remaining = monthlyBudget - currentMonthExpenses;

    budgetStatus.innerHTML = `
        <p>Budget: ₹${monthlyBudget}</p>
        <p>Spent: ₹${currentMonthExpenses}</p>
        <p>Remaining: ₹${remaining}</p>
    `;
}
if (monthlyBudget > 0) {
    updateBudgetStatus();
}

const searchInput = document.getElementById("searchInput");



transactionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (title.trim() === "" || amount <= 0 || !date) {
    alert("Please enter valid transaction details.");
    return;
    }

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

alert("Transaction added successfully! 🎉");

    } catch (error) {
        console.error("Error adding transaction:", error);
    }
});

const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");

function applyFilters() {

    const selectedCategory = categoryFilter.value;
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase();
    const sortOption = document.getElementById("sortFilter").value;
    const filteredTransactions = transactions.filter(function (transaction) {

        const matchesSearch =
            transaction.title.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
    });

  if (sortOption === "newest") {
    filteredTransactions.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });
}

if (sortOption === "oldest") {
    filteredTransactions.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });
}

if (sortOption === "highest") {
    filteredTransactions.sort(function (a, b) {
        return Number(b.amount) - Number(a.amount);
    });
}

if (sortOption === "lowest") {
    filteredTransactions.sort(function (a, b) {
        return Number(a.amount) - Number(b.amount);
    });
}

    displayTransactions(filteredTransactions);
}

viewAllBtn.addEventListener("click", function () {
    searchInput.value = "";
    categoryFilter.value = "all";
    typeFilter.value = "all";
    document.getElementById("sortFilter").value = "newest";

    displayTransactions(transactions);
});

categoryFilter.addEventListener("change", applyFilters);
document.getElementById("sortFilter").addEventListener("change", applyFilters);

typeFilter.addEventListener("change", applyFilters);

searchInput.addEventListener("input", applyFilters);

function displayTransactions(filteredTransactions = transactions) {
    
    transactionList.innerHTML = "";

    filteredTransactions.forEach(function (transaction) {

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

     transactionList.appendChild(transactionItem);  
    });
}

async function deleteTransaction(index) {

    const confirmDelete = confirm("Are you sure you want to delete this transaction?");

if (!confirmDelete) {
    return;
}

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

if (newTitle.trim() === "" || Number(newAmount) <= 0) {
    alert("Please enter a valid title and amount.");
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
const categorySpending = {};

transactions.forEach(function (transaction) {
    if (transaction.type === "expense") {
        if (!categorySpending[transaction.category]) {
            categorySpending[transaction.category] = 0;
        }

        categorySpending[transaction.category] += transaction.amount;
    }
});

const categorySpendingElement = document.getElementById("categorySpending");

const totalCategorySpending = Object.values(categorySpending).reduce(
    (total, amount) => total + amount,
    0
);

categorySpendingElement.innerHTML = "";

for (const category in categorySpending) {

    const amount = categorySpending[category];

    const percentage = (amount / totalCategorySpending) * 100;

    categorySpendingElement.innerHTML += `
        <div class="category-item">

            <div>
                <span class="category-name">${category}</span>

                <div class="category-bar">
                    <div
                        class="category-progress"
                        style="width: ${percentage}%"
                    ></div>
                </div>
            </div>

            <span class="category-amount">
                ₹${amount}
            </span>

        </div>
    `;
}
const chartCanvas = document.getElementById("incomeExpenseCanvas");

if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
}

incomeExpenseChart = new Chart(chartCanvas, {
    type: "bar",

    data: {
        labels: ["Income", "Expenses"],

        datasets: [
            {
                label: "Amount",
                data: [income, expenses]
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});


}
const monthlyExpensesData = {};

transactions.forEach(function (transaction) {

    if (transaction.type === "expense") {

        const transactionDate = new Date(transaction.date);

        const month = transactionDate.toLocaleString("default", {
            month: "short",
            year: "numeric"
        });

        if (!monthlyExpensesData[month]) {
            monthlyExpensesData[month] = 0;
        }

        monthlyExpensesData[month] += transaction.amount;
    }
});
const monthlyExpenseCanvas = document.getElementById("monthlyExpenseCanvas");
 
if (monthlyExpenseChart) {
    monthlyExpenseChart.destroy();
}

monthlyExpenseChart = new Chart(monthlyExpenseCanvas, {
   
    type: "line",

    data: {
        labels: Object.keys(monthlyExpensesData),

        datasets: [
            {
                label: "Monthly Expenses",
                data: Object.values(monthlyExpensesData),
                tension: 0.3
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

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