import * as mongoose from 'mongoose';
import { Schema, Model } from "mongoose";
export declare class PaginationModel {
    totalDocs: number | undefined;
    limit: number;
    totalPages: number | undefined;
    page: number | undefined;
    pagingCounter: number | undefined;
    hasPrevPage: Boolean;
    hasNextPage: Boolean;
    prevPage: number | undefined;
    nextPage: number | undefined;
    docs: any[];
}
export interface Pagination<T extends mongoose.Document> extends Model<T> {
    paginate(options?: any | undefined, callback?: Function | undefined): Promise<PaginationModel | undefined>;
}
export declare function mongoosePagination(schema: Schema): void;
