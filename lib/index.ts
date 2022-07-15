import * as mongoose from "mongoose"
import { Schema, Model } from "mongoose"

export class PaginationModel<T> {
  totalDocs: number | undefined
  limit: number | undefined = 0
  totalPages: number | undefined
  page: number | undefined
  pagingCounter: number | undefined
  hasPrevPage: Boolean | undefined = false
  hasNextPage: Boolean | undefined = false
  prevPage: number | undefined
  nextPage: number | undefined
  /**
   * @deprecated
   */
  hasMore: Boolean | undefined = false // EQUAL TO HAS NEXT PAGE
  docs: T[] = []
}

export interface PaginationOptions {
  key?: string | undefined
  query?: any | undefined
  aggregate?: any | undefined
  populate?: any | undefined
  select?: any | undefined
  sort?: any | undefined
  projection?: any | undefined
  forceCountFunction?: boolean | undefined
  lean?: boolean | undefined
  startingAfter?: any | undefined
  endingBefore?: any | undefined
  limit?: any | undefined
  page?: any | undefined
}

export interface Pagination<T> extends Model<T> {
  paginate(
    options?: PaginationOptions | undefined,
    onError?: Function | undefined
  ): Promise<PaginationModel<T> | undefined>
}

export function mongoosePagination<T>(schema: Schema<T>) {
  schema.statics.paginate = async function paginate(
    options: PaginationOptions | undefined,
    onError: Function | undefined
  ): Promise<PaginationModel<T> | undefined> {
    //MARK: INIT
    let key = options?.key ?? "_id"
    let query = options?.query ?? {}
    let aggregate = options?.aggregate ?? undefined
    let populate = options?.populate ?? undefined
    let select = options?.select ?? undefined
    let sort = options?.sort ?? undefined
    let projection = options?.projection ?? {}
    let forceCountFunction = options?.forceCountFunction ?? false
    let lean = options?.lean ?? true
    let startingAfter = options?.startingAfter ?? undefined
    let endingBefore = options?.endingBefore ?? undefined
    //MARK: PAGING
    const limit = parseInt(options?.limit, 10) > 0 ? parseInt(options?.limit, 10) : 0
    let page = 1
    let skip = 0
    if (options?.page != undefined) {
      page = parseInt(options?.page, 10)
      skip = (page - 1) * limit
    }
    let useCursor = false
    if (query != undefined && (startingAfter != undefined || endingBefore != undefined)) {
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
    if (aggregate != undefined) {
      countPromise = this.aggregate(aggregate).count("count")
    } else {
      if (forceCountFunction == true) {
        countPromise = this.count(query).exec()
      } else {
        countPromise = this.countDocuments(query).exec()
      }
    }
    //MARK: QUERY
    let docsPromise = []

    if (aggregate != undefined) {
      var mQuery: mongoose.Aggregate<T> | any = this.aggregate(aggregate)
      if (select != undefined) {
        mQuery = mQuery.project(select)
      }
    } else {
      var mQuery = this.find(query, projection)
      if (select != undefined) {
        mQuery = mQuery.select(select)
      }
      if (lean) {
        mQuery = mQuery.lean()
      }
      if (populate != undefined) {
        mQuery = mQuery.populate(populate)
      }
    }

    if (sort != undefined) {
      mQuery = mQuery.sort(sort)
    }

    if (limit > 0) {
      if (useCursor) {
        mQuery = mQuery.limit(limit + 1)
      } else {
        mQuery = mQuery.skip(skip)
        mQuery = mQuery.limit(limit)
      }
    }
    docsPromise = mQuery.exec()
    //MARK: PERFORM
    try {
      let values = await Promise.all([countPromise, docsPromise])
      const [counts, docs] = values
      var count = 0
      if (aggregate != undefined) {
        if (counts != undefined && counts[0] != undefined && counts[0]["count"] != undefined) {
          count = counts[0]["count"]
        }
      } else {
        count = counts
      }
      const meta = new PaginationModel<T>()
      meta.totalDocs = count
      if (!useCursor) {
        const pages = limit > 0 ? Math.ceil(count / limit) ?? 1 : 0
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
        meta.hasMore = meta.hasNextPage
      } else {
        meta.limit = undefined
        meta.totalPages = undefined
        meta.page = undefined
        meta.pagingCounter = undefined
        meta.hasPrevPage = undefined
        const hasMore = docs.length === limit + 1
        if (hasMore) {
          docs.pop()
        }
        meta.hasMore = hasMore
        meta.hasNextPage = hasMore
        meta.prevPage = undefined
        meta.nextPage = undefined
      }
      meta.docs = docs
      return meta
    } catch (error) {
      if (onError != undefined) {
        onError(error)
      }
      return undefined
    }
  }
}
