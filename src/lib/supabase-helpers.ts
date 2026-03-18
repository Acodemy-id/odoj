// src/lib/supabase-helpers.ts
// Utility to bypass Supabase's default 1000-row limit on queries.
// Without explicit .range(), Supabase silently truncates results at 1000 rows,
// leading to incorrect aggregations when the table exceeds that count.

import { type SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

/**
 * Fetch all rows from a table, paginating in chunks of 1000 to bypass
 * Supabase's default row limit.
 *
 * @param supabase - Supabase client instance
 * @param table - Table name to query
 * @param select - Column selection string (e.g. "user_id, total_pages")
 * @param options - Optional filters and ordering
 * @returns All matching rows, regardless of total count
 */
export async function fetchAllRows<T extends Record<string, unknown>>(
    supabase: SupabaseClient,
    table: string,
    select: string,
    options?: {
        filters?: Array<{ column: string; op: "eq" | "neq" | "like"; value: string }>;
        order?: { column: string; ascending: boolean };
    }
): Promise<T[]> {
    const allRows: T[] = [];
    let from = 0;

    while (true) {
        let query = supabase
            .from(table)
            .select(select)
            .range(from, from + PAGE_SIZE - 1);

        // Apply filters
        if (options?.filters) {
            for (const f of options.filters) {
                if (f.op === "eq") query = query.eq(f.column, f.value);
                else if (f.op === "neq") query = query.neq(f.column, f.value);
                else if (f.op === "like") query = query.like(f.column, f.value);
            }
        }

        // Apply ordering
        if (options?.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending });
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!data || data.length === 0) break;

        allRows.push(...(data as unknown as T[]));

        // If we got fewer rows than PAGE_SIZE, we've reached the end
        if (data.length < PAGE_SIZE) break;

        from += PAGE_SIZE;
    }

    return allRows;
}
