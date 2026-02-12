import cron from 'node-cron';
import { query } from '../config/database';
import { io } from '../server';

export const startPenaltyCron = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running penalty calculation cron job...');

            const penaltyPerDay = Number(process.env.PENALTY_PER_DAY) || 10;

            // Get all overdue books
            const overdueBooks = await query<any[]>(
                `SELECT * FROM ISSUED_BOOKS 
         WHERE status IN ('ISSUED', 'OVERDUE') 
         AND due_date < CURDATE() 
         AND return_date IS NULL`
            );

            for (const book of overdueBooks) {
                const dueDate = new Date(book.due_date);
                const today = new Date();
                const daysOverdue = Math.ceil(
                    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                const penaltyAmount = daysOverdue * penaltyPerDay;

                // Update penalty amount and status
                await query(
                    `UPDATE ISSUED_BOOKS 
           SET penalty_amount = ?, status = ? 
           WHERE issue_id = ?`,
                    [penaltyAmount, 'OVERDUE', book.issue_id]
                );

                // Notify user via Socket.io
                io.emit(`penalty_updated_${book.user_id}`, {
                    issue_id: book.issue_id,
                    penalty_amount: penaltyAmount,
                    days_overdue: daysOverdue
                });
            }

            console.log(`Penalty calculation completed. Updated ${overdueBooks.length} records.`);

            // Also update expired subscriptions
            await query(
                `UPDATE SUBSCRIPTIONS 
         SET status = 'EXPIRED' 
         WHERE end_date < CURDATE() AND status = 'ACTIVE'`
            );

        } catch (error) {
            console.error('Penalty cron job error:', error);
        }
    });

    console.log('✅ Penalty calculation cron job started (runs daily at midnight)');
};
