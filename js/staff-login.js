const form = document.getElementById("staff-login-form");
const status = document.getElementById("login-status");

const supabase = window.supabase.createClient(
    window.LUNA_SUPABASE_URL,
    window.LUNA_SUPABASE_ANON_KEY
);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    status.textContent = "Signing in...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(error);
        status.textContent = "Invalid email or password.";
        return;
    }

    const user = data.user;

    const { data: staff, error: staffError } = await supabase
        .from("staff_members")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (staffError || !staff) {
        await supabase.auth.signOut();

        status.textContent = "You do not have access to the staff portal.";
        return;
    }

    window.location.href = "admin/partner-applications.html";
});