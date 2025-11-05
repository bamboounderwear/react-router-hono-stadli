import { ColumnBuilder, materializeColumn } from "./index.js";

function createColumn(name, columnType, config) {
        return new ColumnBuilder(name, columnType, config);
}

export function integer(name, config = {}) {
        return createColumn(name, "integer", { ...config });
}

export function text(name, config = {}) {
        return createColumn(name, "text", { ...config });
}

export function uniqueIndex(name) {
        return {
                name,
                on(...columns) {
                        return {
                                type: "unique",
                                name,
                                columns
                        };
                }
        };
}

export function sqliteTable(name, columns, indexesFactory) {
        const table = {};
        Object.entries(columns).forEach(([key, builder]) => {
                        table[key] = materializeColumn(builder);
        });
        if (typeof indexesFactory === "function") {
                const indexes = indexesFactory(table) || {};
                table.indexes = indexes;
        }
        table.tableName = name;
        return table;
}
