import { query } from '../config/database';

interface AuditLogParams {
    action: string;
    entityType: string;
    entityId: number | null;
    performedBy: number;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
}

export const logAudit = async (params: AuditLogParams): Promise<void> => {
    try {
        await query(
            `INSERT INTO AUDIT_LOGS 
       (action, entity_type, entity_id, performed_by, ip_address, user_agent, details) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                params.action,
                params.entityType,
                params.entityId,
                params.performedBy,
                params.ipAddress || null,
                params.userAgent || null,
                params.details ? JSON.stringify(params.details) : null
            ]
        );
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw error to prevent audit logging from breaking main functionality
    }
};

export const getAuditLogs = async (filters?: {
    userId?: number;
    action?: string;
    limit?: number;
    offset?: number;
}) => {
    try {
        let sql = 'SELECT * FROM AUDIT_LOGS WHERE 1=1';
        const params: any[] = [];

        if (filters?.userId) {
            sql += ' AND performed_by = ?';
            params.push(filters.userId);
        }

        if (filters?.action) {
            sql += ' AND action = ?';
            params.push(filters.action);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);

            if (filters?.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        return await query(sql, params);
    } catch (error) {
        console.error('Get audit logs error:', error);
        throw error;
    }
};
