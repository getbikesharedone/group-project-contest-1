'use strict'

const eventBus = new Vue();

Vue.component('station', {
  template: `
  <div>
  <write-review-button :station="station"></write-review-button>
  <div v-if="hasReviews">
  <div v-for="(review,index) in reviews" style="color:black">
  <review :review="review" :index="index" :station="station"></review>
  </div>
  </div>
  <p v-else style="color:black">No reviews available</p>
  </div>
  `,
  data() {
    return {
      reviews: []
    }
  },
  computed: {
    hasReviews() {
      if (this.reviews !== undefined) {
        return true
      }
      return false;
    },
  },
  created() {
    axios
      .get("/api/station/" + this.station.id)
      .then(res => {
        if (res.status == 200) {
          if (res.data != null) {
            if (res.data.reviews !== undefined) {
              this.reviews = res.data.reviews
            }
          }
        }
      })
      .catch(error => {
        this.advice = "There was an error: " + error.message;
      });

    eventBus.$on("reviewCreated" + this.station.id, review => {
      this.reviews.push(review)
    })
    eventBus.$on("reviewEdited" + this.station.id, review => {
      this.$set(this.reviews, review.index, review)
    })
  },
  props: ['station']
})

Vue.component('review', {
  template: `
  <div>
  <p>User: {{review.user}}</p>
  <p>Body: {{review.body}}</p>
  <star-rating :rating="review.rating" :read-only=true :show-rating=false></star-rating>
  <edit-review-button :station="station" :review="review" :index="index" ></edit-review-button>
  </div>
  `,
  props: ['review', 'index', 'station']
})

Vue.component('station-card', {
  template: `
  <div class="ui card">
  <div class="image">
    <img src="/images/avatar2/large/kristy.png">
  </div>
  <div class="content">
    <a class="header">Kristy</a>
    <div class="meta">
      <span class="date">Joined in 2013</span>
    </div>
    <div class="description">
      Kristy is an art director living in New York.
    </div>
  </div>
  <div class="extra content">
    <a>
      <i class="user icon"></i>
      22 Friends
    </a>
  </div>
</div>
  `
})

Vue.component('free-bikes-counter', {
  template: '<div>Free bikes: {{free}}</div>',
  props: ['station'],
  data() {
    return { free: this.station.free }
  },
  created() {
    eventBus.$on('freeUpdated', (free) => {
      this.free = free
    })
  }
})

Vue.component('update-free-bikes-button', {
  template: `
  <div style="margin:15px" class="ui right action input">
  
  <input v-model.number="free" type="text">
  <button @click="saveFree()" class="ui orange labeled icon button">
  <i class="bicycle icon"></i>
  Update Available
  </button>
  </div>
  `,
  props: ['station'],
  data() {
    return {
      free: this.station.free,
      open: this.station.open,
      safe: this.station.safe
    }
  },
  methods: {
    saveFree() {
      eventBus.$emit('freeUpdated', this.free)
      axios
        .post("/api/station/" + this.station.id, {
          id: this.station.id,
          free: this.free,
          open: this.open,
          safe: this.safe,
        })
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    },
  },
  created() {
    eventBus.$on('openToggled', (open) => {
      this.open = open
    })
    eventBus.$on('safeToggled', (safe) => {
      this.safe = safe
    })
  }
})

Vue.component('open-checkbox', {
  template: `
  <div class="ui read-only checkbox">
  <input :id="_uid" type="checkbox" v-model="open" disabled>
  <label :for="_uid">Open</label>
</div>
  `,
  props: ['station'],
  data() {
    return { open: this.station.open }
  },
  created() {
    eventBus.$on('openToggled', (open) => {
      this.open = open
    })
  }
})

Vue.component('open-checkbox-toggle', {
  template: `
  <div class="ui checkbox toggle">
  <input :id="_uid" type="checkbox" v-model="open" @change="saveOpen">
  <label :for="_uid">Open</label>
</div>
  `,
  props: ['station'],
  data() {
    return {
      free: this.station.free,
      open: this.station.open,
      safe: this.station.safe
    }
  },
  methods: {
    saveOpen() {
      eventBus.$emit('openToggled', this.open)
      axios
        .post("/api/station/" + this.station.id, {
          id: this.station.id,
          free: this.free,
          open: this.open,
          safe: this.safe,

        })
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    }
  },
  created() {
    eventBus.$on('safeToggled', (safe) => {
      this.safe = safe
    })
  }
})

Vue.component('safe-checkbox', {
  template: `
  <div class="ui checkbox">
  <input :id="_uid" type="checkbox" v-model="safe" disabled>
  <label :for="_uid">Safe</label>
</div>
  `,
  props: ['station'],
  data() {
    return { safe: this.station.safe }
  },
  created() {
    eventBus.$on('safeToggled', (safe) => {
      this.safe = safe
    })
  }
})

Vue.component('safe-checkbox-toggle', {
  template: `
  <div class="ui checkbox toggle">
  <input :id="_uid" type="checkbox" v-model="safe" @change="saveSafe">
  <label :for="_uid">Safe</label>
</div>
  `,
  props: ['station'],
  data() {
    return {
      free: this.station.free,
      open: this.station.open,
      safe: this.station.safe
    }
  },
  methods: {
    saveSafe() {
      eventBus.$emit('safeToggled', this.safe)
      axios
        .post("/api/station/" + this.station.id, {
          id: this.station.id,
          free: this.free,
          open: this.open,
          safe: this.safe,
        })
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    }
  },
  created() {
    eventBus.$on('openToggled', (open) => {
      this.open = open
    })
  }
})

Vue.component('modal', {
  template: '#modal-template'
})

Vue.component('star-rating', VueStarRating.default);

Vue.component('settings-button', {
  props: ['station', 'index'],
  template: `
  <button @click="callMultiple(station, index)" class="ui button orange">
  Settings
</button>
  `,
  methods: {
    callMultiple(station, index) {
      this.showModal(index)
    },
    showModal(index) {
      $('.ui.modal.settings.idx' + index)
        .modal('show')
        ;
    }
  }
})

Vue.component('write-review-button', {
  props: ['station'],
  template: `
  <div>
  <button @click="showModal" class="ui button orange">
  Write Review
</button>

<div :class="computedClass">
  <i class="close icon"></i>
  <div class="header">
    Write Review
  </div>
  <div class="ui form">
  <div class="field">
  <label>Name</label>
  <input type="text" name="name" placeholder="Your name" v-model="user">
</div>
  <div class="field">
    <label>Review</label>
    <textarea v-model="body" placeholder="Write a review..."></textarea>
  </div>
  <star-rating v-model="rating" :show-rating=false></star-rating>
  <button class="ui button" type="submit" @click="writeReview">Submit</button>
</div></div></div>
  `,
  created() {
  },
  data() {
    return {
      user: "",
      body: "",
      rating: -1,
      review: {}
    }
  },
  methods: {
    writeReview() {
      axios
        .post("/api/station/" + this.station.id + "/review", {
          user: this.user,
          body: this.body,
          rating: this.rating,
          index: this.index
        })
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
              this.review = res.data
              eventBus.$emit("reviewCreated" + this.station.id, this.review)
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    },
    showModal() {
      $(this.computedClassSelector)
        .modal('show')
        ;
    }
  },
  computed: {
    computedClassSelector() {
      return '.ui.modal.write-review.' + this.getUniqueId;
    },
    computedClass() {
      return 'ui modal write-review ' + this.getUniqueId;
    },
    getUniqueId() {
      return "" + this.index + this.station.id;
    }
  }
})

Vue.component('edit-review-button', {
  template: `
  <div>
  <button @click="showModal" class="ui button blue">
  Edit Review
</button>

<div :class="computedClass">
<i class="close icon"></i>
<div class="header">
  Edit Review
</div>
<div class="ui form">
<div class="field">
<label>Name</label>
<input type="text" name="name" v-model="user" disabled>
</div>
<div class="field">
  <label>Review</label>
  <textarea placeholder="Write a review..." v-model="body"></textarea>
</div>
<star-rating  :show-rating=false v-model="rating"></star-rating>
<button class="ui button" type="submit" @click="updateReview">Submit</button>
</div></div>

</div>
  `,
  data() {
    return {
      user: this.review.user,
      body: this.review.body,
      rating: this.review.rating
    }
  },
  methods: {
    showModal() {
      $(this.computedClassSelector)
        .modal('show')
        ;
    },
    updateReview() {
      axios
        .put("/api/review/" + this.review.id, {
          body: this.body,
          rating: this.rating
        })
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
              const review = {
                body: res.data.body,
                rating: res.data.rating,
                user: res.data.user,
                index: this.index
              }
              eventBus.$emit("reviewEdited" + this.station.id, review)
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    }
  },
  computed: {
    computedClassSelector() {
      return '.ui.modal.edit-review.' + this.getUniqueId;
    },
    computedClass() {
      return 'ui modal edit-review ' + this.getUniqueId;
    },
    getUniqueId() {
      return "" + this.index + this.station.id;
    }
  },
  props: ['station', 'index', 'review'],
})



Vue.component("stations-list", {
  template: `
  
  <div style="width: 100%; height: 100%;overflow-x: scroll;">

  <div class="ui styled fluid accordion">



  <table class="ui table unstackable inverted orange ">
  <thead>
    <tr><th><div class="ui horizontal yellow statistic">
    
    <div class="value">
    
      {{stations.length}}
    </div>
    <div class="label">
      Stations
    </div>
    <div class="value">
    {{networksLength}}
  </div>

  <div class="label">
    Networks
  </div>
  </div>
  </th>
  </tr></thead>
  <tbody>
  <div class="">
  <div class="ui grid">
  <div class="four wide column blackText">
  Network:
  </div>
  <div class="four wide column blackText">
    {{networkName}}
  </div>
  <div class="four wide column blackText">
  
  Company:
  </div>
  <div class="four wide column blackText">
    {{networkCompany}}
  </div>
  <div class="four wide column blackText">
  City:
</div>

<div class="four wide column blackText">
  {{networkCity}}
</div>
<div class="four wide column blackText">
Country:
</div>

<div class="four wide column blackText">
{{networkCountry}}
</div></div></div>
  <tr>
    <tr v-bind:key="station.id" style="width:95%;margin-left:auto; margin-right:auto; margin-top:15px; margin-bottom:15px" class="ui card" v-for="(station, index) in stations">
    <div v-on:click="loadReviews(station.id)" class="title">
    <td>
    
    <span class="header">{{station.name}}</span>
    <div class="ui horizontal segments">
      <div class="ui basic segment">
      <open-checkbox :station="station"></open-checkbox>
      </div>
      <div class="ui basic segment">
      <safe-checkbox :station="station"></safe-checkbox>
      </div>
      <div class="ui basic segment">
      <free-bikes-counter :station="station"></free-bikes-counter>
      </div>
    </div>
    
    
      </td>
      </div>  
  <div class=" content">
  <span>
  <settings-button :station="station" :index="index"></settings-button>
  </span>
 <station :station="station" :index="index"></station>
  </div>
  <i class="settings icon"></i>
  <div :class="'idx' + index + ' ui modal settings'">
  <i class="close icon"></i>
  <div class="header">
    Settings
  </div>
  <div style="margin:15px" class="ui form">
  <open-checkbox-toggle :station="station"></open-checkbox-toggle>
  <safe-checkbox-toggle :station="station"></safe-checkbox-toggle>
  <update-free-bikes-button :station="station"></update-free-bikes-button>
  </div>
  </div>

    </tr>
    
  </tbody>
</table>


</div></div>
    </div>
    `,
  data() {
    return {
      stations: [],
      networksLength: 0,
      isSafe: true,
      isOpen: true,
      currentStation: {},
      rating: 0,
      body: "",
      user: "",
      networkName: "",
      networkCity: "",
      networkCompany: "",
      networkCountry: ""
    };
  },
  created() {
    eventBus.$on("stationsLoaded", stations => {
      this.stations = stations
    });
    eventBus.$on("activeNetworkSelected", activeNetwork => {
      this.networkCity = activeNetwork.city
      this.networkName = activeNetwork.name
      this.networkCompany = activeNetwork.company
      this.networkCountry = activeNetwork.country
    });
    eventBus.$on("networksLoaded", networks => {
      this.networksLength = networks.length;
    });
    eventBus.$on("ratingUpdated", rating => {
      this.rating = rating
    })
  },
  mounted() {
    $('.ui.accordion')
      .accordion()

    $('.ui.modal')
      .modal()
  },
  methods: {
    loadReviews: function (stationId) {
      axios
        .get("/api/station/" + stationId)
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
              this.reviews = res.data.reviews;
              eventBus.$emit("reviewsLoaded", this.reviews);
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    }
  },
});

new Vue({
  el: "#app",
  data: {
    networks: [],
    stations: [],
    stationMarkers: [],
    selectedNetwork: null,
    showModal: false,
    map: null,
    markerCluster: null
  },
  created() {
    this.getNetworks()
  },

  methods: {
    initMap(map) {
      this.map = new google.maps.Map($('#map'), {
        zoom: 3,
        center: { lat: 0, lng: 0 }
      });
      console.log("1")
console.log(this.map)
      let networkMarkers = this.addNetworkMarkers(map);
      this.markerCluster = new MarkerClusterer(map, networkMarkers,
        { imagePath: '/m' });
        console.log("2")
        console.log(this.map)
      map.addListener('zoom_changed', () => {
        console.log(this.map)
        const zoomLevel = map.getZoom()
        const totalMarkers = this.markerCluster.getTotalMarkers()
        if (totalMarkers === 0 && zoomLevel < 10) {
          networkMarkers = this.addNetworkMarkers(map, this.networks)
          this.markerCluster = new MarkerClusterer(map, networkMarkers,
            { imagePath: '/m' })
          this.deleteStationMarkers()
        }
      });
    },
    setMapOnAll(map) {
      const stationMarkersLength = this.stationMarkers.length
      for (let i = 0; i < stationMarkersLength; i++) {
        this.stationMarkers[i].setMap(map);
      }
    },
    deleteStationMarkers() {
      this.clearStationMarkers();
      this.stationMarkers = [];
    },
    clearStationMarkers() {
      this.setMapOnAll(null);
    },
    addNetworkMarkers(map) {
      let networkMarkers = []
      const networks = this.networks;
      const networksLength = networks.length

      for (let i = 0; i < networksLength; i++) {
        const network = networks[i]
        const networkLat = network.lat
        const networkLng = network.lng
        const networkName = network.name

        const marker = new google.maps.Marker({
          position: {
            lat: networkLat,
            lng: networkLng,
          },
          map,
          title: networkName,
          icon: '/bike.png',
          network,
        })

        marker.addListener('click', (network) => {
          this.getStations(map, network)

        });

        networkMarkers.push(marker)
      }
      return networkMarkers;
    },
    addStationMarkers(map, stations) {
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i]
        let marker;
        if (station.lat !== undefined && station.lng !== undefined) {
          const lat = station.lat
          const lng = station.lng
          marker = new google.maps.Marker({
            position: {
              lat,
              lng,
            },
            map,
            title: station.name,
            icon: {
              url: '/helmet.png',
              size: new google.maps.Size(32, 32),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 16),
            },
            station,
          })
          this.stationMarkers.push(marker)
        }
      }
      return this.stationMarkers
    },
    getStations(map, network) {
      axios
        .get("/api/network/" + network.id)
        .then(res => {
          this.selectedNetwork = res.data;
          this.stations = this.selectedNetwork.stations;
        })
        .then(() => {
          this.addStationMarkers(map, this.stations)
          const bounds = new google.maps.LatLngBounds();
          const stations = this.stations;
          const stationsLength = stations.length;

          for (let i = 0; i < stationsLength; i++) {
            const stationLat = stations[i].lat;
            const stationLng = stations[i].lng;
            bounds.extend(new google.maps.LatLng(stationLat, stationLng));
          }
          map.fitBounds(bounds);
          this.markerCluster.clearMarkers()
        })
        .catch(error => {
          console.log(error)
        });
    },
    getNetworks() {
      axios
        .get("/api/network")
        .then(res => {
          this.networks = res.data;
        })
        .catch(error => {
          console.log(error)
        });
    }
  },
  mounted() {
    this.initMap(this.map)
  }
}); 