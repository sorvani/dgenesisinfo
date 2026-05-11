-- Run this after first login to grant yourself admin.
-- Replace GITHUB_ID and GITHUB_USERNAME with your actual values.
-- Your GitHub ID can be found at: https://api.github.com/users/YOUR_USERNAME

UPDATE users
SET    is_admin = 1
WHERE  github_id = GITHUB_ID;

-- Verify:
-- SELECT id, github_username, is_admin FROM users;
