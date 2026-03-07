/**
 * Mock Data for Testing
 * Contains all dummy data to replace API calls during development
 */

// Mock User Data
export const mockUserData = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    token: 'mock_token_12345',
    vendor_id: '1',
    business_name: 'John\'s Home Services',
    status: 'active',
};

// Mock Dashboard Data
export const mockDashboardData = {
    success: true,
    data: {
        stats: {
            total_orders: 156,
            pending_orders: 12,
            completed_orders: 140,
            cancelled_orders: 4,
            total_earnings: 125000,
            this_month_earnings: 28500,
            wallet_balance: 15000,
            total_reviews: 89,
            average_rating: 4.5,
        },
        recent_orders: [
            {
                id: 1,
                order_number: 'HD12345',
                customer_name: 'Rahul Sharma',
                service: 'AC Repair',
                amount: 1500,
                status: 'pending',
                date: '21 Jan 2026',
                phone: '9876543210',
            },
            {
                id: 2,
                order_number: 'HD12346',
                customer_name: 'Priya Patel',
                service: 'Plumbing',
                amount: 850,
                status: 'in_progress',
                date: '20 Jan 2026',
                phone: '9876543211',
            },
            {
                id: 3,
                order_number: 'HD12347',
                customer_name: 'Amit Kumar',
                service: 'Electrical Work',
                amount: 2200,
                status: 'completed',
                date: '19 Jan 2026',
                phone: '9876543212',
            },
        ],
        upcoming_bookings: [
            {
                id: 4,
                order_number: 'HD12348',
                customer_name: 'Sneha Reddy',
                service: 'Home Cleaning',
                amount: 800,
                scheduled_date: '22 Jan 2026',
                scheduled_time: '10:00 AM',
                address: '321 Whitefield, Bangalore',
            },
            {
                id: 5,
                order_number: 'HD12349',
                customer_name: 'Vikram Singh',
                service: 'Painting',
                amount: 5500,
                scheduled_date: '23 Jan 2026',
                scheduled_time: '09:00 AM',
                address: '654 HSR Layout, Bangalore',
            },
        ],
    },
};

// Mock Orders Data
export const mockOrdersData = {
    success: true,
    data: [
        {
            id: 1,
            order_number: 'HD12345',
            customer_name: 'Rahul Sharma',
            service: 'AC Repair',
            category: 'Electronics',
            amount: 1500,
            status: 'pending',
            date: '21 Jan 2026',
            time: '10:30 AM',
            address: '123 MG Road, Bangalore',
            phone: '9876543210',
            description: 'AC not cooling properly',
        },
        {
            id: 2,
            order_number: 'HD12346',
            customer_name: 'Priya Patel',
            service: 'Plumbing',
            category: 'Home Services',
            amount: 850,
            status: 'in_progress',
            date: '20 Jan 2026',
            time: '02:00 PM',
            address: '456 Indiranagar, Bangalore',
            phone: '9876543211',
            description: 'Water leakage in bathroom',
        },
        {
            id: 3,
            order_number: 'HD12347',
            customer_name: 'Amit Kumar',
            service: 'Electrical Work',
            category: 'Electrical',
            amount: 2200,
            status: 'completed',
            date: '19 Jan 2026',
            time: '11:00 AM',
            address: '789 Koramangala, Bangalore',
            phone: '9876543212',
            description: 'Complete house rewiring',
        },
    ],
};

// Mock Reviews Data
export const mockReviewsData = {
    success: true,
    data: [
        {
            id: 1,
            customer_name: 'Rahul Sharma',
            rating: 5,
            comment: 'Excellent service! Very professional and timely.',
            date: '20 Jan 2026',
            service: 'AC Repair',
        },
        {
            id: 2,
            customer_name: 'Priya Patel',
            rating: 4,
            comment: 'Good work. Could have been faster.',
            date: '19 Jan 2026',
            service: 'Plumbing',
        },
        {
            id: 3,
            customer_name: 'Amit Kumar',
            rating: 5,
            comment: 'Highly recommended! Quality work at reasonable price.',
            date: '18 Jan 2026',
            service: 'Electrical Work',
        },
    ],
};

// Mock States Data
export const mockStatesData = {
    success: true,
    data: [
        { id: 1, name: 'Karnataka', code: 'KA' },
        { id: 2, name: 'Maharashtra', code: 'MH' },
        { id: 3, name: 'Tamil Nadu', code: 'TN' },
        { id: 4, name: 'Delhi', code: 'DL' },
        { id: 5, name: 'Gujarat', code: 'GJ' },
        { id: 6, name: 'Rajasthan', code: 'RJ' },
        { id: 7, name: 'Uttar Pradesh', code: 'UP' },
        { id: 8, name: 'West Bengal', code: 'WB' },
    ],
};

// Mock Cities Data (by state)
export const mockCitiesData = {
    1: { // Karnataka
        success: true,
        data: [
            { id: 1, name: 'Bangalore', state_id: 1 },
            { id: 2, name: 'Mysore', state_id: 1 },
            { id: 3, name: 'Mangalore', state_id: 1 },
            { id: 4, name: 'Hubli', state_id: 1 },
        ],
    },
    2: { // Maharashtra
        success: true,
        data: [
            { id: 5, name: 'Mumbai', state_id: 2 },
            { id: 6, name: 'Pune', state_id: 2 },
            { id: 7, name: 'Nagpur', state_id: 2 },
            { id: 8, name: 'Nashik', state_id: 2 },
        ],
    },
    3: { // Tamil Nadu
        success: true,
        data: [
            { id: 9, name: 'Chennai', state_id: 3 },
            { id: 10, name: 'Coimbatore', state_id: 3 },
            { id: 11, name: 'Madurai', state_id: 3 },
            { id: 12, name: 'Salem', state_id: 3 },
        ],
    },
};

// Mock Categories Data
export const mockCategoriesData = {
    success: true,
    data: [
        { id: 1, name: 'Plumbing', icon: '🔧', description: 'All plumbing services' },
        { id: 2, name: 'Electrical', icon: '⚡', description: 'Electrical repairs and installations' },
        { id: 3, name: 'Carpentry', icon: '🪚', description: 'Wood work and furniture' },
        { id: 4, name: 'Painting', icon: '🎨', description: 'Interior and exterior painting' },
        { id: 5, name: 'AC Repair', icon: '❄️', description: 'AC installation and servicing' },
        { id: 6, name: 'Home Cleaning', icon: '🧹', description: 'Deep cleaning services' },
        { id: 7, name: 'Pest Control', icon: '🐛', description: 'Pest control services' },
        { id: 8, name: 'Appliance Repair', icon: '🔨', description: 'Home appliance repairs' },
    ],
};

// Mock Wallet Data
export const mockWalletData = {
    success: true,
    data: {
        balance: 15000,
        currency: 'INR',
        transactions: [
            {
                id: 1,
                type: 'credit',
                amount: 0,
                description: 'Payment for Order #HD12347',
                date: '2026-01-17 19:48:47',
                createdAt: '2026-01-17 19:48:47',
                status: 'completed',
                razorOrderId: 'order_S4ya20gG1ythwO',
                razorPaymentId: '',
            },
            {
                id: 2,
                type: 'credit',
                amount: 0,
                description: 'Payment for Order #HD12346',
                date: '2026-01-17 19:48:46',
                createdAt: '2026-01-17 19:48:46',
                status: 'completed',
                razorOrderId: 'order_S4ya1E0OSQM3SA',
                razorPaymentId: '',
            },
            {
                id: 3,
                type: 'debit',
                amount: 0,
                description: 'Withdrawal to bank',
                date: '2026-01-17 19:48:45',
                createdAt: '2026-01-17 19:48:45',
                status: 'completed',
                razorOrderId: 'order_S4ya085ZR4VEqC',
                razorPaymentId: '',
            },
            {
                id: 4,
                type: 'credit',
                amount: 0,
                description: 'Payment for Order #HD12345',
                date: '2026-01-17 19:48:45',
                createdAt: '2026-01-17 19:48:45',
                status: 'completed',
                razorOrderId: 'order_S4yZzQX2Fjt6qS',
                razorPaymentId: '',
            },
        ],
    },
};

// Mock OTP Response
export const mockOtpResponse = {
    success: true,
    message: 'OTP sent successfully',
    data: {
        otp: '1234', // For testing purposes only
    },
};

// Mock OTP Verification Response
export const mockOtpVerificationResponse = {
    success: true,
    message: 'OTP verified successfully',
    data: mockUserData,
};

// Mock Registration Response
export const mockRegistrationResponse = {
    success: true,
    message: 'Registration successful',
    data: mockUserData,
};

// Mock Business Details Upload Response
export const mockBusinessDetailsResponse = {
    success: true,
    message: 'Business details uploaded successfully',
    data: {
        vendor_id: '1',
        business_verified: false,
    },
};

// Mock Bank Details Upload Response
export const mockBankDetailsResponse = {
    success: true,
    message: 'Bank details uploaded successfully',
    data: {
        vendor_id: '1',
        bank_verified: false,
    },
};

// Mock Commission Data
export const mockCommissionData = {
    success: true,
    data: {
        summary: {
            total_commission_paid: 12500,
            total_earnings: 112500,
            pending_commission: 2800,
        },
        transactions: [
            {
                id: 1,
                order_number: 'HD12345',
                service_name: 'AC Repair',
                customer_name: 'Rahul Sharma',
                date: '21 Jan 2026',
                service_amount: 1500,
                commission_percentage: 10,
                commission_amount: 150,
                your_earning: 1350,
                status: 'paid',
            },
            {
                id: 2,
                order_number: 'HD12346',
                service_name: 'Plumbing',
                customer_name: 'Priya Patel',
                date: '20 Jan 2026',
                service_amount: 850,
                commission_percentage: 10,
                commission_amount: 85,
                your_earning: 765,
                status: 'paid',
            },
            {
                id: 3,
                order_number: 'HD12347',
                service_name: 'Electrical Work',
                customer_name: 'Amit Kumar',
                date: '19 Jan 2026',
                service_amount: 2200,
                commission_percentage: 10,
                commission_amount: 220,
                your_earning: 1980,
                status: 'paid',
            },
            {
                id: 4,
                order_number: 'HD12348',
                service_name: 'Home Cleaning',
                customer_name: 'Sneha Reddy',
                date: '22 Jan 2026',
                service_amount: 800,
                commission_percentage: 10,
                commission_amount: 80,
                your_earning: 720,
                status: 'pending',
            },
            {
                id: 5,
                order_number: 'HD12349',
                service_name: 'Painting',
                customer_name: 'Vikram Singh',
                date: '18 Jan 2026',
                service_amount: 5500,
                commission_percentage: 10,
                commission_amount: 550,
                your_earning: 4950,
                status: 'paid',
            },
        ],
    },
};

export default {
    mockUserData,
    mockDashboardData,
    mockOrdersData,
    mockReviewsData,
    mockStatesData,
    mockCitiesData,
    mockCategoriesData,
    mockWalletData,
    mockOtpResponse,
    mockOtpVerificationResponse,
    mockRegistrationResponse,
    mockBusinessDetailsResponse,
    mockBankDetailsResponse,
    mockCommissionData,
};
