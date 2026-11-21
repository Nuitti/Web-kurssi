const calendarTable = document.querySelector(".calendar");

if (calendarTable) {

    let weekOffset = 0;

    const today = new Date();

    const prevBtn = document.getElementById("prevWeek");
    const nextBtn = document.getElementById("nextWeek");

    const searchBtn = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");
    const dateSearch = document.getElementById("dateSearch");

    function getMonday(date) {

        const d = new Date(date);

        const day = d.getDay();

        const diff = day === 0 ? -6 : 1 - day;

        d.setDate(d.getDate() + diff);

        return d;
    }

    function renderCalendar() {

        const monday = getMonday(today);

        monday.setDate(
            monday.getDate() + weekOffset * 7
        );

        document
            .querySelectorAll(".today-column")
            .forEach(cell => {
                cell.classList.remove("today-column");
            });

        for (let i = 0; i < 7; i++) {

            const day = new Date(monday);

            day.setDate(
                monday.getDate() + i
            );

            const headerCell =
                document.getElementById(`date${i}`);

            headerCell.classList.remove("today");

            headerCell.textContent =
                `${day.getDate()}.${day.getMonth() + 1}`;

            if (
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear()
            ) {

                headerCell.classList.add("today");

                const rows =
                    document.querySelectorAll(".calendar tr");

                rows.forEach(row => {

                    const cell =
                        row.children[i + 1];

                    if (cell) {
                        cell.classList.add("today-column");
                    }

                });
            }
        }
    }

    prevBtn.addEventListener("click", () => {

        weekOffset--;

        renderCalendar();

    });

    nextBtn.addEventListener("click", () => {

        weekOffset++;

        renderCalendar();

    });

    searchBtn.addEventListener("click", () => {


        const selectedDate = dateSearch.value;

        const statusMessage = document.getElementById("statusMessage")
        
        searchResults.style.display = "block";

        if (!selectedDate) {

            searchResults.textContent =
                "Valitse päivämäärä.";

            return;

        }

        const results = [];

        document
            .querySelectorAll(".calendar tbody tr")
            .forEach(row => {

                const saunaName =
                    row.children[0].textContent;

                const searchDate =
                    new Date(selectedDate);

                const dayIndex =
                    searchDate.getDay() === 0
                    ? 6
                    : searchDate.getDay() - 1;

                const dayCell =
                    row.children[dayIndex + 1];

                if (
                    dayCell &&
                    dayCell.classList.contains("vapaa")
                ) {

                    results.push(
                        `✅ ${saunaName} 18-22`
                    );

                }

            });

        if (results.length > 0) {

            statusMessage.textContent =
                `Näytetään ${results.length} vapaata saunavuoroa valitulle päivälle.`;

            searchResults.innerHTML = `
                <h3>Vapaat ajat</h3>
                ${results.join("<br>")}
            `;

        } else {

            statusMessage.textContent =
                "Valitulle päivälle ei löytynyt vapaita saunavuoroja.";

            searchResults.innerHTML = `
                <h3>Vapaat ajat</h3>
                Ei vapaita saunoja valitulle päivälle.
            `;
        }

    });

    dateSearch.addEventListener("click", () => {

        if (dateSearch.showPicker) {
            dateSearch.showPicker();
        }

    });

    renderCalendar();

}

