const API_URL = "http://127.0.0.1:8000/api/networks";

async function loadNetworks() {
    const tableBody = document.getElementById("network-table-body");
    const message = document.getElementById("message");

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Nije moguće dohvatiti mreže.");
        }

        const networks = await response.json();

        tableBody.innerHTML = "";

        if (networks.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        Trenutno nema spremljenih mreža.
                    </td>
                </tr>
            `;
            return;
        }

        networks.forEach((network) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${network.id}</td>
                <td>${network.name}</td>
                <td>${network.cidr}</td>
                <td>${network.description || "-"}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Greška pri učitavanju mreža.
                </td>
            </tr>
        `;

        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}

loadNetworks();