interface getCollectionParams {
    dbName: string,
    termColName: string
}

interface dbAddParams {
    dbName: string,
    termColName: string,
    doc
}

interface dbReadParams {
    dbName: string,
    termColName: string,
    courseCode: string
}

interface dbUpdateParams {
    dbName: string,
    termColName: string,
    courseCode: string,
    doc
}

interface dbDelParams {
    dbName: string,
    termColName: string,
    courseCode: string
}

interface dbFetchAllParams {
    dbName: string,
    termColName: string
}

export {
    getCollectionParams,
    dbAddParams,
    dbReadParams,
    dbUpdateParams,
    dbDelParams,
    dbFetchAllParams
}