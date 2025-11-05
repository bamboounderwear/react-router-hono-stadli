class SqlFragment {
        constructor(text, params) {
                this.text = text;
                this.params = params;
        }
}

export function sql(strings, ...values) {
        let text = "";
        const params = [];
        strings.forEach((part, index) => {
                text += part;
                if (index < values.length) {
                        text += "?";
                        params.push(values[index]);
                }
        });
        return new SqlFragment(text, params);
}

function createRelation(kind, target, options = {}) {
        return { kind, target, ...options };
}

export function relations(table, builder) {
        const helpers = {
                one(target, options = {}) {
                        return createRelation("one", target, options);
                },
                many(target, options = {}) {
                        return createRelation("many", target, options);
                }
        };
        return builder(helpers);
}

export class Column {
        constructor(name, columnType, config) {
                this.name = name;
                this.columnType = columnType;
                this.config = config;
        }
}

export class ColumnBuilder {
        constructor(name, columnType, config = {}) {
                this.name = name;
                this.columnType = columnType;
                this.config = { ...config };
        }

        primaryKey(options = {}) {
                        this.config.primaryKey = { autoIncrement: Boolean(options.autoIncrement) };
                        return this;
        }

        notNull() {
                this.config.notNull = true;
                return this;
        }

        default(value) {
                this.config.default = value;
                return this;
        }

        references(getTarget, options = {}) {
                this.config.references = {
                        getTarget,
                        options
                };
                return this;
        }

        build() {
                return new Column(this.name, this.columnType, { ...this.config });
        }
}

export function cloneBuilder(builder) {
        if (builder instanceof ColumnBuilder) {
                return builder;
        }
        throw new TypeError("Expected ColumnBuilder instance");
}

export function materializeColumn(builder) {
        if (builder instanceof ColumnBuilder) {
                return builder.build();
        }
        return builder;
}
