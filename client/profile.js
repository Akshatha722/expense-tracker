const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
    window.location.href = "login.html";
}


// Show user information

document.getElementById("profileName").textContent =
    user.name;

document.getElementById("profileEmail").textContent =
    user.email;


// Create avatar from first letter

document.getElementById("profileAvatar").textContent =
    user.name.charAt(0).toUpperCase();


// Load user's transactions

async function loadProfileData() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/transactions",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const transactions = await response.json();


        let income = 0;
        let expenses = 0;


        transactions.forEach(function (transaction) {

            if (transaction.type === "income") {
                income += Number(transaction.amount);
            }

            if (transaction.type === "expense") {
                expenses += Number(transaction.amount);
            }

        });


        const balance = income - expenses;


        document.getElementById("profileIncome").textContent =
            `₹${income}`;

        document.getElementById("profileExpenses").textContent =
            `₹${expenses}`;

        document.getElementById("profileBalance").textContent =
            `₹${balance}`;

        document.getElementById("profileTransactionCount").textContent =
            transactions.length;


    } catch (error) {

        console.error(
            "Failed to load profile data:",
            error
        );

    }
}


loadProfileData();


// Logout

document.getElementById("logoutBtn").addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "home.html";

    }
);

document.getElementById("editProfileBtn").addEventListener(
    "click",
    async function () {

        const newName = prompt(
            "Enter your new name:",
            user.name
        );

        if (!newName || newName.trim() === "") {
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/profile",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: newName.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update profile");
                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            document.getElementById("profileName").textContent =
                data.user.name;

            document.getElementById("profileAvatar").textContent =
                data.user.name.charAt(0).toUpperCase();

            alert("Profile updated successfully! 🎉");

        } catch (error) {

            console.error("Profile update failed:", error);

            alert("Unable to update profile.");

        }

    }
);