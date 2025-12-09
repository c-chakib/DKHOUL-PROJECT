export interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    rating?: number;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    city?: string;
    duration?: number;
    host?: {
        _id: string;
        name: string;
        photo: string;
    };
}
