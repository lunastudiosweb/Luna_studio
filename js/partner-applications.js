const supabase = window.supabase.createClient(
    window.LUNA_SUPABASE_URL,
    window.LUNA_SUPABASE_ANON_KEY
);

const applicationsList = document.getElementById("applications-list");
const applicationsStatus = document.getElementById("applications-status");
const refreshButton = document.getElementById("refresh-button");
const logoutButton = document.getElementById("logout-button");


async function checkStaffAccess() {

    const {
        data: {
            user
        },
        error
    } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "../staff-login.html";
        return null;
    }

    const {
        data: staff,
        error: staffError
    } = await supabase
        .from("staff_members")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (staffError || !staff) {
        await supabase.auth.signOut();

        window.location.href = "../staff-login.html";

        return null;
    }

    return staff;
}


async function loadApplications() {

    applicationsStatus.textContent = "Loading applications...";
    applicationsList.innerHTML = "";

    const staff = await checkStaffAccess();

    if (!staff) {
        return;
    }

    const {
        data: applications,
        error
    } = await supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Luna Studios application loading error:",
            error
        );

        applicationsStatus.textContent =
            "Could not load applications.";

        return;
    }

    if (!applications || applications.length === 0) {

        applicationsStatus.textContent = "";

        applicationsList.innerHTML = `
            <div class="empty-applications">
                No partner applications have been submitted yet.
            </div>
        `;

        return;
    }

    applicationsStatus.textContent =
        `${applications.length} application${applications.length === 1 ? "" : "s"}`;

    applications.forEach(application => {

        applicationsList.appendChild(
            createApplicationCard(application)
        );

    });
}


function createApplicationCard(application) {

    const card = document.createElement("article");

    card.className = "application-card";

    const createdDate = new Date(
        application.created_at
    ).toLocaleString();

    const website = application.website
        ? `
            <a
                href="${escapeAttribute(application.website)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHTML(application.website)}
            </a>
        `
        : "Not provided";

    card.innerHTML = `
        <div class="application-header">

            <div>

                <h3>
                    ${escapeHTML(application.name)}
                </h3>

                <p class="application-project">
                    ${escapeHTML(application.project_name)}
                </p>

            </div>

            <span class="application-status">
                ${escapeHTML(application.status)}
            </span>

        </div>


        <div class="application-details">

            <div class="application-detail">

                <strong>
                    Discord
                </strong>

                <p>
                    ${escapeHTML(application.discord)}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    Website
                </strong>

                <p>
                    ${website}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    Submitted
                </strong>

                <p>
                    ${escapeHTML(createdDate)}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    Project
                </strong>

                <p>
                    ${escapeHTML(application.project_name)}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    About the project
                </strong>

                <p>
                    ${escapeHTML(application.description)}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    Why they want to partner
                </strong>

                <p>
                    ${escapeHTML(application.reason)}
                </p>

            </div>


            <div class="application-detail">

                <strong>
                    What they offer
                </strong>

                <p>
                    ${escapeHTML(application.offer)}
                </p>

            </div>

        </div>


        <div class="application-actions">

            ${
                application.status === "pending"
                    ? `
                        <button
                            class="button primary accept-button"
                            data-id="${escapeAttribute(application.id)}"
                        >
                            Accept
                        </button>

                        <button
                            class="button secondary reject-button"
                            data-id="${escapeAttribute(application.id)}"
                        >
                            Reject
                        </button>
                    `
                    : `
                        <button
                            class="button secondary"
                            disabled
                        >
                            ${application.status === "accepted"
                                ? "Accepted"
                                : "Rejected"}
                        </button>
                    `
            }

        </div>
    `;

    const acceptButton =
        card.querySelector(".accept-button");

    const rejectButton =
        card.querySelector(".reject-button");


    if (acceptButton) {

        acceptButton.addEventListener(
            "click",
            () => updateApplication(
                application.id,
                "accepted"
            )
        );

    }


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            () => updateApplication(
                application.id,
                "rejected"
            )
        );

    }


    return card;
}


async function updateApplication(id, status) {

    const action =
        status === "accepted"
            ? "accept"
            : "reject";

    const confirmed = confirm(
        `Are you sure you want to ${action} this application?`
    );

    if (!confirmed) {
        return;
    }

    const {
        error
    } = await supabase
        .from("partner_applications")
        .update({
            status
        })
        .eq("id", id);

    if (error) {

        console.error(
            "Luna Studios application update error:",
            error
        );

        alert(
            "Could not update the application."
        );

        return;
    }

    await loadApplications();
}


logoutButton.addEventListener(
    "click",
    async () => {

        await supabase.auth.signOut();

        window.location.href =
            "../staff-login.html";

    }
);


refreshButton.addEventListener(
    "click",
    loadApplications
);


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}


loadApplications();
