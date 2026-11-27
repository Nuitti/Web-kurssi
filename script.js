
// CONTACT FORM + LOCALSTORAGE

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const nameField = document.getElementById("nimi");
    const emailField = document.getElementById("sahkoposti");
    const phoneField = document.getElementById("puhelin");
    const subjectField = document.getElementById("aihe");
    const messageField = document.getElementById("viesti");
    const emailError = document.getElementById("emailError");

    if (nameField) {
        nameField.value = localStorage.getItem("nimi") || "";
        nameField.addEventListener("input", () => {
            localStorage.setItem("nimi", nameField.value);
        });
    }

    if (emailField) {
        emailField.value = localStorage.getItem("sahkoposti") || "";
        emailField.addEventListener("input", () => {
            localStorage.setItem("sahkoposti", emailField.value);
        });
    }

    if (phoneField) {
        phoneField.value = localStorage.getItem("puhelin") || "";
        phoneField.addEventListener("input", () => {
            localStorage.setItem("puhelin", phoneField.value);
        });
    }

    if (subjectField) {
        subjectField.value = localStorage.getItem("aihe") || "";
        subjectField.addEventListener("input", () => {
            localStorage.setItem("aihe", subjectField.value);
        });
    }

    if (messageField) {
        messageField.value = localStorage.getItem("viesti") || "";
        messageField.addEventListener("input", () => {
            localStorage.setItem("viesti", messageField.value);
        });
    }

    const formStatus = document.getElementById("formStatus");

    contactForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        let firstInvalid = null;

        if (!nameField.value.trim()) {

            document.getElementById("nimiError")
                .textContent =
                "Anna nimi.";

            firstInvalid ??= nameField;

        } else {
            document.getElementById("nimiError")
                .textContent = "";
        }

        if (
            !emailField.value ||
            !emailField.validity.valid
        ) {

            emailError.textContent =
                "Anna oikea sähköpostiosoite.";

            firstInvalid ??= emailField;

        } else {
            emailError.textContent = "";
        }

        if (!subjectField.value.trim()) {

            document.getElementById("aiheError")
                .textContent = "";
                "Anna aihe.";

            firstInvalid ??= subjectField;

        } else {
            document.getElementById("aiheError")
                .textContent = "";
        }

        if (!messageField.value.trim()) {

            document.getElementById("viestiError")
                .textContent = "";
                "Anna viesti.";

            firstInvalid ??= messageField;

        } else {
            document.getElementById("viestiError")
                .textContent = "";
        }

        if (firstInvalid) {

            firstInvalid.focus();
            return;
        }

        formStatus.textContent =
            "Pyyntö on valmis lähetettäväksi.";
    }
);

}

// API DATA

let saunaData = [];
let customerData = null;
let selectedEvenings = [];

const calendarBody = document.getElementById("calendarBody");

async function fetchWithRetry(url) {
    const response = await fetch(url);

    if (response.status === 429) {
        const errorData = await response.json();

        const waitSeconds =
            Number(errorData.retry_after) || 3;

        await new Promise(resolve =>
            setTimeout(resolve, waitSeconds * 1000)
        );

        return fetchWithRetry(url);
    }

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

async function loadApiData() {
    const status =
        document.getElementById("calendarStatus");

    try {

        if (status) {
            status.textContent = "Ladataan saunatietoja...";
        }

        customerData = await fetchWithRetry(
            "https://vectorsigma.org/briefer/api/v1/customer?customer=6&lang=fi"
        );

        const itemsResponse = await fetchWithRetry(
            "https://vectorsigma.org/briefer/api/v1/items?customer=6&lang=fi"
        );

        saunaData = itemsResponse.items || [];

        updateCompanyInfo();
        renderCalendar();

        if (status) {
            status.textContent = "Saunatiedot ladattu.";
        }

    } catch (error) {

        console.error(error);

        if (status) {
            status.textContent =
                "Tietojen lataaminen epäonnistui.";
        }
    }
}

function updateCompanyInfo() {

    if (!customerData) return;

    const companyInfo =
        document.getElementById("companyInfo");

    if (!companyInfo) return;

    companyInfo.innerHTML = `
        <h3>${customerData.company}</h3>
        <p>${customerData.type}</p>
        <p>${customerData.town}</p>
        <p>Aukiolo: ${customerData.evening}</p>
    `;
}

// CALENDAR

function renderCalendar() {

    if (!calendarBody) return;

    calendarBody.innerHTML = "";

    if (!saunaData.length) {

        calendarBody.innerHTML = `
            <tr>
                <td colspan="20">
                    Ei saunatietoja saatavilla.
                </td>
            </tr>
        `;

        return;
    }

    const firstSauna = saunaData[0];

    firstSauna.evenings.forEach((evening, index) => {

        const header =
            document.getElementById(`date${index}`);

        if (header) {

            header.textContent =
                new Date(evening.date)
                    .toLocaleDateString("fi-FI");
        }
    });

    saunaData.forEach(sauna => {

        const row =
            document.createElement("tr");

        const saunaCell =
            document.createElement("td");

        saunaCell.innerHTML = `
            <strong>${sauna.name}</strong><br>
            ${sauna.capacity} henkilöä
        `;

        row.appendChild(saunaCell);

       sauna.evenings.forEach(evening => {

            const cell = document.createElement("td");

            const button = document.createElement("button");
            button.type = "button";

            const statusText =
                evening.free
                    ? "Vapaa"
                    : "Varattu";

            button.innerHTML = `
                ${statusText}<br>
                ${evening.price} €
            `;

            if (evening.free) {

                button.classList.add("vapaa");

                button.addEventListener(
                    "click",
                    () => varaa(
                        sauna.name,
                        evening.date,
                        evening.price
                    )
                );

            } else {

                button.classList.add("varattu");
                button.disabled = true;
            }

            cell.appendChild(button);
            row.appendChild(cell);

        });

calendarBody.appendChild(row);


    });
}

// BOOKING

function varaa(sauna, paiva, hinta) {

    selectedEvenings.push({
        sauna,
        paiva,
        hinta
    });

    const yhteensa =
        selectedEvenings.reduce(
            (sum, item) => sum + item.hinta,
            0
        );

    const saunaField =
        document.getElementById("sauna");

    const paivamaaraField =
        document.getElementById("paivamaara");

    if (saunaField) {
        saunaField.value = sauna;
    }

    if (paivamaaraField) {
        paivamaaraField.value = paiva;
    }

    const kokonaishinta =
        document.getElementById("kokonaishinta");

    if (kokonaishinta) {

        kokonaishinta.textContent =
            `Kokonaishinta: ${yhteensa} €`;
    }

    const lomake =
        document.getElementById("varauslomake");

    if (lomake) {

        lomake.scrollIntoView({
            behavior: "smooth"
        });
    }
}

const varausForm =
    document.querySelector(
        "#varauslomake form"
    );

if (varausForm) {

    varausForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const asiakasnumero =
                Math.floor(
                    10000 +
                    Math.random() * 90000
                );

            localStorage.setItem(
                "asiakasnumero",
                asiakasnumero
            );

            const status =
                document.getElementById(
                    "varausStatus"
                );

            if (status) {

                status.textContent =
                    `Varaus onnistui. Asiakasnumerosi on ${asiakasnumero}.`;
            }
        }
    );
}

// BOOKING SEARCH

const haeVarausBtn =
    document.getElementById(
        "haeVaraus"
    );

if (haeVarausBtn) {

    haeVarausBtn.addEventListener(
        "click",
        async () => {

            const tulos =
                document.getElementById(
                    "haeTulos"
                );

            const annettuNumero =
                document
                    .getElementById(
                        "asiakasnumero"
                    )
                    .value;

            const tallennettuNumero =
                localStorage.getItem(
                    "asiakasnumero"
                );

            if (!annettuNumero) {

                tulos.textContent =
                    "Anna asiakasnumero.";

                return;
            }

            if (
                annettuNumero ===
                tallennettuNumero
            ) {

                tulos.textContent =
                    "✅ Varaus löytyi.";

            } else {

                tulos.textContent =
                    "❌ Asiakasnumeroa ei löytynyt.";
            }
        }
    );
}

// START

const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {
    searchBtn.addEventListener("click", () => {

        const searchDate =
            document.getElementById("dateSearch").value;

        const results =
            document.getElementById("searchResults");

        if (!searchDate) {
            results.style.display = "block";
            results.textContent =
                "Valitse päivämäärä.";
            return;
        }

        const vapaat = [];

        saunaData.forEach(sauna => {

            const ilta = sauna.evenings.find(
                evening =>
                    evening.date === searchDate &&
                    evening.free
            );

            if (ilta) {

                vapaat.push(
                    `${sauna.name} (${sauna.capacity} hlö) - ${ilta.price} €`
                );
            }
        });

        results.style.display = "block";

        if (vapaat.length === 0) {

            results.textContent =
                "Tälle päivälle ei löytynyt vapaita saunoja.";

        } else {

            results.innerHTML = `
                <strong>Vapaat saunat:</strong><br>
                ${vapaat.join("<br>")}
            `;
        }
    });
}

const saunaSearch =
    document.getElementById("saunaSearch");

if (saunaSearch) {

    saunaSearch.addEventListener(
        "input",
        () => {

            const value =
                saunaSearch.value.toLowerCase();

            const saunat =
                document.querySelectorAll(
                    ".sauna-osio"
                );

            let visible = 0;

            saunat.forEach(sauna => {

                const show =
                    sauna.id
                        .toLowerCase()
                        .includes(value);

                sauna.style.display =
                    show ? "flex" : "none";

                if (show) visible++;
            });

            document.getElementById(
                "filterStatus"
            ).textContent =
                `Näytetään ${visible} saunaa`;
        }
    );
}

loadApiData();

