function rekisteröidy() {
    //tarkistaa että onko käyttäjällä jo olemassa oleva tili
    if (document.getElementById("nimi").value === localStorage.getItem("nimi") && document.getElementById("salasana").value === localStorage.getItem("salasana")) {
    alert("Sinulla on jo käyttäjä näillä tiedoilla!");
    return;
    }

    // varmistaa että molemmat kentät on täytetty
    if (!document.getElementById("nimi").value || !document.getElementById("salasana").value) { 
        alert("Syötä nimi ja salasana!");
        return;
    }

    // tallenna nimi ja salasana local storageen
    localStorage.setItem("nimi", document.getElementById("nimi").value);
    localStorage.setItem("salasana", document.getElementById("salasana").value);

    // näyttää rekisteröitymisen onnistumisen
    alert("Rekisteröityminen onnistui! Voit nyt kirjautua sisään.");

    // piilottaa rekisteröitymis napin ja näyttää kirjautumis napin
    document.getElementById("rekisteröidy_nappi").style.display = "none";
    document.getElementById("kirjaudu_sisään_nappi").style.display = "inline";
}

function login() {
    // tarkistaa onko syötetyt tiedot oikein ja jos on näyttää nimen ja piilottaa kirjautumis kentät ja napit
    if (document.getElementById("nimi").value === localStorage.getItem("nimi") && document.getElementById("salasana").value === localStorage.getItem("salasana")) {
        document.getElementById("nayta_kayttaja").textContent = "Kirjautunut: " + document.getElementById("nimi").value;
        document.getElementById("nimi").style.display = "none";
        document.getElementById("salasana").style.display = "none";
        document.getElementById("kirjaudu_sisään_nappi").style.display = "none";
        document.getElementById("rekisteröidy_nappi").style.display = "none";
        document.getElementById("kirjaudu_ulos_nappi").style.display = "inline";
        alert("kirjautuminen onnistui, tervetuloa " + document.getElementById("nimi").value);
    } else {
        alert("Väärä nimi tai salasana!");
    }
}

function logout() {
    // poista kaikki käyttäjään liittyvät tiedot ja näytä kirjautumis kentät ja napit uudestaan
    document.getElementById("nayta_kayttaja").textContent = "";
    document.getElementById("nimi").value = "";
    document.getElementById("salasana").value = "";

    document.getElementById("nimi").style.display = "inline";
    document.getElementById("salasana").style.display = "inline";

    document.getElementById("kirjaudu_ulos_nappi").style.display = "none";

    document.getElementById("rekisteröidy_nappi").style.display = "inline";
    document.getElementById("kirjaudu_sisään_nappi").style.display = "inline";
}