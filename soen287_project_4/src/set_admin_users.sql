-- This script sets users with IDs 9 to have the 'admin' role
UPDATE users SET role = 'admin' WHERE id IN (9);

