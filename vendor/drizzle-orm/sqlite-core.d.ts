import { Column, ColumnBuilder } from "./index";

export declare function integer(name: string, config?: Record<string, unknown>): ColumnBuilder;
export declare function text(name: string, config?: Record<string, unknown>): ColumnBuilder;

export interface UniqueIndex {
        type: "unique";
        name: string;
        columns: Column[];
}

export declare function uniqueIndex(name: string): {
        on: (...columns: Column[]) => UniqueIndex;
};

export declare function sqliteTable<TColumns extends Record<string, ColumnBuilder | Column>, TIndexes extends Record<string, unknown> = Record<string, unknown>>(
        name: string,
        columns: TColumns,
        indexesFactory?: (columns: { [K in keyof TColumns]: Column }) => TIndexes
): { [K in keyof TColumns]: Column } & { indexes?: TIndexes; tableName: string };
