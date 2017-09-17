let map;
let Networks = [];
let infoOpen;

function initMap() {
  const myLatlng = {
    lat: -25.363,
    lng: 131.044,
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatlng,
    styles,
  });

  const iconBase = 'https://127.0.0.1:8080/bike.svg';
  const icons = {
    info: {
      icon: `${iconBase}bike.svg`,
    },
  };
  window.setTimeout(() => {
    load('/api/network');
  }, 1);
}

function load(url, lat, lng) {
  const xhr = new XMLHttpRequest();
  if (lat != undefined && lng != undefined) {
    url = `${url}?Lat=${lat}&Lng=${lng}&Rng=1000000`;
  }
  console.log(url);
  xhr.open('GET', url);
  xhr.responseType = 'json';

  xhr.onload = function (e) {
    if (this.status == 200) {
      console.log(this.response);
      if (this.response != null) {
        Networks = this.response;
        for (let i = 0; i < Networks.length; i++) {
          addNetworkMarker(Networks[i]);
        }
      }
    }
  };
  xhr.send();
}

function loadStations(id) {
  const xhr = new XMLHttpRequest();
  const url = `/api/network/${id}`;
  console.log(url);
  xhr.open('GET', url);
  xhr.responseType = 'json';

  xhr.onload = function (e) {
    if (this.status == 200) {
      console.log(this.response);
      if (this.response != null) {
        detail = this.response;
        for (let i = 0; i < detail.stations.length; i++) {
          addStationMarker(detail.stations[i].lat, detail.stations[i].lng, detail.stations[i]);
        }
      }
    }
  };
  xhr.send();
}

function addNetworkMarker(network) {
  const marker = new google.maps.Marker({
    position: {
      lat: network.lat,
      lng: network.lng,
    },
    map,
    title: network.id,
    icon: {
      url: 'http://127.0.0.1:9090/bike.png',
      size: new google.maps.Size(32, 32),
    },
    center: {
      lat: network.clat,
      lng: network.clng,
    },
    network,
  });

  marker.addListener('click', () => {
    // 3 seconds after the center of the map has changed, pan back to the
    window.setTimeout(() => {
      loadStations(marker.title);
      // console.log(marker.title)
    }, 1);

    window.setTimeout(() => {
      // get size of map
      const hpixelsOfMap = document.getElementById('map').offsetWidth;
      const vpixelsOfMap = document.getElementById('map').offsetHeight;
      let zoom = 1;
      const view = Math.max(network.hspan / hpixelsOfMap, network.vspan / vpixelsOfMap);
      // iterate until we find a zoom level the stations do not fit
      while (view < 156543.03392 * Math.cos(network.clat * Math.PI / 180) / Math.pow(2, zoom)) {
        console.log(zoom);
        zoom++;
        // dont know if this will work, but put here incase there is only one station
        if (zoom > 18) {
          break;
        }
      }

      // set zoom one level up
      map.setZoom(zoom - 1);
      map.panTo(marker.center);
    }, 300);
  });
}

function addStationMarker(lat, lng, station) {
  const marker = new google.maps.Marker({
    position: {
      lat,
      lng,
    },
    map,
    title: station.name,
    icon: {
      url: 'http://127.0.0.1:9090/helmet.png',
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 16),
    },
    station,
  });
  // var infowindow = new google.maps.InfoWindow({
  // 	content: "Free: "+ station.free_bikes.toString()
  // });
  marker.addListener('click', () => {
    if (typeof infowindow) {
      infowindow.open(map, marker);
    }
    // openStationEdit()
    console.log(marker.station);
  });
}
