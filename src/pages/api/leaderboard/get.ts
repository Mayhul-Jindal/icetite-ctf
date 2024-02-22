
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ redirect }) => {
    const { data, error } = await supabase
        .from('Participants')
        .select('score, name')
        .order('score ', { 
            ascending: false,
            nullsFirst: false,
         })
        .limit(10);

    if (error) {
        if (error.code == "544" || error.code == "500") {
            console.log("Error: ", error.message);
            return redirect('/contact')
        }

        return new Response(
            JSON.stringify({
                error: error.message,
            }),
            { status: 400 },
        );
    }

    return new Response(
        JSON.stringify({
            data: data,
        }),
        { status: 200 },
    );
}