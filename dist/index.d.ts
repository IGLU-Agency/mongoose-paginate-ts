import * as mongoose from "mongoose";
import { Schema, Model } from "mongoose";
export declare class PaginationModel {
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
    docs: any[];
}
export interface Pagination<T extends mongoose.Document> extends Model<T> {
    paginate(options?: any | undefined, callback?: Function | undefined): Promise<PaginationModel | undefined>;
}
export declare function mongoosePagination(schema: Schema): void;
