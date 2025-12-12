export interface Booking {
    _id: string;
    tourist: any; // Can be detailed further: User | string
    service: any; // Service | string
    price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
    paymentIntentId?: string;
    bookingDate?: Date;
    time?: string;
    guests: number;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}
