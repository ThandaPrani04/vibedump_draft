/*
# Seed Initial Data for VibeDump Platform

## Description
This migration seeds the database with initial communities and sample data for development and testing.

## Communities Created
- General Support
- Anxiety Support
- Depression Support
- Student Mental Health
- Workplace Stress
- Relationship Issues
*/

-- Insert initial communities
INSERT INTO public.communities (name, description) VALUES
  ('General Support', 'A welcoming space for general mental health support and discussions. Share your experiences and connect with others on similar journeys.'),
  ('Anxiety Support', 'A community focused on understanding and managing anxiety. Share coping strategies, experiences, and support each other through anxious moments.'),
  ('Depression Support', 'A safe space for those dealing with depression. Share your struggles and victories, and find understanding from others who truly get it.'),
  ('Student Mental Health', 'Support specifically for students dealing with academic stress, social pressures, and mental health challenges during their educational journey.'),
  ('Workplace Stress', 'Discuss work-related stress, burnout, and strategies for maintaining mental health in professional environments.'),
  ('Relationship Issues', 'A space to discuss relationship challenges, communication issues, and the mental health aspects of interpersonal relationships.')
ON CONFLICT DO NOTHING;

-- Insert sample posts (these will be associated with actual users when they sign up)
-- Note: These are just schema examples, actual posts will be created by real users