// import fs from "fs";
// import _ from "lodash";
const fs = require("fs");
const _ = require("lodash");
const { pipe } = require("lodash/fp");

//lee archivo CSV
const readCSV = (path) => fs.readFileSync(path, "utf-8").trim();

//escribe archivo
const writeFile = (path, content) => fs.writeFileSync(path, content, "utf-8");

//convierte CSV en matriz
const parseCSV = (csv) => csv.split(/\r?\n/).map(row => row.split(/,\s*/));

//convierte matriz en CSV
const toCSV = (matrix) => matrix.map(row => row.join(",")).join("\n");

//hace un swap de las columnas n y m
const swap = (path, n, m, output) => {
    const csv = readCSV(path);
    const result = toCSV(parseCSV(csv).map(row => row.with(n - 1, row[m - 1]).with(m - 1, row[n - 1])));
    writeFile(output, result);
};

//transforma las filas en columnas
const rowsToColumns = (path, output) => {
    const csv = readCSV(path);
    writeFile(output, toCSV(_.zip(...parseCSV(csv))));
};

//transforma las columnas en filas
const columnsToRows = (path, output) => {
    rowsToColumns(path, output);
};

//elimina la fila n
const rowDelete = (path, n, output) => {
    const csv = readCSV(path);
    writeFile(output, toCSV(parseCSV(csv).toSpliced(n - 1, 1)));
};

//elimina la columna n
const columnDelete = (path, n, output) => {
    const csv = readCSV(path);
    writeFile(output, toCSV(parseCSV(csv).map(row => _.filter(row, (_, idx) => idx !== n - 1))));
};

//inserta una fila después de la n con la información dada en la lista row
const insertRow = (path, n, row, output) => {
    const csv = readCSV(path);
    writeFile(output, toCSV(parseCSV(csv).toSpliced(n, 0, row)));
};

//inserta una columna después de la columna n con la información dada en la lista column
const insertColumn = (path, n, column, output) => {
    const csv = readCSV(path);
    writeFile(output, toCSV(_.zipWith(parseCSV(csv), column, (row, val) => _.concat(_.slice(row, 0, n), val, _.slice(row, n)))));
};

//crea una fila HTML para usar en una tabla
const formatRow = (row) => `    <tr>\n        ${row.map(val => `<td>${val}</td>`).join("\n        ")}\n    </tr>`;

//crea una tabla HTML a partir de un array de filas HTML
const formatTable = (rows) => `<table>\n${rows.join("\n")}\n</table>`;

//genera una versión como una tabla html
const toHtmlTable = (path, output) => {
    const pipeline = pipe(
        () => readCSV(path),
        parseCSV,
        rows => rows.map(formatRow),
        formatTable
    );
    writeFile(output, pipeline());
};


swap("test.csv", 1, 3, "swap.csv");
rowsToColumns("test.csv", "rows_to_columns.csv");
columnsToRows("test.csv", "columns_to_rows.csv");
rowDelete("test.csv", 2, "row_delete.csv");
columnDelete("test.csv", 2, "column_delete.csv");
insertRow("test.csv", 1, ["Ema", "Stone", "estone@gmail.com"], "insert_row.csv");
insertColumn("test.csv", 2, ["993456780", "995674543", "995674543"], "insert_column.csv");
toHtmlTable("test.csv", "to_html.html");