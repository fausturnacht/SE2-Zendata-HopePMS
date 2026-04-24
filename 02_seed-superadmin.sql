-- Seed Modules and Rights
INSERT INTO Module (Module_ID, module_name) VALUES ('Prod_Mod', 'Product Module'),
                                                   ('Report_Mod', 'Report Module'), 
                                                   ('Adm_Mod', 'Admin Module');
INSERT INTO rights (Right_ID, right_name) VALUES ('PRD_ADD', 'Add Product'), 
                                                 ('PRD_EDIT', 'Edit Product'), 
                                                 ('PRD_DEL', 'Soft Delete Product'), 
                                                 ('REP_001', 'Product Listing'), 
                                                 ('REP_002', 'Top Selling Report'), 
                                                 ('ADM_USER', 'Manage Users');

-- Seed SUPERADMIN
INSERT INTO users (userid, email, username, user_type, record_status) 
VALUES ('user1', 'jcesperanza@neu.edu.ph', 'Jerry', 'SUPERADMIN', 'ACTIVE'),
       ('user2', 'angellyn.tolentino@neu.edu.ph', 'Angel Lyn', 'SUPERADMIN', 'ACTIVE');

-- Grant ALL Module access to SUPERADMIN
INSERT INTO user_module (userid, Module_ID, rights_value)
SELECT u.userid, m.Module_ID, 1
FROM users u, Module m
WHERE u.user_type = 'SUPERADMIN';

-- Grant ALL specific rights to SUPERADMIN
INSERT INTO UserModule_Rights (userid, Right_ID, right_value)
SELECT u.userid, r.Right_ID, 1
FROM users u, rights r
WHERE u.user_type = 'SUPERADMIN';