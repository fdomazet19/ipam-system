async function loadValidationNetworks() {
    const networkSelect = document.getElementById(
        "validation-network"
    );

    try {
        const response = await fetch("/api/networks");
        const networks = await response.json();

        networkSelect.innerHTML = `
            <option value="">Odaberite mrežu</option>
        `;

        networks.forEach((network) => {
            networkSelect.innerHTML += `
                <option value="${network.id}">
                    ${network.name} (${network.cidr})
                </option>
            `;
        });

    } catch (error) {
        showValidationResult(
            false,
            "Nije moguće učitati mreže."
        );
    }
}


function showValidationResult(valid, message) {
    const result = document.getElementById(
        "validation-result"
    );

    const alertClass = valid
        ? "alert-success"
        : "alert-danger";

    result.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
}


const validationForm = document.getElementById(
    "validation-form"
);

validationForm.addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

        const address = document.getElementById(
            "validation-address"
        ).value;

        const networkId = document.getElementById(
            "validation-network"
        ).value;

        try {
            const response = await fetch("/api/validate-ip", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    address: address,
                    network_id: networkId
                })
            });

            const data = await response.json();

            showValidationResult(
                data.valid,
                data.message
            );

        } catch (error) {
            showValidationResult(
                false,
                "Dogodila se greška tijekom validacije."
            );
        }
    }
);


loadValidationNetworks();