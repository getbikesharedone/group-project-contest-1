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


<!-- #### API Usage
TODO FORMATTING 
Request GET : /api/network
Response:
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
    },
    ...
]

GET : /api/network/{id}
Response:
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
        },
        ...
    ]
}



GET : /api/station/{id}
Response:
{
    "id": 5378,
    "name": "Plaza Ingeniero Manuel Becerra",
    "empty": 11,
    "free": 0,
    "safe": true,
    "open": true,
    "time": "2017-10-07T03:24:51.912671225Z",
    "lat": 28.15004,
    "lng": -15.422013
}


POST : /api/station/{id}
{
    "id": 5369,
    "empty": 0,
    "free": 0,
    "safe": false,
    "open": false,
}
Response:
{
    "id": 5369,
    "name": "Ayuntamiento de las Palmas de Gran Canaria",
    "empty": 0,
    "free": 0,
    "safe": false,
    "open": false,
    "time": "2017-10-07T04:29:28.805066403Z",
    "lat": 28.124643,
    "lng": -15.428421
}
POST : /api/station/{id}/review
{
    "stationuid": 5369,
    "user": "Bob",
    "body": "Bob likes this sunny bike rental station",
    "rating": 4
}
Response:
{
    "id": 3,
    "stationuid": 5369,
    "user": "Bob",
    "time": "2017-10-07T04:30:03.065759205Z",
    "body": "Bob likes this sunny bike rental station",
    "rating": 4
}


PUT : /api/review/{id}
{
    "id":3,
    "stationuid": 5369,
    "body": "Bob likes this sunny bike rental station less",
    "rating": 3
}
Response
{
    "id": 3,
    "stationuid": 5369,
    "user": "Bob",
    "time": "2017-10-07T04:31:03.065759205Z",
    "body": "Bob likes this sunny bike rental station less",
    "rating": 3
} -->
