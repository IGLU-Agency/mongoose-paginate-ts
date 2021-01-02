"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoosePagination = exports.PaginationModel = void 0;
class PaginationModel {
    constructor() {
        this.limit = 0;
        this.hasPrevPage = false;
        this.hasNextPage = false;
        this.hasMore = false;
        this.docs = [];
    }
}
exports.PaginationModel = PaginationModel;
function mongoosePagination(schema) {
    schema.statics.paginate = function paginate(options, callback) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            //MARK: INIT
            let key = options.key || "_id";
            let query = options.query || {};
            let populate = (_a = options.populate) !== null && _a !== void 0 ? _a : false;
            let select = (_b = options.select) !== null && _b !== void 0 ? _b : "";
            let sort = (_c = options.sort) !== null && _c !== void 0 ? _c : {};
            let projection = (_d = options.projection) !== null && _d !== void 0 ? _d : {};
            let forceCountFunction = (_e = options.forceCountFunction) !== null && _e !== void 0 ? _e : false;
            let startingAfter = (_f = options.startingAfter) !== null && _f !== void 0 ? _f : undefined;
            let endingBefore = (_g = options.endingBefore) !== null && _g !== void 0 ? _g : undefined;
            //MARK: PAGING
            const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0;
            let page = 1;
            let skip = 0;
            if (options.hasOwnProperty("page")) {
                page = parseInt(options.page, 10);
                skip = (page - 1) * limit;
            }
            let useCursor = false;
            if (startingAfter != undefined || endingBefore != undefined) {
                useCursor = true;
                query[key] = {};
                if (endingBefore != undefined) {
                    query[key] = { $lt: endingBefore };
                }
                else {
                    query[key] = { $gt: startingAfter };
                }
            }
            //MARK: COUNTING
            let countPromise;
            if (forceCountFunction == true) {
                countPromise = this.count(query).exec();
            }
            else {
                countPromise = this.countDocuments(query).exec();
            }
            //MARK: QUERY
            let docsPromise = [];
            const mQuery = this.find(query, projection);
            mQuery.select(select);
            mQuery.sort(sort);
            mQuery.lean({ virtuals: true });
            if (populate) {
                mQuery.populate(populate);
            }
            if (limit > 0) {
                if (useCursor) {
                    mQuery.limit(limit + 1);
                }
                else {
                    mQuery.skip(skip);
                    mQuery.limit(limit);
                }
            }
            docsPromise = mQuery.exec();
            //MARK: PERFORM
            try {
                let values = yield Promise.all([countPromise, docsPromise]);
                const [count, docs] = values;
                const meta = new PaginationModel();
                meta.totalDocs = count;
                if (!useCursor) {
                    const pages = limit > 0 ? Math.ceil(count / limit) || 1 : 0;
                    meta.limit = count;
                    meta.totalPages = 1;
                    meta.page = page;
                    meta.pagingCounter = (page - 1) * limit + 1;
                    meta.hasPrevPage = false;
                    meta.hasNextPage = false;
                    meta.prevPage = undefined;
                    meta.nextPage = undefined;
                    if (limit > 0) {
                        meta.limit = limit;
                        meta.totalPages = pages;
                        // Set prev page
                        if (page > 1) {
                            meta.hasPrevPage = true;
                            meta.prevPage = page - 1;
                        }
                        else if (page == 1) {
                            meta.prevPage = undefined;
                        }
                        else {
                            meta.prevPage = undefined;
                        }
                        // Set next page
                        if (page < pages) {
                            meta.hasNextPage = true;
                            meta.nextPage = page + 1;
                        }
                        else {
                            meta.nextPage = undefined;
                        }
                    }
                    if (limit == 0) {
                        meta.limit = 0;
                        meta.totalPages = undefined;
                        meta.page = undefined;
                        meta.pagingCounter = undefined;
                        meta.prevPage = undefined;
                        meta.nextPage = undefined;
                        meta.hasPrevPage = false;
                        meta.hasNextPage = false;
                    }
                }
                else {
                    meta.limit = undefined;
                    meta.totalPages = undefined;
                    meta.page = undefined;
                    meta.pagingCounter = undefined;
                    meta.hasPrevPage = undefined;
                    meta.hasNextPage = undefined;
                    const hasMore = docs.length === limit + 1;
                    if (hasMore) {
                        docs.pop();
                    }
                    meta.hasMore = hasMore;
                    meta.prevPage = undefined;
                    meta.nextPage = undefined;
                }
                meta.docs = docs;
                if (callback != undefined) {
                    callback(null, meta);
                }
                return meta;
            }
            catch (error) {
                if (callback != undefined) {
                    callback(error);
                }
                return undefined;
            }
        });
    };
}
exports.mongoosePagination = mongoosePagination;
