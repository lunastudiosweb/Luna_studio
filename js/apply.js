const form = document.querySelector(".application-form");

const SUPABASE_URL = window.LUNA_SUPABASE_URL;
const SUPABASE_KEY = window.LUNA_SUPABASE_ANON_KEY;

const DISCORD_WORKER_URL =
    "https://luna-studios-partner-applications.luna-studio-websites.workers.dev/";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Luna Studios: Supabase configuration is missing.");
}

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const application = {

        name:
            document.getElementById("name")
                .value
                .trim(),

        discord:
            document.getElementById("discord")
                .value
                .trim(),

        project_name:
            document.getElementById("project")
                .value
                .trim(),

        website:
            document.getElementById("website")
                .value
                .trim() || null,

        description:
            document.getElementById("description")
                .value
                .trim(),

        reason:
            document.getElementById("reason")
                .value
                .trim(),

        offer:
            document.getElementById("offer")
                .value
                .trim()
    };

    try {

        const { error: supabaseError } =
            await supabase
                .from("partner_applications")
                .insert(application);

        if (supabaseError) {

            console.error(
                "Partner application Supabase error:",
                supabaseError
            );

            throw new Error(
                "Could not save the application."
            );
        }

        const discordResponse =
            await fetch(DISCORD_WORKER_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    projectName:
                        application.project_name,

                    website:
                        application.website,

                    discord:
                        application.discord,

                    contact:
                        application.name,

                    description:
                        application.description,

                    reason:
                        application.reason,

                    offer:
                        application.offer

                })

            });

        const discordResult =
            await discordResponse.json();

        if (!discordResponse.ok ||
            !discordResult.success) {

            console.error(
                "Discord application error:",
                discordResult
            );

            form.reset();

            submitButton.disabled = false;
            submitButton.textContent =
                "Submit Application";

            alert(
                "Your application was saved successfully, but the Discord notification could not be sent."
            );

            return;
        }

        form.reset();

        submitButton.disabled = false;
        submitButton.textContent =
            "Submit Application";

        alert(
            "Your partner application has been submitted successfully."
        );

    } catch (error) {

        console.error(
            "Partner application error:",
            error
        );

        alert(
            "Something went wrong while submitting your application. Please try again."
        );

        submitButton.disabled = false;
        submitButton.textContent =
            "Submit Application";
    }

});
