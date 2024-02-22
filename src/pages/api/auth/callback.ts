import { type APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const authCode = url.searchParams.get("code");

    if (!authCode) {
        return new Response("No code provided", { status: 400 });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error) {
        return new Response(error.message, { status: 500 });
    }

    const { access_token, refresh_token, user } = data.session;

    
    const { data: userData, error: userError } = await supabase
        .from('Participants')
        .select('*')
        .eq('email', user.email);

    if (userError) {
        return new Response(userError.message, { status: 500 });
    }

    if (userData.length == 0) {
        return redirect("/contact");
    }

    cookies.set("sb-access-token", access_token, {
        path: "/",
    });
    cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
    });
    cookies.set("sb-user-id", user.id, {
        path: "/",
    });
    cookies.set("sb-user-email", userData[0].email, {
        path: "/",
    })

    return redirect("/");
};
