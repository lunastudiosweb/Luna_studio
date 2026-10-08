const staff = [
    {
        name: "Luna",
        role: "Founder",
        description: "I am the founder of Luna Studios."
    }
];

const staffContainer = document.getElementById("staff-container");

staff.forEach((person, index) => {

    const card = document.createElement("article");

    card.className = "staff-card";

    card.innerHTML = `
        <span class="staff-number">
            ${String(index + 1).padStart(2, "0")}
        </span>

        <div class="staff-image-wrapper">
            <div class="staff-image"></div>
        </div>

        <div class="staff-info">
            <h2 class="staff-name">${person.name}</h2>

            <p class="staff-role">${person.role}</p>

            <p class="staff-description">
                ${person.description}
            </p>
        </div>
    `;

    staffContainer.appendChild(card);
});
