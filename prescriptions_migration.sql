-- Migration for Prescriptions Table Updates
-- This migration updates the prescriptions table to match the updated PrescriptionForm structure

-- The prescriptions table structure is already compatible since we're using JSONB fields
-- However, we can add some helpful comments and ensure the table structure is optimal

-- Add comments to clarify the JSONB structure
COMMENT ON COLUMN public.prescriptions.medications IS 'JSONB array of medication objects with name, generic_name, dosage, frequency, duration, timing, instructions, side_effects';

-- Update the existing table structure if needed (the current structure should already support our changes)
-- Since we're using JSONB fields, no structural changes are needed

-- Add any additional indexes for better performance if needed
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON public.prescriptions USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescription_date ON public.prescriptions USING btree (prescription_date) TABLESPACE pg_default;

-- Add RLS policies if they don't exist
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "prescriptions_select_own" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_select_doctors" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_select_staff_admin" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_update_staff_admin" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_insert_staff_admin" ON public.prescriptions;

-- Create RLS policies
CREATE POLICY "prescriptions_select_own" ON public.prescriptions
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "prescriptions_select_doctors" ON public.prescriptions
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "prescriptions_select_staff_admin" ON public.prescriptions
    FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "prescriptions_update_staff_admin" ON public.prescriptions
    FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "prescriptions_insert_staff_admin" ON public.prescriptions
    FOR INSERT WITH CHECK (is_staff_or_admin());

-- Ensure the is_staff_or_admin function exists
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_prescriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_prescriptions_updated_at();

-- Sample data structure documentation (for reference)
/*
Expected JSONB structure for medications:

[
  {
    "name": "Paracetamol",
    "generic_name": "Acetaminophen",
    "dosage": "500mg",
    "frequency": "3 times daily",
    "duration": "7 days",
    "timing": "after_food",
    "instructions": "Take with plenty of water",
    "side_effects": "May cause drowsiness"
  },
  {
    "name": "Ibuprofen",
    "generic_name": "Ibuprofen",
    "dosage": "400mg",
    "frequency": "2 times daily",
    "duration": "5 days",
    "timing": "after_food",
    "instructions": "Take with food to avoid stomach upset",
    "side_effects": "May cause stomach irritation"
  }
]

Timing options:
- "after_food" - After Food
- "before_food" - Before Food  
- "empty_stomach" - Empty Stomach
- "anytime" - Anytime

Note: The "quantity" field has been removed from the medication structure
as it was removed from the PrescriptionForm.jsx interface.
*/
