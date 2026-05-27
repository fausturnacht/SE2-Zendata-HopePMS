/**
 * @file supabase.ts
 * @description Initializes and exports a singleton Supabase client wrapped in a
 * dynamic Proxy. To protect public database resources and ensure absolute cleanliness,
 * all mutation operations (insert, update) are intercepted and redirected to a local
 * sandbox backed by localStorage. Read queries automatically pull from this localStorage
 * sandbox (which seeds itself from the real database on first read).
 *
 * This provides a zero-latency, private, and abuse-proof sandbox experience for every user.
 *
 * Environment variables required (set in `.env.local`):
 *   - VITE_SUPABASE_URL     — The Supabase project URL (e.g. https://xyz.supabase.co)
 *   - VITE_SUPABASE_ANON_KEY — The public anonymous key for client-side access
 */
import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from Vite environment variables.
const sanitize = (val: string | undefined) => 
  val?.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
     .replace(/"/g, "")                            // Remove quotes
     .trim()                                       // Remove surrounding spaces
     .replace(/\/$/, "");                          // Remove trailing slash

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY);

console.log('[Supabase] Initializing core client with URL:', supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables! Check .env.local');
}

// 1. Instantiate the real Supabase client (used for Auth and initial seeds)
const realSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// 2. Local Storage Sandbox helpers
const getLocalData = async (tableName: string): Promise<any[]> => {
  const key = `hope_pms_table_${tableName}`;
  const local = localStorage.getItem(key);
  if (local !== null) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error('[Sandbox] Error parsing localStorage for', tableName, e);
    }
  }

  // Seed table from Supabase on first access
  console.log(`[Sandbox] Seeding table "${tableName}" from live database...`);
  try {
    const { data, error } = await realSupabase.from(tableName).select('*');
    if (error) {
      console.error(`[Sandbox] Failed to seed table "${tableName}":`, error);
      return [];
    }
    const seedData = data || [];
    localStorage.setItem(key, JSON.stringify(seedData));
    return seedData;
  } catch (err) {
    console.error(`[Sandbox] Exception during seeding of table "${tableName}":`, err);
    return [];
  }
};

const setLocalData = (tableName: string, data: any[]) => {
  const key = `hope_pms_table_${tableName}`;
  localStorage.setItem(key, JSON.stringify(data));
};

interface Filter {
  type: 'eq' | 'in';
  column: string;
  value: any;
}

interface Order {
  column: string;
  ascending: boolean;
}

// 3. Mock Query Builder that simulates Supabase Postgrest queries client-side
class MockQueryBuilder {
  private tableName: string;
  private operation: 'select' | 'insert' | 'update' = 'select';
  private selectColumns: string = '*';
  private insertValues: any[] = [];
  private updateValues: any = null;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    // Only set operation to 'select' if we aren't performing a mutation
    if (this.operation === 'select') {
      this.selectColumns = columns;
    }
    return this;
  }

  insert(values: any | any[]) {
    this.operation = 'insert';
    this.insertValues = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: any) {
    this.operation = 'update';
    this.updateValues = values;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Implement Promise compatibility (thenable pattern)
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) {
        return onfulfilled(result);
      }
      return result;
    } catch (error) {
      if (onrejected) {
        return onrejected(error);
      }
      throw error;
    }
  }

  catch(onrejected?: (reason: any) => any) {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: () => void) {
    return this.then(
      value => {
        onfinally?.();
        return value;
      },
      reason => {
        onfinally?.();
        throw reason;
      }
    );
  }

  private async execute() {
    try {
      let data = await getLocalData(this.tableName);

      // --- 1. SELECT OPERATION ---
      if (this.operation === 'select') {
        // Implement client-side relational joins where requested
        if (this.tableName === 'pricehist') {
          const products = await getLocalData('product');
          data = data.map(item => {
            const matchedProduct = products.find(p => p.prodcode === item.prodcode);
            return {
              ...item,
              product: matchedProduct ? { description: matchedProduct.description } : null
            };
          });
        }

        // Apply filters
        data = data.filter(row => {
          return this.filters.every(f => {
            if (f.type === 'eq') {
              return String(row[f.column]) === String(f.value);
            }
            if (f.type === 'in') {
              return Array.isArray(f.value) && f.value.map(String).includes(String(row[f.column]));
            }
            return true;
          });
        });

        // Apply ordering
        this.orders.forEach(o => {
          data.sort((a, b) => {
            const valA = a[o.column];
            const valB = b[o.column];
            if (valA === valB) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;
            
            let comparison = 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
              comparison = valA - valB;
            } else {
              comparison = String(valA).localeCompare(String(valB));
            }
            return o.ascending ? comparison : -comparison;
          });
        });

        // Apply single / maybeSingle modifiers
        if (this.isSingle) {
          if (data.length === 0) {
            return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
          }
          return { data: data[0], error: null };
        }
        if (this.isMaybeSingle) {
          return { data: data.length > 0 ? data[0] : null, error: null };
        }

        return { data, error: null };
      }

      // --- 2. INSERT OPERATION ---
      if (this.operation === 'insert') {
        const savedRows = this.insertValues.map(row => {
          const newRow = { ...row };
          // Simulate auto-increment keys or server-generated fields
          if (this.tableName === 'product_stamp_hist' || this.tableName === 'user_stamp_hist') {
            if (!newRow.id) {
              const maxId = data.reduce((max: number, r: any) => Math.max(max, r.id || 0), 0);
              newRow.id = maxId + 1;
            }
            if (!newRow.created_at) {
              newRow.created_at = new Date().toISOString();
            }
          }
          return newRow;
        });

        const nextData = [...data, ...savedRows];
        setLocalData(this.tableName, nextData);
        console.log(`[Sandbox] Inserted into "${this.tableName}":`, savedRows);
        return { data: savedRows, error: null };
      }

      // --- 3. UPDATE OPERATION ---
      if (this.operation === 'update') {
        const updatedRows: any[] = [];
        const nextData = data.map(row => {
          const matches = this.filters.every(f => {
            if (f.type === 'eq') {
              return String(row[f.column]) === String(f.value);
            }
            if (f.type === 'in') {
              return Array.isArray(f.value) && f.value.map(String).includes(String(row[f.column]));
            }
            return true;
          });

          if (matches) {
            const updated = { ...row, ...this.updateValues };
            updatedRows.push(updated);
            return updated;
          }
          return row;
        });

        setLocalData(this.tableName, nextData);
        console.log(`[Sandbox] Updated "${this.tableName}" (${updatedRows.length} rows):`, this.updateValues);
        return { data: updatedRows, error: null };
      }

      return { data: null, error: { message: 'Unsupported sandbox operation' } };
    } catch (error: any) {
      console.error('[Sandbox] Execution Error:', error);
      return { data: null, error: { message: error.message || String(error) } };
    }
  }
}

// 4. Wrap realSupabase in a Proxy to seamlessly intercept `.from()` calls
export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return (tableName: string) => {
        return new MockQueryBuilder(tableName);
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}) as unknown as typeof realSupabase;
