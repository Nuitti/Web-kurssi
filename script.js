const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const nameField = document.getElementById("nimi");
    const emailField = document.getElementById("sahkoposti");
    const phoneField = document.getElementById("puhelin");
    const subjectField = document.getElementById("aihe");
    const messageField = document.getElementById("viesti");

    nameField.value = localStorage.getItem("nimi") || "";
    emailField.value = localStorage.getItem("sahkoposti") || "";
    phoneField.value = localStorage.getItem("puhelin") || "";
    subjectField.value = localStorage.getItem("aihe") || "";
    messageField.value = localStorage.getItem("viesti") || "";

    nameField.addEventListener("input", () => {
        localStorage.setItem("nimi", nameField.value);
    });

    emailField.addEventListener("input", () => {
        localStorage.setItem("sahkoposti", emailField.value);
    });

    phoneField.addEventListener("input", () => {
        localStorage.setItem("puhelin", phoneField.value);
    });

    subjectField.addEventListener("input", () => {
        localStorage.setItem("aihe", subjectField.value);
    });

    messageField.addEventListener("input", () => {
        localStorage.setItem("viesti", messageField.value);
    });

    document.getElementById("formStatus").textContent = "Pyyntö on valmis";

}

const saunat = [
    "Savusauna",
    "Rantasauna",
    "Mökkisauna"
];

let weekOffset = 0;

const calendarBody = document.getElementById("calendarBody");
const nextWeekBtn = document.getElementById("nextWeek");
const prevWeekBtn = document.getElementById("prevWeek");

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);
    return d;
}

function renderCalendar() {

    if (!calendarBody) return;

    calendarBody.innerHTML = "";

    const today = new Date();
    const monday = getMonday(today);

    monday.setDate(monday.getDate() + weekOffset * 7);

    let todayColumn = -1;

    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const headerCell =
            document.getElementById(`date${i}`);

        if (!headerCell) continue;

        headerCell.classList.remove("today");

        headerCell.textContent =
            date.toLocaleDateString("fi-FI");

        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            headerCell.classList.add("today");
            headerCell.classList.add("today-top");
            todayColumn = i;
        }
    }

    saunat.forEach(sauna => {

        const row = document.createElement("tr");

        const saunaCell = document.createElement("td");
        saunaCell.textContent = sauna;
        row.appendChild(saunaCell);

        for (let i = 0; i < 7; i++) {

            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            const formatted =
                date.toISOString().split("T")[0];

            const cell = document.createElement("td");

            const vapaa =
                (i + sauna.length) % 3 !== 0;

            if (vapaa) {

                cell.classList.add("vapaa");

                cell.innerHTML = "Vapaa<br>18-22";

                cell.addEventListener("click", () => {
                    varaa(sauna, formatted);
                });

            } else {

                cell.classList.add("varattu");

                cell.textContent = "Varattu";
            }

            if (i === todayColumn) {

                cell.classList.add("today-column");

            if (sauna === saunat[0]) {
                cell.classList.add("today-top");
            }

            if (sauna === saunat[saunat.length - 1]) {
                cell.classList.add("today-bottom");
            }
        }

            row.appendChild(cell);
        }

        calendarBody.appendChild(row);
    });
}

function varaa(sauna, paiva) {

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

    document
        .getElementById("varauslomake")
        ?.scrollIntoView({
            behavior: "smooth"
        });
}

if (nextWeekBtn) {
    nextWeekBtn.addEventListener("click", () => {
        weekOffset++;
        renderCalendar();
    });
}

if (prevWeekBtn) {
    prevWeekBtn.addEventListener("click", () => {
        weekOffset--;
        renderCalendar();
    });
}

renderCalendar();

const varausForm =
    document.querySelector("#varauslomake form");

if (varausForm) {

    varausForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const asiakasnumero =
            Math.floor(
                10000 + Math.random() * 90000
            );

        localStorage.setItem(
            "asiakasnumero",
            asiakasnumero
        );

        document.getElementById("varausStatus")
            .textContent =
            `Varaus onnistui. Asiakasnumerosi on ${asiakasnumero}. Tallenna numero myöhempää käyttöä varten.`;
    });
}

const haeVarausBtn =
    document.getElementById("haeVaraus");

if (haeVarausBtn) {

    haeVarausBtn.addEventListener("click", async () => {

        const tulos =
            document.getElementById("haeTulos");

        let yritykset = 0;

        while (yritykset < 3) {

            try {

                yritykset++;
                
                if (yritykset < 3) {

                    tulos.textContent =
                        `Palvelu ruuhkautunut (429). Yritetään uudelleen... (${yritykset}/3)`;

                    await new Promise(resolve =>
                        setTimeout(resolve, 2000)
                    );

                    continue;
                }

                const annettuNumero =
                    document
                        .getElementById("asiakasnumero")
                        .value;

                const tallennettuNumero =
                    localStorage.getItem("asiakasnumero");

                if (!annettuNumero) {

                    tulos.textContent =
                        "Anna asiakasnumero.";

                    return;
                }

                if (annettuNumero === tallennettuNumero) {

                    tulos.textContent =
                        "✅ Varaus löytyi.";

                } else {

                    tulos.textContent =
                        "❌ Asiakasnumeroa ei löytynyt. Tarkista numero ja yritä uudelleen.";
                }

                return;

            } catch {

                break;
            }
        }

        tulos.textContent =
            "❌ Palvelu on edelleen ruuhkautunut. Yritä myöhemmin uudelleen.";
    });
}