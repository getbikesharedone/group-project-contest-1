// +build go1.8

package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/kataras/iris"
	irisctx "github.com/kataras/iris/context"
	_ "github.com/mattn/go-sqlite3"
)

var db *sqlx.DB

func main() {
	log.Println("starting seagull")
	var err error
	var reBuildDB = flag.Bool("rebuild", false, "rebuild database")
	var devMode = flag.Bool("dev", false, "use the www directory for serving content")
	var listen = flag.String("listen", ":9090", "host:port to listen on")
	flag.Parse()

	if _, err := os.Stat("bsn.db"); os.IsNotExist(err) {
		fmt.Println("no database")
		*reBuildDB = true
	}

	if *reBuildDB {
		if err := buildDatabase(); err != nil {
			log.Fatalf("build database error: %v", err)
		}
		if err := buildNetworkExtents(); err != nil {
			log.Fatalf("build database extents: %v", err)
		}
	}

	if db, err = sqlx.Open("sqlite3", "bsn.db"); err != nil {
		log.Fatalf("database error: %v", err)
	}

	srv := newSrv(*devMode)

	if err := srv.Run(iris.Addr(*listen), iris.WithoutVersionChecker); err != nil {
		log.Fatalf("failed to start http server: %v\n", err)
	}
}

func newSrv(devmode bool) *iris.Application {
	srv := iris.New()
	srv.Use()
	// build assest with go-bindata www/...
	// in bindata.go add line to var _bindata:
	//        "www/":wwwIndexHtml,
	// this set the naked request to return index.html
	//
	if devmode {
		srv.StaticWeb("/", "www/")
	} else {
		srv.StaticEmbedded("/", "www/", Asset, AssetNames)
	}
	srv.Get("/api/network/{id:int}", getDetail)
	srv.Get("/api/network", getNetworkList)
	srv.Get("/api/review/{id:int}", getReview)
	srv.Put("/api/review/{id:int}", editReview)
	srv.Get("/api/station/{id:int}", getStation)
	srv.Post("/api/station/{id:int}", updateStation)
	srv.Post("/api/station/{id:int}/review", reviewStation)
	return srv
}

func getStation(ctx irisctx.Context) {
	defer timeLog(time.Now(), "getStation")
	idStr := ctx.Params().Get("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("bad id: %v does not exist: %v\n", idStr, err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad station id in requests url")
		return
	}
	var stations Station
	if err := db.Get(&stations, "SELECT StationID, Name, Latitude, Longitude, EmptySlots, FreeBikes, Safe, Open, TimeStamp FROM stations where StationID=$1", id); err != nil {
		log.Printf("station not found: %v\n", err)
		ctx.StatusCode(iris.StatusNotFound)
		ctx.WriteString("station with id " + idStr + " does not exist")
		return
	}

	var reviews = []Review{}
	if err := db.Select(&reviews, "SELECT ReviewID, User, Body, Rating, TimeStamp FROM reviews where StationID=$1", stations.StationID); err != nil {
		log.Printf("error retriving reviews for station %v :%v\n", stations.StationID, err)
	}
	if len(reviews) != 0 {
		stations.Reviews = append(stations.Reviews, reviews...)
	}

	ctx.Gzip(true)
	ctx.JSON(stations)

}

func getReview(ctx irisctx.Context) {
	defer timeLog(time.Now(), "getReview")
	idStr := ctx.Params().Get("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("bad id: %v does not exist: %v\n", idStr, err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad review id in requests url")
		return
	}

	var review Review
	err = db.Get(&review, "SELECT ReviewID, User, StationID, TimeStamp, Body, Rating, FROM reviews where ReviewID=$1", id)
	if err != nil {
		log.Println(err)
		ctx.NotFound()
		return
	}

	ctx.Gzip(true)
	ctx.JSON(review)

}

func editReview(ctx irisctx.Context) {
	defer timeLog(time.Now(), "editReview")
	idStr := ctx.Params().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("bad id: %v does not exist: %v\n", idStr, err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad review id in requests url")
		return
	}

	var review Review
	if err := ctx.ReadJSON(&review); err != nil {
		log.Printf("error parsing json: %v\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}
	if review.ReviewID == 0 {
		review.ReviewID = id
	}

	if len(review.Body) > 250 {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("body greater than 250 characters")
		return
	}

	var existing Review
	if err := db.Get(&existing, "Select ReviewID from reviews WHERE ReviewID=$1", review.ReviewID); err != nil {
		log.Printf("review id: %d does not exist: %v\n", review.ReviewID, err)
		ctx.StatusCode(iris.StatusNotFound)
		ctx.WriteString("review does not exist")
		return
	}
	review.TimeStamp = time.Now().UTC()
	tx := db.MustBegin()
	tx.MustExec("UPDATE reviews SET Body=$1, Rating=$2, TimeStamp=$3 WHERE ReviewID=$4",
		review.Body,
		review.Rating,
		review.TimeStamp,
		review.ReviewID)
	if err := tx.Commit(); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}
	var updated Review
	if err := db.Get(&updated, "Select ReviewID, StationID, User, Body, Rating, TimeStamp from reviews WHERE ReviewID=$1", review.ReviewID); err != nil {
		log.Printf("review id: %d does not exist: %v\n", review.ReviewID, err)
		ctx.StatusCode(iris.StatusNotFound)
		ctx.WriteString("review does not exist")
		return
	}
	ctx.Gzip(true)
	ctx.JSON(updated)
}

func updateStation(ctx irisctx.Context) {
	defer timeLog(time.Now(), "updateStation")
	idStr := ctx.Params().Get("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("bad id: %v does not exist: %v\n", idStr, err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad station id in requests url")
		return
	}

	var s Station
	if err := ctx.ReadJSON(&s); err != nil {
		log.Printf("\n\nerror parsing json: %v\n\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}
	if id != s.StationID {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("request id does not match object id")
		return
	}
	if s.StationID == 0 {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad station station id")
		return
	}
	u, err := updateStationDB(s)
	if err != nil {
		log.Printf("error updating staion: %v\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("invalid station id")
		return
	}

	ctx.Gzip(true)
	ctx.JSON(u)

}

func updateStationDB(update Station) (Station, error) {
	var existing Station
	err := db.Get(&existing, "SELECT StationID, EmptySlots, FreeBikes, Safe FROM stations WHERE StationID=$1", update.StationID)
	if err != nil {
		return Station{}, err
	}
	tx := db.MustBegin()
	tx.MustExec("UPDATE stations SET FreeBikes=$1 WHERE StationID=$2", update.FreeBikes, existing.StationID)
	tx.MustExec("UPDATE stations SET EmptySlots=$1 WHERE StationID=$2", update.EmptySlots, existing.StationID)
	tx.MustExec("UPDATE stations SET Safe=$1 WHERE StationID=$2", update.Safe, existing.StationID)
	tx.MustExec("UPDATE stations SET Open=$1 WHERE StationID=$2", update.Open, existing.StationID)
	tx.MustExec("UPDATE stations SET TimeStamp=$1 WHERE StationID=$2", time.Now().UTC(), existing.StationID)
	if err := tx.Commit(); err != nil {
		return existing, err
	}

	var updated Station
	err = db.Get(&updated, "SELECT StationID, Name, Latitude, Longitude, EmptySlots, FreeBikes, Safe, Open, TimeStamp FROM stations where StationID=$1", existing.StationID)
	if err != nil {
		return existing, err
	}

	var reviews = []Review{}
	err = db.Select(&reviews, "SELECT ReviewID, StationID, User, Body, Rating, TimeStamp FROM reviews where StationID=$1", updated.StationID)
	if err != nil {
		return existing, err
	}
	if len(reviews) != 0 {
		updated.Reviews = append(updated.Reviews, reviews...)
	}

	return updated, nil

}

func reviewStation(ctx irisctx.Context) {
	defer timeLog(time.Now(), "reviewStation")
	id := ctx.Params().Get("id")

	var review Review
	err := ctx.ReadJSON(&review)
	if err != nil {
		log.Printf("\n\nerror parsing json: %v\n\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}
	review.TimeStamp = time.Now().UTC()
	var station Station
	if err := db.Get(&station, "SELECT StationID FROM stations WHERE StationID=$1", id); err != nil {
		log.Printf("\n\nerror checking if station exists : %v\n\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}
	review.StationID = station.StationID
	tx := db.MustBegin()
	tx.MustExec("INSERT INTO reviews (StationID,TimeStamp,Body,Rating,User) VALUES ($1, $2, $3, $4, $5)",
		review.StationID,
		review.TimeStamp,
		review.Body,
		review.Rating,
		review.User)
	if err := tx.Commit(); err != nil {
		log.Printf("\n\nerror creating review: %v\n\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}

	var newReview Review
	if err := db.Get(&newReview, "Select ReviewID, StationID, User, Body, Rating, TimeStamp FROM reviews WHERE TimeStamp=$1", review.TimeStamp); err != nil {
		log.Printf("\n\nerror retriving new review: %v\n\n", err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString(err.Error())
		return
	}

	ctx.Gzip(true)
	ctx.JSON(newReview)
	return
}

func getDetail(ctx irisctx.Context) {
	defer timeLog(time.Now(), "getDetail")
	idStr := ctx.Params().Get("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("bad id: %v does not exist: %v\n", idStr, err)
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.WriteString("bad network id in requests url")
		return
	}

	var net Network
	if err := db.Get(&net, "SELECT NetworkID, Company, Name, City, Country, Latitude, Longitude, HSpan, VSpan, CenterLat, CenterLng FROM networks WHERE NetworkID=$1", id); err != nil {
		log.Printf("err retriving network with id: %v : %v\n", id, err)
		ctx.StatusCode(iris.StatusNotFound)
		ctx.WriteString("err retriving network")
		return
	}
	var stations = []Station{}
	if err := db.Select(&stations, "SELECT StationID, Name, Latitude, Longitude, EmptySlots, FreeBikes, Safe, Open, TimeStamp FROM stations where NetworkID=$1", id); err != nil {
		log.Printf("err retriving stations for network with id: %v : %v\n", id, err)
	}
	if len(stations) != 0 {
		net.Stations = append(net.Stations, stations...)
	}

	ctx.Gzip(true)
	ctx.JSON(net)
	return
}

func getNetworkList(ctx irisctx.Context) {
	defer timeLog(time.Now(), "getNetworkList")

	var NetworkList []Network
	if err := db.Select(&NetworkList, "SELECT Company, NetworkID, Name, City, Country, Latitude, Longitude, HSpan, VSpan, CenterLat, CenterLng FROM networks"); err != nil {
		log.Printf("err retriving network list from database: %v\n", err)
		ctx.StatusCode(iris.StatusNotFound)
		ctx.WriteString("err retriving network list")
		return
	}

	ctx.Gzip(true)
	ctx.JSON(NetworkList)
	return

}

func timeLog(start time.Time, name string) {
	taken := time.Since(start)
	log.Printf("%s took %s", name, taken)
}
