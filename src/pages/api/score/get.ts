
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ cookies, redirect }) => {
    const email = cookies.get("sb-user-email")?.value;

    const { data, error } = await supabase
        .from('Participants')
        .select('score')
        .eq('email', email)

    if (error) {
        if (error.code == "544" || error.code == "500") {
            console.log("Error: ", error.message);
            return redirect('/contact')
        }

        return redirect(`/`);
    }

    return new Response(
        JSON.stringify({
            data: data,
        }),
        { status: 200 },
    );
}