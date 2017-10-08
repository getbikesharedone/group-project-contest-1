package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"sync"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/kataras/iris/httptest"
	_ "github.com/mattn/go-sqlite3"
)

func TestMain(m *testing.M) {
	fmt.Println("start init")

	if _, err := os.Stat("bsn.db"); os.IsNotExist(err) {
		log.Panicf("cannot run tests without database, please run with -rebuild")
	}

	srcDB, err := os.Open("bsn.db")
	if err != nil {
		log.Panic(err)
	}
	defer srcDB.Close()

	testDB, err := os.Create("test.db")
	if err != nil {
		log.Panic(err)
	}

	if _, err = io.Copy(testDB, srcDB); err != nil {
		log.Panic(err)
	}
	err = testDB.Sync()
	if err != nil {
		log.Panic(err)

	}

	if db, err = sqlx.Open("sqlite3", "test.db"); err != nil {
		log.Fatalf("database error: %v", err)
	}

	exitStatus := m.Run()
	db.Close()
	os.Remove("test.db")
	os.Exit(exitStatus)
}

func TestIndex(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)

	// check page exists
	e.GET("/").Expect().Status(httptest.StatusOK).ContentType("text/html")

}

func TestGetNetworkList(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)

	// check response status
	rawResponse := e.GET("/api/network/").Expect().Status(httptest.StatusOK).ContentType("application/json").Body().Raw()
	// check if response is valid json
	var networks []Network
	if err := json.Unmarshal([]byte(rawResponse), &networks); err != nil {
		t.Errorf("expected to be decode into bsn network: %v", err)
	}
}

func TestGetNetworkDetail(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	type Test struct {
		id      int
		status  int
		content string
	}
	tests := []Test{{id: 20000, status: httptest.StatusNotFound, content: ""}}

	var Networks []Network
	db.Select(&Networks, "SELECT NetworkID FROM networks")

	for _, v := range Networks {
		tests = append(tests, Test{v.NetworkID, httptest.StatusOK, "application/json"})
	}

	for k, test := range tests {
		// check response status
		if k > 50 {
			break
		}
		rawResponse := e.GET("/api/network/" + strconv.Itoa(test.id)).Expect().Status(test.status).ContentType(test.content).Body().Raw()
		// check if response is valid json
		if test.status == httptest.StatusOK {
			var network Network
			if err := json.Unmarshal([]byte(rawResponse), &network); err != nil {
				t.Errorf("Failed on %v: %v expected to be decode into Network with error: %v\n ", k, test.id, err)
			}

			if network.NetworkID != test.id {
				t.Errorf("expected response to be %v but got %v", network.NetworkID, test.id)
			}
		}

	}

}

func TestGetNetworkDetailConcurrent(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	type Test struct {
		id      int
		status  int
		content string
	}
	tests := []Test{
		{id: 20000, status: httptest.StatusNotFound, content: ""},
		{id: 0, status: httptest.StatusNotFound, content: ""},
	}

	var Networks []Network
	db.Select(&Networks, "SELECT ID FROM networks")

	for _, v := range Networks {
		tests = append(tests, Test{v.NetworkID, httptest.StatusOK, "application/json"})
	}
	var wg sync.WaitGroup
	for k, testcase := range tests {
		// throw all the requests at once at server
		if k > 5 {
			break
		}
		wg.Add(1)
		go func(tc Test, tn int) {

			rawResponse := e.GET("/api/network/" + strconv.Itoa(tc.id)).Expect().Status(tc.status).ContentType(tc.content).Body().Raw()
			if tc.status == httptest.StatusOK {
				var network Network
				if err := json.Unmarshal([]byte(rawResponse), &network); err != nil {
					t.Errorf("Failed on %v: %v expected to be decode into Network with error: %v\n ", tn, tc.id, err)
				}

				if network.NetworkID != tc.id {
					t.Errorf("expected response to be %v but got %v", network.NetworkID, tc.id)
				}
			}
			wg.Done()
		}(testcase, k)

	}
	wg.Wait()
}

func TestGetStation(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	type Test struct {
		id      int
		status  int
		content string
	}
	tests := []Test{
		{id: 50000, status: httptest.StatusNotFound, content: ""},
		{id: 0, status: httptest.StatusNotFound, content: ""},
	}

	var Stations []Station
	db.Select(&Stations, "SELECT StationID FROM stations")

	for _, v := range Stations {
		tests = append(tests, Test{v.StationID, httptest.StatusOK, "application/json"})
	}
	var wg sync.WaitGroup
	for k, tc := range tests {
		if k > 100 {
			break
		}
		rawResponse := e.GET("/api/station/" + strconv.Itoa(tc.id)).Expect().Status(tc.status).ContentType(tc.content).Body().Raw()
		if tc.status == httptest.StatusOK {
			var station Station
			if err := json.Unmarshal([]byte(rawResponse), &station); err != nil {
				t.Errorf("Failed on %v: %v expected to be decode into station with error: %v\n ", k, tc.id, err)
			}

			if station.StationID != tc.id {
				t.Errorf("expected response to be %v but got %v", station.StationID, tc.id)
			}
		}
	}
	wg.Wait()
}

func TestGetStationWithBadInput(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	type Test struct {
		request string
		status  int
		content string
	}
	tests := []Test{
		{request: "50000", status: httptest.StatusNotFound, content: ""},
		{request: "0", status: httptest.StatusNotFound, content: ""},
		{request: "", status: httptest.StatusNotFound, content: ""},
		{request: "notint", status: httptest.StatusNotFound, content: ""},
	}
	for k, tc := range tests {

		response := e.GET("/api/station/" + tc.request).Expect().Status(tc.status).ContentType(tc.content).Body().Raw()
		if tc.status == httptest.StatusOK {
			var station Station
			if err := json.Unmarshal([]byte(response), &station); err != nil {
				t.Errorf("Failed on %d: %s expected to be decode into station with error: %v\n ", k, tc.request, err)
			}
		}
	}

}

func TestUpdateStationDB(t *testing.T) {

	tests := []struct {
		name  string
		input Station
		want  Station
	}{
		{
			name:  "no change",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 11, Safe: false, Open: false},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 11, Safe: false, Open: false},
		},
		{
			name:  "change Empty Slots",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 2, FreeBikes: 11, Safe: false, Open: false},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 2, FreeBikes: 11, Safe: false, Open: false},
		},
		{
			name:  "change Free Bikes",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: false, Open: false},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: false, Open: false},
		},
		{
			name:  "change Safe",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: true, Open: false},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: true, Open: false},
		},
		{
			name:  "change Open",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: true, Open: true},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 1, FreeBikes: 12, Safe: true, Open: true},
		},
		{
			name:  "change all",
			input: Station{StationID: 1, NetworkID: 1, EmptySlots: 0, FreeBikes: 0, Safe: false, Open: false},
			want:  Station{StationID: 1, NetworkID: 1, EmptySlots: 0, FreeBikes: 0, Safe: false, Open: false},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := updateStationDB(tc.input)
			if err != nil {
				t.Errorf("got and error that was unexpected :%v", err)
			}
			if got.StationID != tc.want.StationID {
				t.Errorf("updateStation(StationID) = %v, want %v", got.StationID, tc.want.StationID)
			}
			if got.EmptySlots != tc.want.EmptySlots {
				t.Errorf("updateStation(EmptySlots) = %v, want %v", got.EmptySlots, tc.want.EmptySlots)
			}
			if got.FreeBikes != tc.want.FreeBikes {
				t.Errorf("updateStation(FreeBikes) = %v, want %v", got.FreeBikes, tc.want.FreeBikes)
			}
			if got.Safe != tc.want.Safe {
				t.Errorf("updateStation(Safe) = %v, want %v", got.Safe, tc.want.Safe)
			}
			if got.Open != tc.want.Open {
				t.Errorf("updateStation(Open) = %v, want %v", got.Open, tc.want.Open)
			}
		})
	}
}

func TestUpdateStation(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	tests := []struct {
		name    string
		id      string
		req     Station
		status  int
		content string
	}{
		{name: "first station", id: "1", req: Station{StationID: 1, EmptySlots: 1200}, content: "application/json", status: 200},
		{name: "random ststion", id: "5364", req: Station{StationID: 5364, EmptySlots: 1200}, content: "application/json", status: 200},
		{name: "empty id", id: "", req: Station{StationID: 0, EmptySlots: 1200}, content: "", status: 404},
		{name: "bad id", id: "cats", req: Station{StationID: 0, EmptySlots: 1200}, content: "", status: 404},
		{name: "miss match request id and station id", id: "100", req: Station{StationID: 2, EmptySlots: 1200}, content: "", status: 400},
		{name: "missing station id", id: "0", req: Station{EmptySlots: 1200}, content: "", status: 400},
		{name: "non exist station", id: "1000000", req: Station{StationID: 1000000, EmptySlots: 1200}, content: "", status: 500},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := e.POST("/api/station/" + tt.id).WithJSON(&tt.req).Expect().Status(tt.status).ContentType(tt.content).Body().Raw()
			if tt.status == 200 {
				var got Station
				if err := json.Unmarshal([]byte(response), &got); err != nil {
					log.Println(err)
				}
				if got.EmptySlots != tt.req.EmptySlots {
					t.Errorf("expected: %v but got: %v", tt.req.EmptySlots, got.EmptySlots)
				}
				if got.FreeBikes != tt.req.FreeBikes {
					t.Errorf("expected: %v but got: %v", tt.req.FreeBikes, got.FreeBikes)
				}
				if got.Open != tt.req.Open {
					t.Errorf("expected: %v but got: %v", tt.req.Open, got.Open)
				}
				if got.Safe != tt.req.Safe {
					t.Errorf("expected: %v but got: %v", tt.req.Safe, got.Safe)
				}
				fmt.Println("GOT ", got)
			}

		})
	}
}

func TestCreateReview(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	tests := []struct {
		name    string
		id      string
		req     Review
		status  int
		content string
	}{
		{name: "test1", id: "1", req: Review{Body: "Some Review", User: "anon", Rating: 10}, content: "application/json", status: 200},
		{name: "test2", id: "2", req: Review{User: "dsfsdfsdfsdf", Body: "sdgsdgsd", Rating: 1}, content: "application/json", status: 200},

		// {name: "test1", id: "5364", req: Station{StationID: 5364, EmptySlots: 1200}, content: "application/json", status: 200},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := e.POST("/api/station/" + tt.id + "/review").WithJSON(&tt.req).Expect().Status(tt.status).ContentType(tt.content).Body().Raw()
			if tt.status == 200 {
				var got Review
				if err := json.Unmarshal([]byte(response), &got); err != nil {
					log.Println(err)
				}
				if got.Body != tt.req.Body {
					t.Errorf("expected: %v but got: %v", tt.req.Body, got.Body)
				}
				if got.User != tt.req.User {
					t.Errorf("expected: %v but got: %v", tt.req.User, got.User)
				}
				if got.Rating != tt.req.Rating {
					t.Errorf("expected: %v but got: %v", tt.req.Rating, got.Rating)
				}
				if got.ReviewID == 0 {
					t.Errorf("expected: non zero reviewID")
				}
				fmt.Printf("%+v\n ", got)
			}

		})
	}
}

func TestEditRewview(t *testing.T) {
	testsrv := newSrv(true)

	e := httptest.New(t, testsrv)
	tests := []struct {
		name    string
		id      string
		req     Review
		content string
		status  int
	}{
		{
			name:    "normal",
			id:      "1",
			req:     Review{ReviewID: 1, Body: "some body text", Rating: 12},
			content: "application/json",
			status:  200,
		},
		{
			name:    "body to long",
			id:      "1",
			req:     Review{ReviewID: 1, Body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has", Rating: 12},
			content: "",
			status:  400,
		},
		{
			name:    "wrong id",
			id:      "100000000000",
			req:     Review{ReviewID: 1000000000, Body: "It has", Rating: 12},
			content: "",
			status:  404,
		},
		{
			name:    "test for ef",
			id:      "2",
			req:     Review{User: "dsfsdfsdfsdf", Body: "3235235235", Rating: 4},
			content: "application/json",
			status:  200,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := e.PUT("/api/review/" + tt.id).WithJSON(&tt.req).Expect().Status(tt.status).ContentType(tt.content).Body().Raw()
			if tt.status == 200 {
				var got Review
				if err := json.Unmarshal([]byte(response), &got); err != nil {
					log.Println(err)
				}
				if tt.req.ReviewID == 0 && tt.id != "" {
					tt.req.ReviewID, _ = strconv.Atoi(tt.id)
				}
				if got.ReviewID != tt.req.ReviewID {
					t.Errorf("expected: %v but got: %v", tt.req.ReviewID, got.ReviewID)
				}
				if got.Body != tt.req.Body {
					t.Errorf("expected: %v but got: %v", tt.req.Body, got.Body)
				}
				if got.Rating != tt.req.Rating {
					t.Errorf("expected: %v but got: %v", tt.req.Rating, got.Rating)
				}
			}

		})
	}
}
