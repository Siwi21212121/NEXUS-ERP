-- Seed test users for development
-- All passwords are hashed using bcrypt with salt rounds: 10
-- Plaintext passwords:
-- owner@erp.com: 123456
-- hr@erp.com: 123456
-- finance@erp.com: 123456
-- project@erp.com: 123456
-- employee@erp.com: 123456

INSERT INTO users (name, email, password, role)
VALUES
  (
    'Owner User',
    'owner@erp.com',
    '$2b$10$X8yFF46IxDIgZiRKAGXWCO1AI/Ri2ZbXAbLvkXjGYqMN5g6cxxj2u',
    'OWNER'
  ),
  (
    'HR Manager',
    'hr@erp.com',
    '$2b$10$X8yFF46IxDIgZiRKAGXWCO1AI/Ri2ZbXAbLvkXjGYqMN5g6cxxj2u',
    'HR_MANAGER'
  ),
  (
    'Finance Manager',
    'finance@erp.com',
    '$2b$10$X8yFF46IxDIgZiRKAGXWCO1AI/Ri2ZbXAbLvkXjGYqMN5g6cxxj2u',
    'FINANCE_MANAGER'
  ),
  (
    'Project Manager',
    'project@erp.com',
    '$2b$10$X8yFF46IxDIgZiRKAGXWCO1AI/Ri2ZbXAbLvkXjGYqMN5g6cxxj2u',
    'PROJECT_MANAGER'
  ),
  (
    'Employee User',
    'employee@erp.com',
    '$2b$10$X8yFF46IxDIgZiRKAGXWCO1AI/Ri2ZbXAbLvkXjGYqMN5g6cxxj2u',
    'EMPLOYEE'
  )
ON CONFLICT (email) DO NOTHING;
