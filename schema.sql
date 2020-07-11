DROP TABLE IF EXISTS location;
CREATE TABLE location (
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude numeric(20,14),
    longitude numeric(20,14)
)

-- INSERT INTO location(search_query,formatted_query,latitude,longitude) VALUES ('search','format','12','55');
 