const form = document.getElementById("staff-login-form");
const status = document.getElementById("login-status");

console.log("Luna Studios: staff-login.js loaded.");

if (!window.supabase) {
    console.error("Luna Studios: Supabase library did not load.");
    status.textContent = "Supabase failed to load.";
} else if (!window.LUNA_SUPABASE_URL || !window.LUNA_SUPABASE_ANON_KEY) {
    console.error("Luna Studios: Supabase configuration is missing.");
    status.textContent = "Supabase configuration is missing.";
} else {

    const supabase = window.supabase.createClient(
        window.LUNA_SUPABASE_URL,
        window.LUNA_SUPABASE_ANON_KEY
    );

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("Luna Studios: login form submitted.");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        status.textContent = "Signing in...";

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Luna Studios login error:", error);
            status.textContent = error.message;
            return;
        }

        console.log("Luna Studios: authentication successful.", data.user);

        const { data: staff, error: staffError } = await supabase
            .from("staff_members")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();

        if (staffError) {
            console.error("Luna Studios staff lookup error:", staffError);
            status.textContent = "Could not verify staff access.";
            return;
        }

        if (!staff) {
            console.error("Luna Studios: user is not a staff member.");
            await supabase.auth.signOut();
            status.textContent = "You do not have access to the staff portal.";
            return;
        }

        console.log("Luna Studios: staff access confirmed.", staff.role);

        window.location.href = "admin/partner-applications.html";
    });
}
