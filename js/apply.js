
const form = document.querySelector(".application-form");

const SUPABASE_URL = window.LUNA_SUPABASE_URL;
const SUPABASE_KEY = window.LUNA_SUPABASE_ANON_KEY;

const DISCORD_WORKER_URL =
    "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE";

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

        /*
         * Save the application to Supabase.
         */

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


        /*
         * Send the application to Discord.
         */

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

            /*
             * The application is already safely
             * stored in Supabase, so we don't
             * delete it if Discord fails.
             */

            alert(
                "Your application was saved successfully, but the Discord notification could not be sent."
            );

            form.reset();

            submitButton.textContent =
                "Application Submitted";

            return;
        }


        form.reset();

        submitButton.textContent =
            "Application Submitted";

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

