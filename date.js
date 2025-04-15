
            const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = currentDate.getDate();
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const newDateText = `Updated on ${month} ${day}, ${year}`;

  const allMoreElements = document.querySelectorAll('.more p');

  allMoreElements.forEach(p => {
    if (p.textContent.trim().startsWith("Updated on")) {
      p.textContent = newDateText;
    }
  });
