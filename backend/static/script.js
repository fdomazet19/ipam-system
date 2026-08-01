const API_URL = "/api/networks";


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
                    <td
                        colspan="4"
                        class="text-center text-muted"
                    >
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
    <td>
        <button
            class="btn btn-warning btn-sm me-2"
            onclick="editNetwork(
                ${network.id},
                '${network.name}',
                '${network.cidr}',
                '${network.description || ""}'
            )"
        >
            Uredi
        </button>

        <button
            class="btn btn-danger btn-sm"
            onclick="deleteNetwork(${network.id})"
        >
            Obriši
        </button>
    </td>
`;

            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="text-center text-danger"
                >
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

const networkForm = document.getElementById("network-form");

if (networkForm) {

    networkForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const cidr = document.getElementById("cidr").value;
        const description = document.getElementById("description").value;

        fetch("/api/networks", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({

        name: name,
        cidr: cidr,
        description: description

    })

})
.then(response => response.json())
.then(data => {

    alert(data.message);

    loadNetworks();

});

    });

}
async function deleteNetwork(networkId) {
    const confirmed = confirm(
        "Jeste li sigurni da želite obrisati ovu mrežu?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/networks/${networkId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert(data.message);
        loadNetworks();

    } catch (error) {
        alert("Dogodila se greška pri brisanju mreže.");
    }
}

async function editNetwork(networkId, currentName, currentCidr, currentDescription) {
    const name = prompt("Unesite naziv mreže:", currentName);

    if (name === null) {
        return;
    }

    const cidr = prompt("Unesite CIDR mreže:", currentCidr);

    if (cidr === null) {
        return;
    }

    const description = prompt(
        "Unesite opis mreže:",
        currentDescription
    );

    if (description === null) {
        return;
    }

    try {
        const response = await fetch(`/api/networks/${networkId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                cidr: cidr,
                description: description
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Uređivanje nije uspjelo.");
            return;
        }

        alert(data.message);
        loadNetworks();

    } catch (error) {
        alert("Dogodila se greška pri uređivanju mreže.");
    }
}