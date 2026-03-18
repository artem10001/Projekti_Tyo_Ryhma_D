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

    // Tallennetaan tiedot
    localStorage.setItem("nimi", nimi);
    localStorage.setItem("salasana", salasana);

    //automaattinen kirjautuminen
    document.getElementById("login_toggle_btn").textContent = nimi;
    document.getElementById("login_toggle_btn").classList.add("logged-in");

    document.getElementById("login_fields").style.display = "none";
    document.getElementById("logout_section").style.display = "block";
    document.getElementById("logged_in_name").textContent = nimi;

    showPanelMessage("Rekisteröityminen onnistui!", "success");

    closeLoginPanel();
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
})

window.addEventListener("load", function () {
    const nimi = localStorage.getItem("nimi");

    if (nimi) {
        document.getElementById("login_toggle_btn").textContent = nimi;
        document.getElementById("login_toggle_btn").classList.add("logged-in");

        document.getElementById("login_fields").style.display = "none";
        document.getElementById("logout_section").style.display = "block";
        document.getElementById("logged_in_name").textContent = nimi;
    }
});

let selectedRating = 0; 

function rate(stars) {
    selectedRating = stars;
    const starsList = document.querySelectorAll('.star');
    
    starsList.forEach(star => star.classList.remove('selected'));
    
    for (let i = 0; i < stars; i++) {
        starsList[i].classList.add('selected');
    }
}

function submitReview() {
    const reviewText = document.getElementById('reviewText').value;
    
    if (selectedRating === 0 || reviewText === '') {
        document.getElementById('reviewMessage').textContent = "Arvostelu ei ole kelvollinen. Valitse tähti ja kirjoita arvostelu.";
        return;
    }

    const review = {
        rating: selectedRating,
        text: reviewText
    };

    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    document.getElementById('reviewMessage').textContent = "Arvostelu lähetetty! Kiitos!";
    document.getElementById('reviewText').value = '';
    selectedRating = 0;  
    updateReviews();
}

function updateReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';  

    reviews.forEach(review => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${'★'.repeat(review.rating)}</strong> ${review.text}`;
        reviewsList.appendChild(li);
    });
}

window.onload = function() {
    updateReviews();

    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-value'));
            rate(rating);
        });
    });
};