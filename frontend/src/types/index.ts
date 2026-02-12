export interface User {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    role: 'ADMIN' | 'MEMBER';
    batch: 'MORNING' | 'EVENING' | null;
    time_slot: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    created_at: string;
    updated_at: string;
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
    created_at: string;
    updated_at: string;
}

export interface IssuedBook {
    issue_id: number;
    user_id: number;
    book_id: number;
    issue_date: string;
    due_date: string;
    return_date: string | null;
    penalty_amount: number;
    status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
    created_at: string;
    updated_at: string;
    title?: string;
    author?: string;
    cover_image_url?: string | null;
}

export interface Subscription {
    sub_id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    stacked_from: number | null;
    amount: number;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    created_at: string;
    updated_at: string;
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
    transaction_date: string;
    notes: string | null;
}

export interface Request {
    request_id: number;
    user_id: number;
    type: 'BOOK_REQUEST' | 'SUBSCRIPTION_EXTENSION' | 'PENALTY_WAIVER' | 'MEMBERSHIP_REGISTRATION' | 'BATCH_CHANGE' | 'OTHER';
    subject: string;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    admin_response: string | null;
    admin_id: number | null;
    created_at: string;
    updated_at: string;
    full_name?: string;
    email?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface DashboardStats {
    totalUsers: number;
    totalBooks: number;
    activeUsers: number;
    pendingRequests: number;
    issuedBooks: number;
    overdueBooks: number;
    todayRevenue: number;
    outstandingPenalties: number;
    batchDistribution: {
        morning: number;
        evening: number;
    };
}
