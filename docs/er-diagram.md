# Library Management System - Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ISSUED_BOOKS : issues
    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ PAYMENTS : makes
    USERS ||--o{ REQUESTS : creates
    USERS ||--o{ AUDIT_LOGS : performs
    BOOKS ||--o{ ISSUED_BOOKS : "is issued"
    SUBSCRIPTIONS ||--o| SUBSCRIPTIONS : "stacked from"
    
    USERS {
        int user_id PK
        string full_name
        string email UK
        string phone
        enum role
        string password_hash
        enum batch
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    BOOKS {
        int book_id PK
        string title
        string author
        string isbn UK
        string genre
        string publisher
        int publication_year
        int total_copies
        int available_copies
        text description
        string cover_image_url
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    ISSUED_BOOKS {
        int issue_id PK
        int user_id FK
        int book_id FK
        date issue_date
        date due_date
        date return_date
        decimal penalty_amount
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    SUBSCRIPTIONS {
        int sub_id PK
        int user_id FK
        date start_date
        date end_date
        int stacked_from FK
        decimal amount
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENTS {
        int payment_id PK
        int user_id FK
        decimal amount
        enum type
        enum method
        string razorpay_order_id
        string razorpay_payment_id
        string razorpay_signature
        int admin_processed_by FK
        enum status
        timestamp transaction_date
        text notes
    }
    
    REQUESTS {
        int request_id PK
        int user_id FK
        enum type
        string subject
        text description
        enum status
        text admin_response
        int admin_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    AUDIT_LOGS {
        int log_id PK
        string action
        string entity_type
        int entity_id
        int performed_by FK
        string ip_address
        text user_agent
        json details
        timestamp created_at
    }
```

## Table Descriptions

### USERS
Stores user account information with role-based access control.
- **Roles**: ADMIN, MEMBER
- **Batches**: MORNING, EVENING
- **Status**: ACTIVE, INACTIVE, SUSPENDED

### BOOKS
Complete book catalog with availability tracking.
- Tracks total and available copies
- Supports soft delete via status field
- Includes cover image URLs

### ISSUED_BOOKS
Records of book issuance and returns.
- Automatic penalty calculation for overdue books
- 14-day default loan period
- Status: ISSUED, RETURNED, OVERDUE

### SUBSCRIPTIONS
Membership subscriptions with stacking support.
- 3-month subscription periods
- Can stack subscriptions before expiry
- Auto-expiry via triggers

### PAYMENTS
Payment records for subscriptions and penalties.
- Supports Razorpay and cash payments
- Admin approval for cash payments
- Complete transaction tracking

### REQUESTS
User requests with admin approval workflow.
- Types: BOOK_REQUEST, SUBSCRIPTION_EXTENSION, PENALTY_WAIVER, OTHER
- Admin response tracking

### AUDIT_LOGS
Complete activity logging for compliance.
- Tracks all critical system actions
- IP address and user agent logging
- JSON details for flexible data storage

## Indexes

- Email (USERS)
- ISBN (BOOKS)
- User ID, Book ID (ISSUED_BOOKS)
- Razorpay Order ID (PAYMENTS)
- Created timestamps (AUDIT_LOGS)

## Triggers

1. **update_subscription_status**: Auto-expires subscriptions past end_date
2. **update_issued_books_status**: Auto-marks books as OVERDUE past due_date
