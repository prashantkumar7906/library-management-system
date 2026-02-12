export interface User {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    role: 'ADMIN' | 'MEMBER';
    password_hash: string;
    batch: 'MORNING' | 'EVENING' | null;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    created_at: Date;
    updated_at: Date;
}

export interface Book {
    book_id: number;
    title: string;
    author: string;
    isbn: string | null;
    genre: string | null;
    publisher: string | null;
    publication_year: number | null;
    total_copies: number;
    available_copies: number;
    description: string | null;
    cover_image_url: string | null;
    status: 'ACTIVE' | 'ARCHIVED';
    created_at: Date;
    updated_at: Date;
}

export interface IssuedBook {
    issue_id: number;
    user_id: number;
    book_id: number;
    issue_date: Date;
    due_date: Date;
    return_date: Date | null;
    penalty_amount: number;
    status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
    created_at: Date;
    updated_at: Date;
}

export interface Subscription {
    sub_id: number;
    user_id: number;
    start_date: Date;
    end_date: Date;
    stacked_from: number | null;
    amount: number;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    created_at: Date;
    updated_at: Date;
}

export interface Payment {
    payment_id: number;
    user_id: number;
    amount: number;
    type: 'SUBSCRIPTION' | 'PENALTY';
    method: 'CASH' | 'RAZORPAY';
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_signature: string | null;
    admin_processed_by: number | null;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transaction_date: Date;
    notes: string | null;
}

export interface Request {
    request_id: number;
    user_id: number;
    type: 'BOOK_REQUEST' | 'SUBSCRIPTION_EXTENSION' | 'PENALTY_WAIVER' | 'OTHER';
    subject: string;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    admin_response: string | null;
    admin_id: number | null;
    created_at: Date;
    updated_at: Date;
}

export interface AuditLog {
    log_id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    performed_by: number;
    ip_address: string | null;
    user_agent: string | null;
    details: any;
    created_at: Date;
}

export interface JWTPayload {
    userId: number;
    email: string;
    role: 'ADMIN' | 'MEMBER';
}
