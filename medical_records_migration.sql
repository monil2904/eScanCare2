-- Migration for Medical Records Table Updates
-- This migration updates the medical_records table to match the new MedicalReportForm structure

-- The medical_records table structure is already compatible with our changes since we're using JSONB fields
-- However, we can add some helpful comments and ensure the table structure is optimal

-- Add comments to clarify the JSONB structure
COMMENT ON COLUMN public.medical_records.medical_history IS 'JSONB containing: past_illnesses, surgeries, chronic_conditions, allergies, family_history, social_history';
COMMENT ON COLUMN public.medical_records.lab_investigations IS 'JSONB containing: hematology, biochemistry, liver_function, electrolytes_renal';
COMMENT ON COLUMN public.medical_records.diagnostic_tests IS 'JSONB array of diagnostic test objects with name, date, result';
COMMENT ON COLUMN public.medical_records.drug_treatments IS 'JSONB array of drug treatment objects with generic_name, brand_name, dose, route, frequency, days';
COMMENT ON COLUMN public.medical_records.daily_monitoring IS 'JSONB array of daily monitoring objects with date_time, vital_signs, systematic_examination, advice';
COMMENT ON COLUMN public.medical_records.discharge_medications IS 'JSONB array of discharge medication objects with generic_name, brand_name, dose, route, frequency, duration';
COMMENT ON COLUMN public.medical_records.follow_up_details IS 'JSONB containing: medications, appointment_date, instructions, monitoring_required';

-- Update the existing table structure if needed (the current structure should already support our changes)
-- Since we're using JSONB fields, no structural changes are needed

-- Add any additional indexes for better performance if needed
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON public.medical_records USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records USING btree (doctor_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id ON public.medical_records USING btree (appointment_id) TABLESPACE pg_default;

-- Add RLS policies if they don't exist
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "medical_records_select_own" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_select_doctors" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_select_staff_admin" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_update_staff_admin" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_insert_staff_admin" ON public.medical_records;

-- Create RLS policies
CREATE POLICY "medical_records_select_own" ON public.medical_records
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "medical_records_select_doctors" ON public.medical_records
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "medical_records_select_staff_admin" ON public.medical_records
    FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "medical_records_update_staff_admin" ON public.medical_records
    FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "medical_records_insert_staff_admin" ON public.medical_records
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
CREATE OR REPLACE FUNCTION update_medical_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_records_updated_at();

-- Sample data structure documentation (for reference)
/*
Expected JSONB structure for lab_investigations:

{
  "hematology": {
    "hemoglobin": "",
    "red_blood_cells": "",
    "white_blood_cells": "",
    "neutrophils": "",
    "lymphocytes": "",
    "monocytes": "",
    "eosinophils": "",
    "basophils": "",
    "erythrocyte_sedimentation_rate": "",
    "platelets_thrombocytes": "",
    "mean_corpuscular_hemoglobin": "",
    "mean_corpuscular_hemoglobin_concentration": "",
    "mean_corpuscular_volume": "",
    "packed_cell_volume": ""
  },
  "biochemistry": {
    "bsl_random": "",
    "bsl_fasting": "",
    "hba1c": ""
  },
  "liver_function": {
    "ast_sgot": "",
    "alt_sgpt": "",
    "alp": "",
    "bilirubin_total": "",
    "bilirubin_direct": "",
    "bilirubin_indirect": "",
    "total_protein": "",
    "albumin": ""
  },
  "electrolytes_renal": {
    "sodium_ion": "",
    "potassium_ion": "",
    "blood_urea": "",
    "calcium": "",
    "chloride": "",
    "phosphate": "",
    "uric_acid": "",
    "serum_creatinine": ""
  }
}

Expected JSONB structure for daily_monitoring:

[
  {
    "date_time": "",
    "vital_signs": {
      "temperature": "",
      "pulse": "",
      "respiration": "",
      "blood_pressure": "",
      "spo2": ""
    },
    "systematic_examination": {
      "cvs": "",
      "rs": "",
      "git": "",
      "cns": ""
    },
    "advice": ""
  }
]
*/
