// Laittaa kirjautumispaneelin näkyville
function toggleLoginPanel() {
    const panel = document.getElementById("login_panel");
    const isVisible = panel.style.display === "block";
    panel.style.display = isVisible ? "none" : "block";
    if (!isVisible) {
        setTimeout(() => panel.classList.add("open"), 10);
    } else {
        panel.classList.remove("open");
    }
}

// Sulje kirjautumispaneeli
function closeLoginPanel() {
    const panel = document.getElementById("login_panel");
    panel.classList.remove("open");
    setTimeout(() => panel.style.display = "none", 250);
}

// Rekisteröitymisfunktio, joka tallentaa käyttäjätiedot localStorageen
function rekisteröidy() {
    const nimi = document.getElementById("nimi").value;
    const salasana = document.getElementById("salasana").value;

    if (!nimi || !salasana) {
        showPanelMessage("Syötä nimi ja salasana!", "error");
        return;
    }

    if (nimi === localStorage.getItem("nimi") && salasana === localStorage.getItem("salasana")) {
        showPanelMessage("Sinulla on jo käyttäjä näillä tiedoilla!", "error");
        return;
    }

    localStorage.setItem("nimi", nimi);
    localStorage.setItem("salasana", salasana);
    showPanelMessage("Rekisteröityminen onnistui! Voit nyt kirjautua sisään.", "success");
}

// Login-funktio, joka tarkistaa syötetyt tiedot ja päivittää UI:n
function login() {
    const nimi = document.getElementById("nimi").value;
    const salasana = document.getElementById("salasana").value;

    if (nimi === localStorage.getItem("nimi") && salasana === localStorage.getItem("salasana")) {
        document.getElementById("login_toggle_btn").textContent = nimi;
        document.getElementById("login_toggle_btn").classList.add("logged-in");

        document.getElementById("login_fields").style.display = "none";
        document.getElementById("logout_section").style.display = "block";
        document.getElementById("logged_in_name").textContent = nimi;

        closeLoginPanel();
    } else {
        showPanelMessage("Väärä nimi tai salasana!", "error");
    }
}

// Logout-funktio, joka poistaa käyttäjätiedot ja päivittää UI:n
function logout() {
    document.getElementById("nimi").value = "";
    document.getElementById("salasana").value = "";
    document.getElementById("login_toggle_btn").textContent = "Kirjaudu sisään";
    document.getElementById("login_toggle_btn").classList.remove("logged-in");

    document.getElementById("login_fields").style.display = "block";
    document.getElementById("logout_section").style.display = "none";

    closeLoginPanel();
}

// Näytä viesti paneelissa, tyyppi: "success" tai "error"
function showPanelMessage(msg, type) {
    const el = document.getElementById("panel_message");
    el.textContent = msg;
    el.className = "panel-message " + type;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 3500);
}

// kirjautumis menun sulku klikkaamalla muualle
document.addEventListener("click", function(e) {
    const panel = document.getElementById("login_panel");
    const btn = document.getElementById("login_toggle_btn");
    if (panel && panel.style.display === "block" && !panel.contains(e.target) && e.target !== btn) {
        closeLoginPanel();
    }
});