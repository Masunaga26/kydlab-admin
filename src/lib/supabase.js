import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xsciiqcucnnaqkaytvzv.supabase.co';
const supabaseKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzY2lpcWN1Y25uYXFrYXl0dnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzYyNzQsImV4cCI6MjA4NzAxMjI3NH0.XwEcRJuXKq6XNOI5mwI9jGKkOiTeiLbQBeanlEhLr7Q';

export const supabase = createClient(supabaseUrl, supabaseKey);