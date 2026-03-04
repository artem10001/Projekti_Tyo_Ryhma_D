function rekisteröidy() {
    const nimi = document.getElementById("nimi").value;
    const salasana = document.getElementById("salasana").value;

    if (!nimi || !salasana) {
        alert("Syötä nimi ja salasana!");
        return;
    }

    localStorage.setItem("nimi", nimi);
    localStorage.setItem("salasana", salasana);

    document.getElementById("nayta_kayttaja").textContent = "👤 " + nimi;
    document.getElementById("kirjaudu_ulos_nappi").style.display = "inline";

    alert("Tervetuloa, " + nimi + "!");
}

function logout() {
    document.getElementById("nimi").value = "";
    document.getElementById("salasana").value = "";
    document.getElementById("nayta_kayttaja").textContent = "";
    document.getElementById("kirjaudu_ulos_nappi").style.display = "none";

    alert("Kirjauduit ulos.");
}