document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (form) {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                alert("Please enter username and password.");
                return;
            }

            try {

                const res = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });

                const data = await res.json();

                if (data.success) {
                    window.location.href = "/dashboard";
                } else {
                    alert(data.message || "Login failed");
                }

            } catch (err) {

                alert("Server Error");

            }

        });

    }

});
