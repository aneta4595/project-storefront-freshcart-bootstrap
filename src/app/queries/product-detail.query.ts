export interface ProductDetailQuery {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly categoryId: string;
    readonly categoryName: string;
    readonly ratingValue: number;
    readonly ratingCount: number;
    readonly imageUrl: string;
    readonly featureValue: number;
    readonly storeIds: string[];
    readonly ratingOptions: number[]
    readonly relatedProducts: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        ratingOptions: number[];
        ratingValue: number;
        ratingCount: number
    }[];
}[]
