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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            //MARK: INIT
            let key = (_a = options.key) !== null && _a !== void 0 ? _a : "_id";
            let query = (_b = options.query) !== null && _b !== void 0 ? _b : {};
            let aggregate = (_c = options.aggregate) !== null && _c !== void 0 ? _c : undefined;
            let populate = (_d = options.populate) !== null && _d !== void 0 ? _d : undefined;
            let select = (_e = options.select) !== null && _e !== void 0 ? _e : undefined;
            let sort = (_f = options.sort) !== null && _f !== void 0 ? _f : undefined;
            let projection = (_g = options.projection) !== null && _g !== void 0 ? _g : {};
            let forceCountFunction = (_h = options.forceCountFunction) !== null && _h !== void 0 ? _h : false;
            let startingAfter = (_j = options.startingAfter) !== null && _j !== void 0 ? _j : undefined;
            let endingBefore = (_k = options.endingBefore) !== null && _k !== void 0 ? _k : undefined;
            //MARK: PAGING
            const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0;
            let page = 1;
            let skip = 0;
            if (options.hasOwnProperty("page")) {
                page = parseInt(options.page, 10);
                skip = (page - 1) * limit;
            }
            let useCursor = false;
            if (query != undefined && (startingAfter != undefined || endingBefore != undefined)) {
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
            if (aggregate != undefined) {
                countPromise = this.aggregate(aggregate).count("count");
            }
            else {
                if (forceCountFunction == true) {
                    countPromise = this.count(query).exec();
                }
                else {
                    countPromise = this.countDocuments(query).exec();
                }
            }
            //MARK: QUERY
            let docsPromise = [];
            if (aggregate != undefined) {
                var mQuery = this.aggregate(aggregate);
                if (select != undefined) {
                    mQuery = mQuery.project(select);
                }
            }
            else {
                var mQuery = this.find(query, projection);
                if (select != undefined) {
                    mQuery = mQuery.select(select);
                }
                mQuery = mQuery.lean();
                if (populate != undefined) {
                    mQuery = mQuery.populate(populate);
                }
            }
            if (sort != undefined) {
                mQuery = mQuery.sort(sort);
            }
            if (limit > 0) {
                if (useCursor) {
                    mQuery = mQuery.limit(limit + 1);
                }
                else {
                    mQuery = mQuery.skip(skip);
                    mQuery = mQuery.limit(limit);
                }
            }
            docsPromise = mQuery.exec();
            //MARK: PERFORM
            try {
                let values = yield Promise.all([countPromise, docsPromise]);
                const [counts, docs] = values;
                var count;
                if (aggregate != undefined) {
                    count = counts[0]["count"];
                }
                else {
                    count = counts;
                }
                const meta = new PaginationModel();
                meta.totalDocs = count;
                if (!useCursor) {
                    const pages = limit > 0 ? (_l = Math.ceil(count / limit)) !== null && _l !== void 0 ? _l : 1 : 0;
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
