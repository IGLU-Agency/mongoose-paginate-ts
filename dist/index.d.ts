import { Schema, Model } from "mongoose";
export declare class PaginationModel<T> {
    totalDocs: number | undefined;
    limit: number | undefined;
    totalPages: number | undefined;
    page: number | undefined;
    pagingCounter: number | undefined;
    hasPrevPage: Boolean | undefined;
    hasNextPage: Boolean | undefined;
    prevPage: number | undefined;
    nextPage: number | undefined;
    /**
     * @deprecated
     */
    hasMore: Boolean | undefined;
    docs: T[];
}
export interface PaginationOptions {
    key?: string | undefined;
    query?: any | undefined;
    aggregate?: any | undefined;
    populate?: any | undefined;
    select?: any | undefined;
    sort?: any | undefined;
    projection?: any | undefined;
    forceCountFunction?: boolean | undefined;
    lean?: boolean | undefined;
    leanOptions?: any | undefined;
    startingAfter?: any | undefined;
    endingBefore?: any | undefined;
    limit?: any | undefined;
    page?: any | undefined;
}
export interface Pagination<T> extends Model<T> {
    paginate(options?: PaginationOptions | undefined, onError?: Function | undefined): Promise<PaginationModel<T> | undefined>;
}
export declare function mongoosePagination<T>(schema: Schema<T>): void;
