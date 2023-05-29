import { SqlValue } from "sql.js";

export const parseOfflineDBResult = (data: { columns: string[], values: SqlValue[][] }[]) => {
    return data.map(d => {
        const {columns, values} = d;
        return values.map(v => Object.fromEntries(columns.map((c,cidx) => [c, v[cidx]])))
    })
}