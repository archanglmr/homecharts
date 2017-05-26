CREATE TABLE DataPoints
(
    id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    time TIME,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    valueType VARCHAR(255) NOT NULL,
    metaJson LONGTEXT NOT NULL
);
CREATE UNIQUE INDEX unique_record ON DataPoints (date, time, name, valueType);

CREATE TABLE DataSets
(
    id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    valueType VARCHAR(255),
    description LONGTEXT NOT NULL,
    metaJson LONGTEXT NOT NULL
);
CREATE UNIQUE INDEX unique_name ON DataSets (name, valueType);
