import { Schema } from "mongoose";
import mongoose, { Model } from "mongoose";
export interface Pagination<T extends mongoose.Document> extends Model<T> {
    paginate(options?: any | undefined, callback?: Function | undefined): void;
}
export declare function mongoosePagination(schema: Schema): void;
