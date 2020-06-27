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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoosePagination = exports.PaginationModel = void 0;
var PaginationModel = /** @class */ (function () {
    function PaginationModel() {
        this.limit = 0;
        this.hasPrevPage = false;
        this.hasNextPage = false;
        this.docs = [];
    }
    return PaginationModel;
}());
exports.PaginationModel = PaginationModel;
function mongoosePagination(schema) {
    schema.statics.paginate = function paginate(options, callback) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var query, populate, select, sort, projection, forceCountFunction, limit, page, skip, countPromise, docsPromise, mQuery, values, count, docs, meta, pages, error_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        query = options.query || {};
                        populate = (_a = options.populate) !== null && _a !== void 0 ? _a : false;
                        select = (_b = options.select) !== null && _b !== void 0 ? _b : '';
                        sort = (_c = options.sort) !== null && _c !== void 0 ? _c : {};
                        projection = (_d = options.projection) !== null && _d !== void 0 ? _d : {};
                        forceCountFunction = (_e = options.forceCountFunction) !== null && _e !== void 0 ? _e : false;
                        limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0;
                        page = 1;
                        skip = 0;
                        if (options.hasOwnProperty('page')) {
                            page = parseInt(options.page, 10);
                            skip = (page - 1) * limit;
                        }
                        if (forceCountFunction == true) {
                            countPromise = this.count(query).exec();
                        }
                        else {
                            countPromise = this.countDocuments(query).exec();
                        }
                        docsPromise = [];
                        mQuery = this.find(query, projection);
                        mQuery.select(select);
                        mQuery.sort(sort);
                        mQuery.lean();
                        if (populate) {
                            mQuery.populate(populate);
                        }
                        if (limit > 0) {
                            mQuery.skip(skip);
                            mQuery.limit(limit);
                        }
                        docsPromise = mQuery.exec();
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([countPromise, docsPromise])];
                    case 2:
                        values = _f.sent();
                        count = values[0], docs = values[1];
                        meta = new PaginationModel;
                        meta.totalDocs = count;
                        pages = (limit > 0) ? (Math.ceil(count / limit) || 1) : 0;
                        meta.limit = count;
                        meta.totalPages = 1;
                        meta.page = page;
                        meta.pagingCounter = ((page - 1) * limit) + 1;
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
                                meta.prevPage = (page - 1);
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
                                meta.nextPage = (page + 1);
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
                        meta.docs = docs;
                        if (callback != undefined) {
                            callback(null, meta);
                        }
                        return [2 /*return*/, meta];
                    case 3:
                        error_1 = _f.sent();
                        if (callback != undefined) {
                            callback(error_1);
                        }
                        return [2 /*return*/, undefined];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
}
exports.mongoosePagination = mongoosePagination;
