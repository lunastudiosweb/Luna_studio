const form = document.querySelector(".application-form");

const SUPABASE_URL = window.LUNA_SUPABASE_URL;
const SUPABASE_KEY = window.LUNA_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Luna Studios: Supabase configuration is missing.");
}

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const application = {
        name: document.getElementById("name").value.trim(),
        discord: document.getElementById("discord").value.trim(),
        project_name: document.getElementById("project").value.trim(),
        website: document.getElementById("website").value.trim() || null,
        description: document.getElementById("description").value.trim(),
        reason: document.getElementById("reason").value.trim(),
        offer: document.getElementById("offer").value.trim()
    };

    const { error } = await supabase
        .from("partner_applications")
        .insert(application);

    if (error) {
        console.error("Partner application error:", error);

        alert(
            "Something went wrong while submitting your application. Please try again."
        );

        submitButton.disabled = false;
        submitButton.textContent = "Submit Application";

        return;
    }

    form.reset();

    submitButton.textContent = "Application Submitted";

    alert(
        "Your partner application has been submitted successfully."
    );
});