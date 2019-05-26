# map-compare

## TL;DR

```shell
# this assumes the map-compare-data directory is setup correctly!! 
# starting in directory containing your code repos
git clone git@github.com:CodeSchwert/map-compare.git
cd map-compare

# start the database container
docker-compose up -d mongodb

# build the web application image
docker-compose build map-compare-server

# run the gdal and loader scripts
# (data dir should already be populated with json files); docker-compose run --rm map-compare-server node gdalinfo_json.js
docker-compose run --rm map-compare-server node itl_loader.js

# still in map-compare/ directory
docker-compose up -d

# check containers
docker ps

# from the map-compare/ directory
cd ..
git clone git@github.com:CodeSchwert/map-compare-ui.git
cd map-compare-ui 
npm install
npm start

# this only works on MacOS
open -a "Google Chrome" http://localhost:5000
```

Follow the instructions from the [Getting Started](#Getting-Started) section if the tl;dr steps fail!

## Getting Started

Instructions for getting the map-compare back-end stack started using Docker and `docker-compose`:

*(Following the links below for detailed instructions)*

1. [Setup `map-compare-data` directory.](#1-Setup-map-compare-data-directory)

2. [Clone `map-compare` repo.](#2-Clone-map-compare-repo)

3. [Update `map-compare-server` `.env` (optional).](#3-Update-map-compare-server-env-(optional))

4. [Start MongoDB]($4-Start-MongoDB)

5. [Run `gdalinfo` and `itl_loader` scripts.](#5-Run-gdalinfo-and-itl_loader-scripts)

6. [Start Start the map-compare stack.](#6-Start-the-map-compare-stack)

7. [Start `map-compare-ui` or front-end stack.](#7-Start-map-compare-ui-or-front-end-stack)

> **Important notes will be in quote blocks like this one!!**

**Docker Versions**

The application stack has been built/tested on:

- `Docker version 18.09.2, build 6247962`
- `docker-compose version 1.23.2, build 1110ad01`

Try to use at least the same minor version to avoid any issues with Docker.

**Network Ports**

The stack will bind to the following local ports, they can be changed the appropriate `.env` or `Dockerfile` if necessary.

- `map-compare-server`: 9000
- `map-image-server`: 8080
- `map-mongodb`: 27017

### **1. Setup `map-compare-data` directory**

**Docker-compose expects the delta images folder to be on the same level as the map-compare project folder.**

```shell
repos/
  map-compare-data/
  map-compare/
  map-compare-ui/
```

> `map-compare-server` and `image-server` both expect the directory to be called `map-compare-data`. Currently, it may cause some issues if the directory has a different name.

Format for the `map-compare-data` directory

```xml
map-compare-data/
  projectname1/
    date/
      raw/
        <itlNumber>_<date>.jpg
        tif/
          <itlNumber>_<date>.tif
      redDiff/
        <itlNumber>_red-dif_<dateLatest>-<datePrevious>.jpg
        tif/
          <itlNumber>_red-dif_<dateLatest>-<datePrevious>.tif
      warp/
        <itlNumber>_warp_<dateLatest>.jpg
        tif/
          <itlNumber>_warp_<dateLatest>.tif
    date/
      ...
    date/
      ...
  projectname2/
    date/
      raw/
      redDiff/
      warp/
```

> The expected `<date>`, `<dateLatest>`, and `<datePrevious>` format is `yyyymmdd`.

> Expected `<itlNumber>` format is a string of 4 numbers with `0` to pad the string to 4 characters. e.g. `0027` for ITL number 27.

> Also note the folder/filename and file extension naming conventions! Any deviation will cause files to be missed by the loader scripts!!

> The loader script will harvest metadata from the corresponding `.tif` file from the `tif/` subdirectories. The filenames need to be exactly the same except for the file extension.

### **2. Clone `map-compare` repo**

```shell
# repos/ directory
git clone git@github.com:CodeSchwert/map-compare.git
```

### **3. Update `map-compare-server` `.env` (optional)**

```shell
cd map-compare/map-compare-server
vim .env
```

> Changing the `DELTA_DATA_FOLDER` variable will likely break the app.

> MONGO_URI is ued to set the MongoDB database name.

The `MONGO_DB` variable doesn't appear to be used anywhere ...

### **4. Start MongoDB**

```shell
# map-compare/map-compare-server/ directory
cd ..
docker-compose start mongodb
```

### **5. Run `gdalinfo` and `itl_loader` scripts**

These two scripts need to be run in order to populate the database with image metadata.

`gdalinfo.js` creates a `gdalinfo` output file for each `.tif` file in the corresponding image/jpg directory in JSON format.

`itl_loader.js` parses the gdalinfo JSON files as well as filenames and folder locations and updates the database.  

> If the file and folder naming convensions haven't been followed from [Step 1](#1-Setup-map-compare-data-directory), the app will not function correctly, or fail to populate the database completely.

```shell
# from the map-compare/ directory
# build the Docker image
docker-compose build map-compare-server

# run the gdal and loader scripts
docker-compose run --rm map-compare-server node gdalinfo_json.js
docker-compose run --rm map-compare-server node itl_loader.js
```

> The script gets the `map-compare-data` folder path from the Delta Server `.env` config file. Under the `DELTA_DATA_FOLDER` key.

### **6. Start the map-compare stack.**

```shell
# still in map-compare/ directory
docker-compose up -d

# check containers
docker ps
```

### **7. Start `map-compare-ui` or front-end stack**

We'll assume [map-compare-ui](https://github.com/CodeSchwert/map-compare-ui) React app for the frontend.

```shell
# from the map-compare/ directory
cd ..
git clone git@github.com:CodeSchwert/map-compare-ui.git
cd map-compare-ui
npm install
npm start

# this only works on MacOS
open -a "Google Chrome" http://localhost:5000
```

# Image Server 

URL signature for requesting images from the Image server:

```shell
http://localhost:8080/images/map-compare-data/RUN-31/20161123/raw/0101_20161123.jpg
```

Note the `/map-compare-data` path. The files relative path should be appended after that section.

Once the `image-server` is running, you can debug / view images from a web browser directly with the URL signature above.

# MongoDB Data Explorer

MongoDB should be exposed on `localhost:27017`. Use something like [Robo T3](https://robomongo.org/download) to explore the database independent of the web app.
