/* eslint-disable @typescript-eslint/no-explicit-any */

// Type declarations for the JavaScript API service module
export function getUsers(): Promise<any[]>;
export function getSupportMessages(): Promise<any[]>;
export function getAdminTransactions(): Promise<any[]>;
export function getAdminWithdrawals(): Promise<any[]>;
export function updateWithdrawalStatus(withdrawalId: string, status: string): Promise<any>;
export function sendAdminSupportMessage(userId: string, message: string): Promise<any>;
export function createTransaction(transaction: any): Promise<any>;
export function updateProfile(userId: string, data: any): Promise<any>;
export function login(credentials: { email: string; password: string }): Promise<any>;
export function register(data: any): Promise<any>;
export function getCurrentUser(): Promise<any>;
export function updateUser(data: any): Promise<any>;
