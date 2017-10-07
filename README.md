# Seagulltuna

This is a web app designed and built for [The Fullstack Network](https://fullstack.network) community project 1. Seeding data is courtesy of [citybik.es](https://citybik.es). The project specification and other projects can be found [here](https://github.com/fullstack-network/group-project-contest-1)

# ![Seagulltuna](https://seagulltuna.neuralspaz.com/demo.jpg)

## Demo
Here is a live demo :  https://seagulltuna.neuralspaz.com

### Development
You will require golang and sqlite lib (see links bellow for detailed install instructions) to compile the server.

Once you have them installed run.
- fork or and or clone the repo. Alternatively you can run `go get github.com/getbikesharedone/seagulltuna`
- change into the directory `cd $GOPATH/src/getbikesharedone/seagulltuna`
- complie the server `go build .`
- run the server `./seagulltuna `
- open a browser and goto `http://localhost:9090`

### Bug

If you find a bug (the website couldn't handle the query and / or gave undesired results), kindly open an issue.


## Built with 

- [Golang](https://golang.org)
- [VueJS](https://vuejs.org)
- [SemanticUI](https://semantic-ui.com)
- [Google Maps](https://developers.google.com/maps/documentation/javascript/)
- [sqlite3](https://www.sqlite.org)


## Team

[![NeuralSpaz](https://avatars.githubusercontent.com/neuralspaz?v=4&s=200)](https://github.com/NeuralSpaz)  | [![ef](https://avatars.githubusercontent.com/eugenefedoto?v=4&s=200)](https://github.com/eugenefedoto)
---|---
[NeuralSpaz ](https://github.com/NeuralSpaz) |[ef](https://github.com/eugenefedoto)

## [License](https://github.com/getbikesharedone/seagulltuna/blob/master/LICENSE)


# API Usage
**List Networks**
----
  Returns an array of bike networks.

* **URL**

  /api/network

* **Method:**

  `GET`
  
* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json
    [
        {
            "id": 1,
            "company": "Bike U Sp. z o.o.",
            "name": "BBBike",
            "city": "Bielsko-Biała",
            "country": "PL",
            "lat": 49.8225,
            "lng": 19.044444,
            "hspan": 3180,
            "vspan": 5065,
            "clat": 49.807528,
            "clng": 19.035092
        },
        {
            "id": 2,
            "company": "PBSC",
            "name": "Bixi",
            "city": "Montreal, QC",
            "country": "CA",
            "lat": 45.5086699,
            "lng": -73.55399249999999,
            "hspan": 13681,
            "vspan": 16903,
            "clat": 45.5067486901045,
            "clng": -73.58285039663349
        }
    ]
    ```
 
* **Error Response:**

  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "retrieving network list failed" }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/network",
      dataType: "json",
      type : "GET",
      success : function(list) {
        console.log(list);
      }
    });
  ```
* **Notes:**<br>
    **clat** is the geogpahical center latitude of the networks stations <br>
    **clng** is the geographical center longitude of the network stations <br>
    **vspan** is the geographical vertical extent in network stations in meters <br>
    **hspan** is the geographical horizontal extent in network stations in meters <br>

<br>
<br>
<br>

**Network Detail**
----
  Returns an detailed information on specific bike networks.

* **URL**

  /api/network/:id

* **Method:**

  `GET`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json
    {
        "id": 170,
        "company": "Domoblue",
        "name": "Onroll",
        "city": "Las Palmas de Gran Canaria",
        "country": "ES",
        "lat": 28.124302,
        "lng": -15.425994,
        "hspan": 3541,
        "vspan": 6552,
        "clat": 28.120575000000002,
        "clng": -15.4308645,
        "stations": [
            {
                "id": 5368,
                "name": "Ciudad Deportiva de Gran Canaria",
                "empty": 0,
                "free": 0,
                "safe": false,
                "open": false,
                "time": "2017-10-07T04:23:54.788319051Z",
                "lat": 28.09111,
                "lng": -15.41478
            },
            {
                "id": 5369,
                "name": "Ayuntamiento de las Palmas de Gran Canaria",
                "empty": 11,
                "free": 0,
                "safe": true,
                "open": true,
                "time": "2017-10-07T03:24:51.911947478Z",
                "lat": 28.124643,
                "lng": -15.428421
            }
        ]
    }
    ```
 
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad network id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "network does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "retrieving network failed" }`
* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/network/1",
      dataType: "json",
      type : "GET",
      success : function(net) {
        console.log(net);
      }
    });
  ```
* **Notes:**<br>

<br>
<br>
<br>

**Station Detail**
----
  Returns an detailed information on specific station.

* **URL**

  /api/station/:id

* **Method:**

  `GET`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json 
    {
        "id": 5368,
        "name": "Ciudad Deportiva de Gran Canaria",
        "empty": 0,
        "free": 0,
        "safe": false,
        "open": false,
        "time": "2017-10-07T04:23:54.788319051Z",
        "lat": 28.09111,
        "lng": -15.41478,
        "reviews": [
            {
                "id": 1,
                "stationuid": 0,
                "user": "bob",
                "time": "2017-10-07T03:39:52.55360974Z",
                "body": "bob likes",
                "rating": 4
            }
        ]
    }
    ```  
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad station id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "station does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "retrieving station failed" }`
* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/station/25",
      dataType: "json",
      type : "GET",
      success : function(station) {
        console.log(station);
      }
    });
  ```
* **Notes:**<br>

<br>
<br>
<br>

**Update Station**
----
  Updates a specific station.

* **URL**

  /api/station/:id

* **Method:**

  `POST`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

    ```json
        {
            "id": 5368,
            "empty": 0,
            "free": 0,
            "safe": false,
            "open": false
        }
    ```

* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json 
    {
        "id": 5368,
        "name": "Ciudad Deportiva de Gran Canaria",
        "empty": 0,
        "free": 0,
        "safe": false,
        "open": false,
        "time": "2017-10-07T04:23:54.788319051Z",
        "lat": 28.09111,
        "lng": -15.41478,
        "reviews": [
            {
                "id": 1,
                "stationuid": 0,
                "user": "bob",
                "time": "2017-10-07T03:39:52.55360974Z",
                "body": "bob likes",
                "rating": 4
            }
        ]
    }
    ```  
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad station id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "station does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "retrieving station failed" }`
* **Sample Call:**

  ```javascript
    var stationInfo = {
        id: 25,
        empty: 6,
        free: 28,
        safe: true,
        open: true
    };
    $.ajax({
      url: "/api/station/25",
      type : "POST",
      dataType: "json",
      data: JSON.stringify(stationInfo),
      contentType: "application/json; charset=utf-8",
      success : function(station) {
        console.log(station);
      }
    });
  ```
* **Notes:**<br>

<br>
<br>
<br>

**Review**
----
  Returns an detailed information on specific review.

* **URL**

  /api/review/:id

* **Method:**

  `GET`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json 
    {
        "id": 3,
        "stationuid": 5369,
        "user": "Bob",
        "time": "2017-10-07T04:30:03.065759205Z",
        "body": "Bob likes this sunny bike rental station",
        "rating": 4
    }
    ```  
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad review id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "review does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "retrieving review failed" }`
* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/review/3",
      dataType: "json",
      type : "GET",
      success : function(review) {
        console.log(review);
      }
    });
  ```
* **Notes:**<br>

<br>
<br>
<br>

**Create Review**
----
  Creates a review for a specific station.

* **URL**

  /api/station/:id/review

* **Method:**

  `POST`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

    ```json
    {
        "user": "Bob",
        "body": "Bob likes this sunny bike rental station",
        "rating": 4
    }
    ```

* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json 
    {
        "id": 3,
        "stationuid": 5369,
        "user": "Bob",
        "time": "2017-10-07T04:30:03.065759205Z",
        "body": "Bob likes this sunny bike rental station",
        "rating": 4
    }
    ```  
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad station id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "station does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "create review failed" }`
* **Sample Call:**

  ```javascript
    var newReview = {
        user: "Bob",
        body: "Bob likes this sunny bike rental station",
        rating: 4
    };
    $.ajax({
      url: "/api/station/5369/review",
      type : "POST",
      dataType: "json",
      data: JSON.stringify(newReview),
      contentType: "application/json; charset=utf-8",
      success : function(review) {
        console.log(review);
      }
    });
  ```
* **Notes:**<br>

<br>
<br>
<br>

**Edit Review**
----
  Edit a specific review.

* **URL**

  /api/review/:id

* **Method:**

  `PUT`

*  **URL Params**

   **Required:**
 
   `id=[integer]`

* **Data Params**

    ```json
    {
        "body": "Bob likes this sunny bike rental station less now",
        "rating": 3
    }
    ```
* **Success Response:**

  * **Code:** 200 <br>
    **Content-type** `json` <br>
    **Content:** <br>
    ```json 
    {
        "id": 3,
        "stationuid": 5369,
        "user": "Bob",
        "time": "2017-10-07T04:31:03.063826745Z",
        "body": "Bob likes this sunny bike rental station less now",
        "rating": 3
    }
    ```  
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br>
    **Content:** `{ "error" : "bad review id in request url" }`
  * **Code:** 404 NOT FOUND <br>
    **Content:** `{ "error" : "review does not exist" }`
  * **Code:** 500 INTERNAL SERVER ERROR <br>
    **Content:** `{ "error" : "edit review failed" }`
* **Sample Call:**

  ```javascript
    var editReview = {
        body: "Bob likes this sunny bike rental station even less now",
        rating: 2
    };
    $.ajax({
      url: "/api/review/3",
      type : "PUT",
      dataType: "json",
      data: JSON.stringify(editReview),
      contentType: "application/json; charset=utf-8",
      success : function(review) {
        console.log(review);
      }
    });
  ```
* **Notes:**<br>
cannot change user.

<br>
<br>
<br>
