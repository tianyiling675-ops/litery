-- 创建数据库
CREATE DATABASE IF NOT EXISTS saas_algorithm_platform;

-- 使用数据库
\c saas_algorithm_platform;

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 创建租户表
CREATE TABLE tenants (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认租户
INSERT INTO tenants (id, name, description, settings) VALUES 
('default', '默认租户', '系统默认租户', '{"maxUsers": 1000, "maxAlgorithms": 10000, "features": ["algorithms", "tasks", "visualization", "api"]}');

-- 创建系统配置表
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入系统配置
INSERT INTO system_configs (key, value, category, description) VALUES
('platform_name', 'SaaS智能算法平台', 'general', '平台名称'),
('max_tasks_per_user', '100', 'limits', '每个用户最大并发任务数'),
('task_timeout', '3600', 'limits', '任务超时时间（秒）'),
('file_upload_max_size', '104857600', 'limits', '文件上传最大尺寸（字节）'),
('algorithm_pricing_tiers', '[{"min": 0, "max": 10, "commission": 0.3}, {"min": 10, "max": 100, "commission": 0.25}, {"min": 100, "max": null, "commission": 0.2}]', 'pricing', '算法定价阶梯');

-- 创建算法分类表
CREATE TABLE algorithm_categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入算法分类
INSERT INTO algorithm_categories (id, name, description, icon, sort_order) VALUES
('machine-learning', '机器学习', '包含各种机器学习算法', '🤖', 1),
('deep-learning', '深度学习', '神经网络和深度学习算法', '🧠', 2),
('data-analysis', '数据分析', '数据统计分析和可视化算法', '📊', 3),
('image-processing', '图像处理', '计算机视觉和图像处理算法', '🖼️', 4),
('natural-language', '自然语言处理', '文本分析和语言处理算法', '💬', 5);

-- 创建用户权限表（支持RBAC）
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入基础权限
INSERT INTO permissions (name, resource, action, description) VALUES
('user.create', 'user', 'create', '创建用户'),
('user.read', 'user', 'read', '读取用户信息'),
('user.update', 'user', 'update', '更新用户信息'),
('user.delete', 'user', 'delete', '删除用户'),
('algorithm.create', 'algorithm', 'create', '创建算法'),
('algorithm.read', 'algorithm', 'read', '读取算法信息'),
('algorithm.update', 'algorithm', 'update', '更新算法信息'),
('algorithm.delete', 'algorithm', 'delete', '删除算法'),
('task.create', 'task', 'create', '创建任务'),
('task.read', 'task', 'read', '读取任务信息'),
('task.update', 'task', 'update', '更新任务状态'),
('task.delete', 'task', 'delete', '删除任务'),
('admin.access', 'admin', 'access', '访问管理后台');

-- 创建角色权限关联表
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- 为不同角色分配权限
INSERT INTO role_permissions (role, permission_id) 
SELECT 'USER', id FROM permissions WHERE name IN ('user.read', 'user.update', 'algorithm.read', 'task.create', 'task.read', 'task.update', 'task.delete');

INSERT INTO role_permissions (role, permission_id) 
SELECT 'PREMIUM', id FROM permissions WHERE name IN ('user.read', 'user.update', 'algorithm.create', 'algorithm.read', 'algorithm.update', 'algorithm.delete', 'task.create', 'task.read', 'task.update', 'task.delete');

INSERT INTO role_permissions (role, permission_id) 
SELECT 'ENTERPRISE', id FROM permissions WHERE name IN ('user.read', 'user.update', 'algorithm.create', 'algorithm.read', 'algorithm.update', 'algorithm.delete', 'task.create', 'task.read', 'task.update', 'task.delete');

INSERT INTO role_permissions (role, permission_id) 
SELECT 'ADMIN', id FROM permissions;