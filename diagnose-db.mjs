import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function diagnose() {
    console.log('Checking connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const tables = ['profiles', 'leads', 'activities', 'stage_labels']

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count(*)').limit(1)
        if (error) {
            console.log(`❌ Table "${table}": ${error.message}`)
        } else {
            console.log(`✅ Table "${table}": Found`)
        }
    }
}

diagnose()
