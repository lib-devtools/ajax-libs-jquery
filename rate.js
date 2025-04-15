   let hasRated = localStorage.getItem("hasRated");

    if (hasRated) {
        document.getElementById("ratingForm").style.display = "none";
        document.getElementById("alreadyRatedMessage").style.display = "block";
    }

    let ratings = JSON.parse(localStorage.getItem("ratings")) || [];

    if (ratings.length === 0) {
        for (let i = 0; i < 891738; i++) {
            ratings.push(Math.floor(Math.random() * 5) + 1); 
        }

        localStorage.setItem("ratings", JSON.stringify(ratings));
    }

    updateRatingCount();

    setInterval(() => {
        const randomRating = Math.floor(Math.random() * 5) + 1;
        ratings.push(randomRating);
        localStorage.setItem("ratings", JSON.stringify(ratings));
        updateRatingCount();
    }, 5 * 60 * 1000); 

    function submitRating() {
        const userRating = parseFloat(document.getElementById("userRating").value);

        if (!isNaN(userRating) && userRating >= 1 && userRating <= 5) {
            if (!hasRated) {
                ratings.push(userRating);
                localStorage.setItem("ratings", JSON.stringify(ratings));
                localStorage.setItem("hasRated", "true");

                updateRatingCount();

                alert("Thank you! Your rating has been submitted.");

                document.getElementById("ratingForm").style.display = "none";
                document.getElementById("alreadyRatedMessage").style.display = "block";
            } else {
                alert("You have already submitted your rating.");
            }
        } else {
            alert("Please enter a valid rating between 1 and 5.");
        }
    }

    function updateRatingCount() {
        document.getElementById("ratingCount").innerText = `(${ratings.length} ratings)`;
    }
