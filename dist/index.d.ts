import * as mongoose from "mongoose";
import { Schema, Model } from "mongoose";
export declare class PaginationModel<T extends mongoose.Document> {
    totalDocs: number | undefined;
    limit: number | undefined;
    totalPages: number | undefined;
    page: number | undefined;
    pagingCounter: number | undefined;
    hasPrevPage: Boolean | undefined;
    hasNextPage: Boolean | undefined;
    prevPage: number | undefined;
    nextPage: number | undefined;
    hasMore: Boolean | undefined;
    docs: T[];
}
export interface Pagination<T extends mongoose.Document> extends Model<T> {
    paginate(options?: any | undefined, callback?: Function | undefined): Promise<PaginationModel<T> | undefined>;
}
export declare function mongoosePagination<T extends mongoose.Document>(schema: Schema): void;
