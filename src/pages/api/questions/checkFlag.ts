import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();

    // storing question id as int
    const questionID = formData.get("id");
    const tryFlag = formData.get("flag")?.toString();

    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");
    const email = cookies.get("sb-user-email")?.value;

    // Check for tokens
    if (!accessToken || !refreshToken) {
        return redirect("/login")
    }

    // Verify the tokens
    const { error: AuthError } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
    })
    // most case ke liye it will work fine
    if (AuthError) {
        return redirect(`/login`)
    }

    const { data, error } = await supabase
        .from("Questions")
        .select("id, flag, points")
        .eq("id", questionID);

    if (error) {
        if (error.code == "544" || error.code == "500") {
            console.log("Error: ", error.message);
            return redirect('/contact')
        }

        return redirect(`/`)
    }

    // update points of user here
    if (data[0].flag !== tryFlag) {
        // update the question solved by participant
        return redirect(`/?message=${encodeURIComponent("try-harder")}`)
    }

    const { data: solvedData, error: solvedError } = await supabase
        .from('Solved')
        .insert({
            'email': email,
            'question_id': data[0].id,
        })
    if (solvedError) {
        if (solvedError.code == "544" || solvedError.code == "500") {
            console.log("Error: ", solvedError.message);
            return redirect('/contact')
        }
        
        return redirect(`/`)
    }

    // update points here
    const { data: userData, error: userError } = await supabase
        .from('Participants')
        .select('email, score')
        .eq('email', email)
    if (userError) {
        if (userError.code == "544" || userError.code == "500") {
            console.log("Error: ", userError.message);
            return redirect('/contact')
        }
        return redirect(`/`)
    }

    const newScore = userData[0].score + data[0].points;
    const { data: updateData, error: updateError } = await supabase
        .from('Participants')
        .update({ 'score': newScore })
        .match({ 'email': email })

    if (updateError) {
        if (updateError.code == "544" || updateError.code == "500") {
            console.log("Error: ", updateError.message);
            return redirect('/contact')
        }
        return redirect(`/`)
    }

    return redirect(`/?message=${encodeURIComponent("Correct-flag")}`)
};