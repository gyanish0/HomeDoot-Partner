/**
 * API Test Helper
 * Use this file to test all newly integrated API endpoints
 */

import {
    getVendorPendingOrders,
    getVendorAssignedOrders,
    getVendorCompletedOrders,
    getVendorCancelledOrders,
    getVendorRatings,
    getVendorWalletCreditTransactions,
    getVendorWalletDebitTransactions,
    getVendorCommissionCurrentMonth,
    getVendorCommissionCustomRange,
} from './vendorService';

/**
 * Test all order endpoints
 */
export const testOrderEndpoints = async () => {
    console.log('🧪 Testing Order Endpoints...\n');

    try {
        // Test Pending Orders
        console.log('📋 Testing Pending Orders...');
        const pendingOrders = await getVendorPendingOrders(1, 20);
        console.log('✅ Pending Orders:', pendingOrders);

        // Test Assigned Orders
        console.log('\n📋 Testing Assigned Orders...');
        const assignedOrders = await getVendorAssignedOrders(1, 20);
        console.log('✅ Assigned Orders:', assignedOrders);

        // Test Completed Orders
        console.log('\n📋 Testing Completed Orders...');
        const completedOrders = await getVendorCompletedOrders(1, 20);
        console.log('✅ Completed Orders:', completedOrders);

        // Test Cancelled Orders
        console.log('\n📋 Testing Cancelled Orders...');
        const cancelledOrders = await getVendorCancelledOrders(1, 20);
        console.log('✅ Cancelled Orders:', cancelledOrders);

        return { success: true };
    } catch (error) {
        console.error('❌ Order Endpoints Error:', error);
        return { success: false, error };
    }
};

/**
 * Test ratings endpoint
 */
export const testRatingsEndpoint = async () => {
    console.log('\n🧪 Testing Ratings Endpoint...\n');

    try {
        console.log('⭐ Testing Vendor Ratings...');
        const ratings = await getVendorRatings(1, 20);
        console.log('✅ Ratings:', ratings);

        return { success: true };
    } catch (error) {
        console.error('❌ Ratings Endpoint Error:', error);
        return { success: false, error };
    }
};

/**
 * Test wallet transaction endpoints
 */
export const testWalletEndpoints = async () => {
    console.log('\n🧪 Testing Wallet Transaction Endpoints...\n');

    try {
        // Test Credit Transactions
        console.log('💰 Testing Credit Transactions...');
        const creditTransactions = await getVendorWalletCreditTransactions(1, 20);
        console.log('✅ Credit Transactions:', creditTransactions);

        // Test Debit Transactions
        console.log('\n💸 Testing Debit Transactions...');
        const debitTransactions = await getVendorWalletDebitTransactions(1, 20);
        console.log('✅ Debit Transactions:', debitTransactions);

        return { success: true };
    } catch (error) {
        console.error('❌ Wallet Endpoints Error:', error);
        return { success: false, error };
    }
};

/**
 * Test commission endpoints
 */
export const testCommissionEndpoints = async () => {
    console.log('\n🧪 Testing Commission Endpoints...\n');

    try {
        // Test Current Month Commission
        console.log('📊 Testing Current Month Commission...');
        const currentMonthCommission = await getVendorCommissionCurrentMonth();
        console.log('✅ Current Month Commission:', currentMonthCommission);

        // Test Custom Date Range Commission
        console.log('\n📊 Testing Custom Date Range Commission...');
        const fromDate = '2025-01-01';
        const toDate = '2025-01-31';
        const customRangeCommission = await getVendorCommissionCustomRange(fromDate, toDate);
        console.log(`✅ Commission from ${fromDate} to ${toDate}:`, customRangeCommission);

        return { success: true };
    } catch (error) {
        console.error('❌ Commission Endpoints Error:', error);
        return { success: false, error };
    }
};

/**
 * Run all API tests
 */
export const runAllTests = async () => {
    console.log('🚀 Starting All API Tests...\n');
    console.log('='.repeat(50));

    const results = {
        orders: await testOrderEndpoints(),
        ratings: await testRatingsEndpoint(),
        wallet: await testWalletEndpoints(),
        commission: await testCommissionEndpoints(),
    };

    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results Summary:');
    console.log('Orders:', results.orders.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Ratings:', results.ratings.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Wallet:', results.wallet.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Commission:', results.commission.success ? '✅ PASSED' : '❌ FAILED');
    console.log('='.repeat(50));

    return results;
};

export default {
    testOrderEndpoints,
    testRatingsEndpoint,
    testWalletEndpoints,
    testCommissionEndpoints,
    runAllTests,
};
