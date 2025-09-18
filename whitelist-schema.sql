-- Whitelist functionality for eScanCare Hospital
-- Run this in your Supabase SQL Editor after the main database schema

-- Create whitelist table for managing user registrations
CREATE TABLE whitelist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    user_type TEXT CHECK (user_type IN ('doctor', 'staff', 'admin')) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    department_id UUID REFERENCES departments(id),
    specialization TEXT, -- For doctors
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    invited_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_whitelist_email ON whitelist(email);
CREATE INDEX idx_whitelist_status ON whitelist(status);
CREATE INDEX idx_whitelist_user_type ON whitelist(user_type);
CREATE INDEX idx_whitelist_department_id ON whitelist(department_id);

-- Enable Row Level Security
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whitelist
-- Only admins can view and manage whitelist
CREATE POLICY "whitelist_select_admin" ON whitelist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "whitelist_insert_admin" ON whitelist
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "whitelist_update_admin" ON whitelist
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "whitelist_delete_admin" ON whitelist
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Function to check if user is whitelisted
CREATE OR REPLACE FUNCTION is_user_whitelisted(user_email TEXT, user_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM whitelist 
        WHERE email = user_email 
        AND user_type = user_type 
        AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can register (patients can always register, others need whitelist)
CREATE OR REPLACE FUNCTION can_user_register(user_email TEXT, user_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Patients can always register
    IF user_type = 'patient' THEN
        RETURN TRUE;
    END IF;
    
    -- Other user types need to be whitelisted
    RETURN is_user_whitelisted(user_email, user_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin dashboard to see whitelist status
CREATE VIEW whitelist_admin_view AS
SELECT 
    w.*,
    d.name as department_name,
    inviter.full_name as invited_by_name,
    approver.full_name as approved_by_name
FROM whitelist w
LEFT JOIN departments d ON w.department_id = d.id
LEFT JOIN profiles inviter ON w.invited_by = inviter.id
LEFT JOIN profiles approver ON w.approved_by = approver.id;

-- Grant permissions for the view
GRANT SELECT ON whitelist_admin_view TO authenticated;

