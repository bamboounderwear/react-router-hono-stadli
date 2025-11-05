export interface SqlFragment {
        text: string;
        params: unknown[];
}

export declare function sql(strings: TemplateStringsArray, ...values: unknown[]): SqlFragment;

export interface ColumnConfig {
        primaryKey?: { autoIncrement: boolean };
        notNull?: boolean;
        default?: unknown;
        references?: {
                getTarget: () => Column;
                options: Record<string, unknown>;
        };
        [key: string]: unknown;
}

export declare class Column {
        constructor(name: string, columnType: string, config: ColumnConfig);
        name: string;
        columnType: string;
        config: ColumnConfig;
}

export declare class ColumnBuilder {
        constructor(name: string, columnType: string, config?: ColumnConfig);
        primaryKey(options?: { autoIncrement?: boolean }): this;
        notNull(): this;
        default(value: unknown): this;
        references(getTarget: () => Column, options?: Record<string, unknown>): this;
        build(): Column;
}

export type OneRelation<TTarget> = {
        kind: "one";
        target: TTarget;
        fields?: unknown[];
        references?: unknown[];
};

export type ManyRelation<TTarget> = {
        kind: "many";
        target: TTarget;
        fields?: unknown[];
        references?: unknown[];
};

export interface RelationBuilder {
        one<TTarget>(target: TTarget, options?: { fields?: unknown[]; references?: unknown[] }): OneRelation<TTarget>;
        many<TTarget>(target: TTarget, options?: { fields?: unknown[]; references?: unknown[] }): ManyRelation<TTarget>;
}

export declare function relations<TTable, TRelations>(table: TTable, builder: (helpers: RelationBuilder) => TRelations): TRelations;
