CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id serial PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK (equity >= 0 AND equity <= 1),
    company_handle text NOT NULL REFERENCES companies(handle) ON DELETE CASCADE,
    date_posted timestamp with time zone DEFAULT NOW()    
);