import * as mongoose from "mongoose"
import { Schema, Model } from "mongoose"

export class PaginationModel<T extends mongoose.Document> {
  totalDocs: number | undefined
  limit: number | undefined = 0
  totalPages: number | undefined
  page: number | undefined
  pagingCounter: number | undefined
  hasPrevPage: Boolean | undefined = false
  hasNextPage: Boolean | undefined = false
  prevPage: number | undefined
  nextPage: number | undefined
  hasMore: Boolean | undefined = false
  docs: T[] = []
}

export interface Pagination<T extends mongoose.Document> extends Model<T> {
  paginate(options?: any | undefined, callback?: Function | undefined): Promise<PaginationModel<T> | undefined>
}
export function mongoosePagination<T extends mongoose.Document>(schema: Schema) {
  schema.statics.paginate = async function paginate(options: any | undefined, callback: Function | undefined): Promise<PaginationModel<T> | undefined> {
    //MARK: INIT
    let key = options.key || "_id"
    let query = options.query || {}
    let populate = options.populate ?? false
    let select = options.select ?? ""
    let sort = options.sort ?? {}
    let projection = options.projection ?? {}
    let forceCountFunction = options.forceCountFunction ?? false
    let startingAfter = options.startingAfter ?? undefined
    let endingBefore = options.endingBefore ?? undefined
    //MARK: PAGING
    const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0
    let page = 1
    let skip = 0
    if (options.hasOwnProperty("page")) {
      page = parseInt(options.page, 10)
      skip = (page - 1) * limit
    }
    let useCursor = false
    if (startingAfter != undefined || endingBefore != undefined) {
      useCursor = true
      query[key] = {}
      if (endingBefore != undefined) {
        query[key] = { $lt: endingBefore }
      } else {
        query[key] = { $gt: startingAfter }
      }
    }
    //MARK: COUNTING
    let countPromise
    if (forceCountFunction == true) {
      countPromise = this.count(query).exec()
    } else {
      countPromise = this.countDocuments(query).exec()
    }
    //MARK: QUERY
    let docsPromise = []
    const mQuery = this.find(query, projection)
    mQuery.select(select)
    mQuery.sort(sort)
    mQuery.lean({ virtuals: true })
    if (populate) {
      mQuery.populate(populate)
    }
    if (limit > 0) {
      if (useCursor) {
        mQuery.limit(limit + 1)
      } else {
        mQuery.skip(skip)
        mQuery.limit(limit)
      }
    }
    docsPromise = mQuery.exec()
    //MARK: PERFORM
    try {
      let values = await Promise.all([countPromise, docsPromise])
      const [count, docs] = values
      const meta = new PaginationModel<T>()
      meta.totalDocs = count
      if (!useCursor) {
        const pages = limit > 0 ? Math.ceil(count / limit) || 1 : 0
        meta.limit = count
        meta.totalPages = 1
        meta.page = page
        meta.pagingCounter = (page - 1) * limit + 1
        meta.hasPrevPage = false
        meta.hasNextPage = false
        meta.prevPage = undefined
        meta.nextPage = undefined
        if (limit > 0) {
          meta.limit = limit
          meta.totalPages = pages
          // Set prev page
          if (page > 1) {
            meta.hasPrevPage = true
            meta.prevPage = page - 1
          } else if (page == 1) {
            meta.prevPage = undefined
          } else {
            meta.prevPage = undefined
          }
          // Set next page
          if (page < pages) {
            meta.hasNextPage = true
            meta.nextPage = page + 1
          } else {
            meta.nextPage = undefined
          }
        }
        if (limit == 0) {
          meta.limit = 0
          meta.totalPages = undefined
          meta.page = undefined
          meta.pagingCounter = undefined
          meta.prevPage = undefined
          meta.nextPage = undefined
          meta.hasPrevPage = false
          meta.hasNextPage = false
        }
      } else {
        meta.limit = undefined
        meta.totalPages = undefined
        meta.page = undefined
        meta.pagingCounter = undefined
        meta.hasPrevPage = undefined
        meta.hasNextPage = undefined
        const hasMore = docs.length === limit + 1
        if (hasMore) {
          docs.pop()
        }
        meta.hasMore = hasMore
        meta.prevPage = undefined
        meta.nextPage = undefined
      }
      meta.docs = docs
      if (callback != undefined) {
        callback(null, meta)
      }
      return meta
    } catch (error) {
      if (callback != undefined) {
        callback(error)
      }
      return undefined
    }
  }
}
