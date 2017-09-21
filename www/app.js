const eventBus = new Vue();

// Stores references so clearMarkers() can be called
let markerCluster

// Reference to map so markers can be re-added on zoom_out
let map

Vue.component('reviews-carousel', {
  template: `
  <div>
  <write-review-button :station="station" :index="index"></write-review-button>
  <div v-if="hasReviews">
  <div v-for="(review,index) in reviews" style="color:black">
  <p>User: {{review.user}}</p>
  <p>Body: {{review.body}}</p>
  <star-rating :rating="review.rating" :read-only=true :show-rating=false></star-rating>
  <edit-review-button :station="station" :review="review" :index="index" ></edit-review-button>
  </div>
  </div>
  <p v-else style="color:black">No reviews available</p>
  </div>
  `,
  props: ['station', 'index'],
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
              this.reviews = res.data.reviews // ???
            }
          }
        }
      })
      .catch(error => {
        this.advice = "There was an error: " + error.message;
      });

    eventBus.$on("reviewSubmitted" + this._uid, review => {
      if (this.reviews !== undefined) {
        this.$set(this.reviews, review.index, review)
      }
    })
    eventBus.$on("reviewCreated" + this.station.id, review => {
      this.reviews.push(review)
    })

  },
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
  props: ['station', 'index'],
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
  props: ['station', 'index', 'review'],
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
<input type="text" name="name" v-model="user">
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
  created() {
  },
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
          user: this.user,
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
              eventBus.$emit("reviewEdited", review)
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
  }
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
    <tr v-bind:key="station.id" v-bind:station="station" style="width:95%;margin-left:auto; margin-right:auto; margin-top:15px; margin-bottom:15px" class="ui card" v-for="(station, index) in stations">
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
 <reviews-carousel :station="station" :index="index"></reviews-carousel>
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
      station: {},
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

const appVue = new Vue({
  el: "#app",
  data: {
    networks: [],
    stations: [],
    stationMarkers: [],
    activeNetwork: {},
    showModal: false
  },
  created() {
    this.getNetworks()
  },

  methods: {
    initMap: function () {
      let myLatLng = { lat: 0, lng: 0 };

      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: myLatLng
      });

      networkMarkers = this.addNetworkMarkers(map, this.networks);
      markerCluster = new MarkerClusterer(map, networkMarkers,
        { imagePath: '/m' });

      const vm = this;
      map.addListener('zoom_changed', function () {
        zoomLevel = map.getZoom();
        if (markerCluster.getTotalMarkers() === 0 && zoomLevel < 10) {
          networkMarkers = vm.addNetworkMarkers(map, vm.networks)
          markerCluster = new MarkerClusterer(map, networkMarkers,
            { imagePath: '/m' })
          vm.deleteStationMarkers()
        }
      });
    },
    setMapOnAll: function (map) {
      for (var i = 0; i < this.stationMarkers.length; i++) {
        this.stationMarkers[i].setMap(map);
      }
    },
    deleteStationMarkers: function () {
      this.clearStationMarkers();
      this.stationMarkers = [];
    },
    clearStationMarkers: function () {
      this.setMapOnAll(null);
    },
    addNetworkMarkers: function (map, networks) {
      let networkMarkers = []
      const vm = this
      for (let i = 0; i < networks.length; i++) {
        const network = networks[i]

        let marker = new google.maps.Marker({
          position: {
            lat: network.lat,
            lng: network.lng,
          },
          map,
          title: network.name,
          icon: '/bike.png',
          network,
        })

        marker.addListener('click', function () {
          vm.getStations(this.network)
          eventBus.$on("stationsLoaded", function () {
            vm.addStationMarkers(map, vm.stations)
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < vm.stations.length; i++) {
              bounds.extend(new google.maps.LatLng(vm.stations[i].lat, vm.stations[i].lng));
            }
            map.fitBounds(bounds);
            markerCluster.clearMarkers()
          });
        });

        networkMarkers.push(marker)
      }
      return networkMarkers;
    },
    addStationMarkers: function (map, stations) {
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
    getStations: function (network) {
      axios
        .get("/api/network/" + network.id)
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
              this.activeNetwork = res.data;
              this.stations = res.data.stations;
              eventBus.$emit("stationsLoaded", this.stations);
              eventBus.$emit("activeNetworkSelected", this.activeNetwork);
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    },
    getNetworks: function () {
      axios
        .get("/api/network")
        .then(res => {
          if (res.status == 200) {
            if (res.data != null) {
              this.networks = res.data;
              eventBus.$emit("networksLoaded", this.networks);
            }
          }
        })
        .catch(error => {
          this.advice = "There was an error: " + error.message;
        });
    }
  },
  mounted() {
    eventBus.$on("networksLoaded", networks => {
      this.initMap()
    });
    eventBus.$on("stationsLoaded", stations => {
      this.addStationMarkers(map, stations);
    });
    eventBus.$on("clickStation", station => {
      // display modal
      this.showModal = true;

    });


  }
}); 